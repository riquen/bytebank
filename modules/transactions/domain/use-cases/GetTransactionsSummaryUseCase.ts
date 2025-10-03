import type { TransactionsSummary } from '../entities'
import type { TransactionRepository } from '../repositories'

export class GetTransactionsSummaryUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(): Promise<TransactionsSummary> {
    return this.repository.getSummary()
  }
}
