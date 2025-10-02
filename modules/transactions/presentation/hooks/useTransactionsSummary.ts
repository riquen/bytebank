import useSWR from 'swr'
import type { TransactionsSummary } from '../../domain/entities'
import { getTransactionsSummaryUseCase } from '../../infrastructure/dependencies'
import { SWR_KEYS } from '@/utils/swr-keys'

export function useTransactionsSummary() {
  const { data, error, isLoading } = useSWR<TransactionsSummary>(
    SWR_KEYS.summary,
    () => getTransactionsSummaryUseCase.execute(),
    { revalidateOnFocus: false },
  )

  return {
    amounts: data?.amounts ?? {},
    totalAmount: data?.totalAmount ?? 0,
    isLoading,
    error,
  }
}
