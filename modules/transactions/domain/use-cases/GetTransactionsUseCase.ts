import type { TransactionListResult, TransactionsFilters } from '../entities'
import type { TransactionRepository } from '../repositories'

interface GetTransactionsInput {
  page: number
  limit: number
  filters?: TransactionsFilters
}

export class GetTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(params: GetTransactionsInput): Promise<TransactionListResult> {
    return this.repository.list(params)
  }
}
