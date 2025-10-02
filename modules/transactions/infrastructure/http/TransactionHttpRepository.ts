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

  async list({
    page,
    limit,
    filters,
  }: {
    page: number
    limit: number
    filters?: TransactionsFilters
  }): Promise<TransactionListResult> {
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

    return {
      transactions: data.transactions.map(mapTransaction),
      hasMore: data.hasMore,
    }
  }

  async getById(transactionId: string): Promise<Transaction | null> {
    const response = await fetch(`${this.baseUrl}/${transactionId}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error('Erro ao buscar transação')
    }

    const data = (await response.json()) as Transaction

    return mapTransaction(data)
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

    return mapTransaction(result.transaction)
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

    return mapTransaction(result.transaction)
  }

  async delete(transactionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${transactionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Erro ao remover transação')
    }
  }

  async getSummary(): Promise<TransactionsSummary> {
    const response = await fetch(SWR_KEYS.summary)

    if (!response.ok) {
      throw new Error('Erro ao buscar resumo de transações')
    }

    const data = (await response.json()) as TransactionsSummary

    return { ...data, amounts: { ...data.amounts } }
  }
}
