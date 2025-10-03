import { useCallback } from 'react'
import useSWR from 'swr'
import type { TransactionsSummary } from '../../domain/entities'
import { getTransactionsSummaryUseCase } from '../../infrastructure/dependencies'
import { SWR_KEYS } from '@/utils/swr-keys'
import { useTransactionEvents } from './useTransactionEvents'

export function useTransactionsSummary() {
  const { data, error, isLoading, mutate } = useSWR<TransactionsSummary>(
    SWR_KEYS.summary,
    () => getTransactionsSummaryUseCase.execute(),
    { revalidateOnFocus: false },
  )

  const handleTransactionEvent = useCallback(() => {
    void mutate()
  }, [mutate])

  useTransactionEvents(handleTransactionEvent)

  return {
    amounts: data?.amounts ?? {},
    totalAmount: data?.totalAmount ?? 0,
    isLoading,
    error,
  }
}
