import type { TransactionRepository } from '../repositories'

interface DeleteTransactionInput {
  transactionId: string
}

export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute({ transactionId }: DeleteTransactionInput): Promise<void> {
    return this.repository.delete(transactionId)
  }
}
