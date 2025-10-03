import type { Transaction } from '../entities'
import type { TransactionRepository } from '../repositories'

interface GetTransactionByIdInput {
  transactionId: string
}

export class GetTransactionByIdUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute({ transactionId }: GetTransactionByIdInput): Promise<Transaction | null> {
    return this.repository.getById(transactionId)
  }
}
