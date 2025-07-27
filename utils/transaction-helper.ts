import type { TransactionData } from '@/app/api/transactions/types'

export const transactionHelper = {
  parseAmount: (value: string) => Number(value.replace(/\D/g, '')) / 100,
  formatAmount: (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value),
  isOutgoing: (type: TransactionData['transaction_type']) =>
    type === 'PIX' || type === 'Câmbio',
}
