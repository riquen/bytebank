import useSWR from 'swr'
import type { TransactionKind } from '../../domain/entities'
import { getTransactionKindsUseCase } from '../../infrastructure/dependencies'
import { SWR_KEYS } from '@/utils/swr-keys'

export function useTransactionKinds() {
  const { data, error, isLoading } = useSWR<TransactionKind[]>(
    SWR_KEYS.transactionKinds,
    () => getTransactionKindsUseCase.execute(),
  )

  return { kinds: data ?? [], error, isLoading }
}
