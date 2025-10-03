import { SWR_KEYS } from '@/utils/swr-keys'
import type {
  Transaction,
  TransactionListResult,
  TransactionsFilters,
  TransactionsSummary,
} from '../../domain/entities'
import type { TransactionRepository } from '../../domain/repositories'

interface ListResponse {
  transactions: Transaction[]
  hasMore: boolean
}

interface MutationResponse {
  success: boolean
  transaction: Transaction
}

function mapTransaction(transaction: Transaction): Transaction {
  return { ...transaction }
}

export class TransactionHttpRepository implements TransactionRepository {
  private readonly baseUrl = SWR_KEYS.transactions
  private readonly cache = new Map<string, { timestamp: number; data: unknown }>()
  private static readonly CACHE_TTL_MS = 30_000

  private static readonly LIST_CACHE_PREFIX = 'transactions:list:'
  private static readonly TRANSACTION_CACHE_PREFIX = 'transactions:item:'
  private static readonly SUMMARY_CACHE_KEY = 'transactions:summary'

  private static getCacheKey(prefix: string, value: string) {
    return `${prefix}${value}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)

    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp >
      TransactionHttpRepository.CACHE_TTL_MS

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  private setCache<T>(key: string, data: T) {
    this.cache.set(key, { timestamp: Date.now(), data })
  }

  private invalidateCache(prefix?: string) {
    if (!prefix) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  private cloneTransactions(transactions: Transaction[]) {
    return transactions.map(mapTransaction)
  }

  async list({
    page,
    limit,
    filters,
  }: {
    page: number
    limit: number
    filters?: TransactionsFilters
  }): Promise<TransactionListResult> {
    const cacheKey = TransactionHttpRepository.getCacheKey(
      TransactionHttpRepository.LIST_CACHE_PREFIX,
      JSON.stringify({ page, limit, filters }),
    )

    const cachedResult = this.getFromCache<TransactionListResult>(cacheKey)

    if (cachedResult) {
      return {
        hasMore: cachedResult.hasMore,
        transactions: this.cloneTransactions(cachedResult.transactions),
      }
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })

    if (filters?.period) params.set('period', String(filters.period))
    if (filters?.transactionType)
      params.set('transactionType', filters.transactionType)

    const response = await fetch(`${this.baseUrl}?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Erro ao buscar transações')
    }

    const data = (await response.json()) as ListResponse

    const result = {
      transactions: data.transactions.map(mapTransaction),
      hasMore: data.hasMore,
    }

    this.setCache(cacheKey, result)

    return result
  }

  async getById(transactionId: string): Promise<Transaction | null> {
    const cacheKey = TransactionHttpRepository.getCacheKey(
      TransactionHttpRepository.TRANSACTION_CACHE_PREFIX,
      transactionId,
    )

    const cachedTransaction = this.getFromCache<Transaction | null>(cacheKey)

    if (cachedTransaction) {
      return mapTransaction(cachedTransaction)
    }

    const response = await fetch(`${this.baseUrl}/${transactionId}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error('Erro ao buscar transação')
    }

    const data = (await response.json()) as Transaction

    const transaction = mapTransaction(data)

    this.setCache(cacheKey, transaction)

    return transaction
  }

  async create(data: {
    amount: number
    transaction_type: string
  }): Promise<Transaction> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar transação')
    }

    const result = (await response.json()) as MutationResponse
    const transaction = mapTransaction(result.transaction)

    this.invalidateCache(TransactionHttpRepository.LIST_CACHE_PREFIX)
    this.invalidateCache(TransactionHttpRepository.SUMMARY_CACHE_KEY)
    this.setCache(
      TransactionHttpRepository.getCacheKey(
        TransactionHttpRepository.TRANSACTION_CACHE_PREFIX,
        transaction.transaction_id,
      ),
      transaction,
    )

    return transaction
  }

  async update(
    transactionId: string,
    data: { amount: number; transaction_type: string },
  ): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/${transactionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar transação')
    }

    const result = (await response.json()) as MutationResponse
    const transaction = mapTransaction(result.transaction)

    this.invalidateCache(TransactionHttpRepository.LIST_CACHE_PREFIX)
    this.invalidateCache(TransactionHttpRepository.SUMMARY_CACHE_KEY)
    this.setCache(
      TransactionHttpRepository.getCacheKey(
        TransactionHttpRepository.TRANSACTION_CACHE_PREFIX,
        transactionId,
      ),
      transaction,
    )

    return transaction
  }

  async delete(transactionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${transactionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Erro ao remover transação')
    }

    this.invalidateCache(TransactionHttpRepository.LIST_CACHE_PREFIX)
    this.invalidateCache(TransactionHttpRepository.SUMMARY_CACHE_KEY)
    this.cache.delete(
      TransactionHttpRepository.getCacheKey(
        TransactionHttpRepository.TRANSACTION_CACHE_PREFIX,
        transactionId,
      ),
    )
  }

  async getSummary(): Promise<TransactionsSummary> {
    const cachedSummary = this.getFromCache<TransactionsSummary>(
      TransactionHttpRepository.SUMMARY_CACHE_KEY,
    )

    if (cachedSummary) {
      return {
        ...cachedSummary,
        amounts: { ...cachedSummary.amounts },
      }
    }

    const response = await fetch(SWR_KEYS.summary)

    if (!response.ok) {
      throw new Error('Erro ao buscar resumo de transações')
    }

    const data = (await response.json()) as TransactionsSummary

    const summary = { ...data, amounts: { ...data.amounts } }

    this.setCache(TransactionHttpRepository.SUMMARY_CACHE_KEY, summary)

    return summary
  }
}
