import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import type {
  Transaction,
  TransactionListResult,
  TransactionsFilters,
} from '../../domain/entities'
import { getTransactionsUseCase } from '../../infrastructure/dependencies'

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

  const getKey = (
    pageIndex: number,
    previousPage: TransactionListResult | null,
  ): TransactionsKey | null => {
    if (previousPage && !previousPage.hasMore) return null

    return ['transactions', pageIndex + 1, normalizedFilters]
  }

  const { data, setSize, mutate, isValidating } = useSWRInfinite<
    TransactionListResult,
    Error,
    TransactionsKey
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

  return {
    transactions,
    setSize,
    hasMore,
    mutate,
    isValidating,
  }
}
