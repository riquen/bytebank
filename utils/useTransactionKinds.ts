import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import type { Kind } from '@/app/api/transaction-kinds/types'

export function useTransactionKinds() {
  const { data, error, isLoading } = useSWR<{ kinds: Kind[] }>(
    '/api/transaction-kinds',
    fetcher,
  )

  return { kinds: data?.kinds ?? [], error, isLoading }
}
