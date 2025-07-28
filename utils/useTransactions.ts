import useSWRInfinite from 'swr/infinite'
import { fetcher } from '@/utils/fetcher'
import type { GetResponse, TransactionData } from '@/app/api/transactions/types'

export const LIMIT = 5
const getKey = (pageIndex: number, previousPage: GetResponse | null) => {
  if (previousPage && !previousPage.hasMore) return null

  const params = new URLSearchParams({
    limit: LIMIT.toString(),
    page: (pageIndex + 1).toString(),
  })

  return `/api/transactions?${params.toString()}`
}

export function useTransactions() {
  const { data, error, size, setSize, mutate, isValidating } =
    useSWRInfinite<GetResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
    })

  const transactions: TransactionData[] =
    data?.flatMap((page) => page.transactions) ?? []
  const hasMore = data ? data[data.length - 1].hasMore : true

  return {
    transactions,
    error,
    size,
    setSize,
    hasMore,
    mutate,
    isValidating,
  }
}
