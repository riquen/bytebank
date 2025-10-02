import useSWRInfinite from 'swr/infinite'
import { fetcher } from '@/utils/fetcher'
import type {
  GetResponse,
  TransactionData,
  TransactionsFilters,
} from '@/app/api/transactions/types'
import { SWR_KEYS } from '@/utils/swr-keys'

export const LIMIT = 5

export function useTransactions(filters: TransactionsFilters = {}) {
  const getKey = (pageIndex: number, previousPage: GetResponse | null) => {
    if (previousPage && !previousPage.hasMore) return null

    const params = new URLSearchParams({
      limit: LIMIT.toString(),
      page: (pageIndex + 1).toString(),
    })

    if (filters.period) params.set('period', String(filters.period))
    if (filters.transactionType)
      params.set('transactionType', filters.transactionType)

    return `${SWR_KEYS.transactions}?${params.toString()}`
  }

  const { data, setSize, mutate, isValidating } = useSWRInfinite<GetResponse>(
    getKey,
    fetcher,
    { revalidateFirstPage: false },
  )

  const transactions: TransactionData[] =
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
