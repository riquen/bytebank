import type { Transaction } from '../entities'
import type { TransactionRepository } from '../repositories'

interface SaveTransactionInput {
  amount: number
  transaction_type: string
}

interface SaveTransactionParams extends SaveTransactionInput {
  transactionId?: string
}

export class SaveTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute({ transactionId, ...data }: SaveTransactionParams): Promise<Transaction> {
    if (transactionId) {
      return this.repository.update(transactionId, data)
    }

    return this.repository.create(data)
  }
}
