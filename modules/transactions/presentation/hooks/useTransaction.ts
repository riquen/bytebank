import useSWR from 'swr'
import type { Transaction } from '../../domain/entities'
import { getTransactionByIdUseCase } from '../../infrastructure/dependencies'

export function useTransaction(transactionId?: string) {
  return useSWR<Transaction | null>(
    transactionId ? ['transaction', transactionId] : null,
    ([, id]) => getTransactionByIdUseCase.execute({ transactionId: id }),
  )
}
