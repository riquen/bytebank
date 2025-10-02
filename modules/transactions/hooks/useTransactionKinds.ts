import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import type { Kind } from '@/app/api/transaction-kinds/types'
import { SWR_KEYS } from '@/utils/swr-keys'

export function useTransactionKinds() {
  const { data, error, isLoading } = useSWR<{ kinds: Kind[] }>(
    SWR_KEYS.transactionKinds,
    fetcher,
  )

  return { kinds: data?.kinds ?? [], error, isLoading }
}
