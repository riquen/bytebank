import { TransactionData } from '@/app/api/transactions/types'

export const isOutgoing = (
  transactionType: TransactionData['transaction_type'],
) => ['PIX', 'Câmbio'].includes(transactionType)

export const signedAmount = (
  transactionType: TransactionData['transaction_type'],
  amount: TransactionData['amount'],
) => (isOutgoing(transactionType) ? -1 : 1) * amount
