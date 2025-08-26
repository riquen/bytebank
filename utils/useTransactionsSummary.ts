import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import type { TransactionsSummary } from '@/app/api/transactions/summary/types'
import { SWR_KEYS } from './swr-keys'

export function useTransactionsSummary() {
  const { data, error, isLoading } = useSWR<TransactionsSummary>(
    SWR_KEYS.summary,
    fetcher,
    { revalidateOnFocus: false },
  )

  return {
    amounts: data?.amounts ?? {},
    totalAmount: data?.totalAmount ?? 0,
    isLoading,
    error,
  }
}
