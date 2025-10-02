import useSWR from 'swr'
import type { Transaction } from '../../domain/entities'
import { getTransactionByIdUseCase } from '../../infrastructure/dependencies'

export function useTransaction(transactionId?: string) {
  const key = transactionId ? (['transaction', transactionId] as const) : null

  return useSWR<Transaction | null>(
    key,
    ([, id]: readonly [string, string]) =>
      getTransactionByIdUseCase.execute({ transactionId: id }),
  )
}
