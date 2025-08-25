import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import type { TransactionsCount } from '@/app/api/transactions/summary/types'
import { SWR_KEYS } from './swr-keys'

export function useTransactionsSummary() {
  const { data, error, isLoading } = useSWR<TransactionsCount>(
    SWR_KEYS.summary,
    fetcher,
    { revalidateOnFocus: false },
  )

  return {
    counts: data?.counts ?? {},
    total: data?.total ?? 0,
    isLoading,
    error,
  }
}
