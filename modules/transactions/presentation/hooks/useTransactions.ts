import { useCallback, useMemo } from 'react'
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite'
import type {
  Transaction,
  TransactionListResult,
  TransactionsFilters,
} from '../../domain/entities'
import { getTransactionsUseCase } from '../../infrastructure/dependencies'
import { useTransactionEvents } from './useTransactionEvents'
import type { TransactionEvent } from '../events/transaction-events'

export const LIMIT = 5

type TransactionsKey = [string, number, TransactionsFilters]

export function useTransactions(filters: TransactionsFilters = {}) {
  const { period, transactionType } = filters
  const normalizedFilters = useMemo<TransactionsFilters>(
    () => ({
      ...(period ? { period } : {}),
      ...(transactionType ? { transactionType } : {}),
    }),
    [period, transactionType],
  )

  const getKey: SWRInfiniteKeyLoader<
    TransactionListResult,
    TransactionsKey | null
  > = (pageIndex, previousPage) => {
    if (previousPage && !previousPage.hasMore) return null

    return ['transactions', pageIndex + 1, normalizedFilters]
  }

  const { data, setSize, mutate, isValidating } = useSWRInfinite<
    TransactionListResult,
    Error,
    typeof getKey
  >(
    getKey,
    async ([, page, currentFilters]) =>
      getTransactionsUseCase.execute({
        page,
        limit: LIMIT,
        filters: currentFilters,
      }),
    { revalidateFirstPage: false },
  )

  const transactions: Transaction[] =
    data?.flatMap((page) => page.transactions) ?? []
  const hasMore = data ? data[data.length - 1].hasMore : true

  const matchesFilters = useCallback(
    (transactionToCheck: Transaction) => {
      if (
        normalizedFilters.transactionType &&
        transactionToCheck.transaction_type !==
          normalizedFilters.transactionType
      ) {
        return false
      }

      if (normalizedFilters.period) {
        const createdAt = Date.parse(transactionToCheck.created_at)
        if (Number.isNaN(createdAt)) return false

        const diffInMs = Date.now() - createdAt
        const limitInMs = normalizedFilters.period * 24 * 60 * 60 * 1000

        if (diffInMs > limitInMs) {
          return false
        }
      }

      return true
    },
    [normalizedFilters.period, normalizedFilters.transactionType],
  )

  const handleTransactionEvent = useCallback(
    ({ type, transaction, transactionId }: TransactionEvent) => {
      if (type === 'deleted' && transactionId) {
        mutate(
          (current) => {
            if (!current) return current

            let hasChanges = false

            const updatedPages = current.map((page) => {
              const filteredTransactions = page.transactions.filter(
                (item) => item.transaction_id !== transactionId,
              )

              if (filteredTransactions.length !== page.transactions.length) {
                hasChanges = true
                return { ...page, transactions: filteredTransactions }
              }

              return page
            })

            return hasChanges ? updatedPages : current
          },
          { revalidate: true },
        )
        return
      }

      if ((type === 'updated' || type === 'created') && transaction) {
        if (type === 'created' && !matchesFilters(transaction)) {
          void mutate()
          return
        }

        mutate(
          (current) => {
            if (!current) return current

            let hasChanges = false

            const updatedPages = current.map((page, index) => {
              const transactionIndex = page.transactions.findIndex(
                (item) => item.transaction_id === transaction.transaction_id,
              )

              if (transactionIndex === -1) {
                if (index === 0 && type === 'created') {
                  hasChanges = true
                  return {
                    ...page,
                    transactions: [
                      transaction,
                      ...page.transactions.slice(0, LIMIT - 1),
                    ],
                  }
                }

                return page
              }

              hasChanges = true
              const updatedTransactions = [...page.transactions]
              updatedTransactions[transactionIndex] = transaction

              return { ...page, transactions: updatedTransactions }
            })

            return hasChanges ? updatedPages : current
          },
          { revalidate: true },
        )
        return
      }

      void mutate()
    },
    [matchesFilters, mutate],
  )

  useTransactionEvents(handleTransactionEvent)

  return {
    transactions,
    setSize,
    hasMore,
    mutate,
    isValidating,
  }
}
