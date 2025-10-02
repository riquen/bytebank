import type {
  Transaction,
  TransactionListResult,
  TransactionsFilters,
  TransactionsSummary,
} from '../entities'

export interface TransactionRepository {
  list(params: {
    page: number
    limit: number
    filters?: TransactionsFilters
  }): Promise<TransactionListResult>
  getById(transactionId: string): Promise<Transaction | null>
  create(data: { amount: number; transaction_type: string }): Promise<Transaction>
  update(
    transactionId: string,
    data: { amount: number; transaction_type: string },
  ): Promise<Transaction>
  delete(transactionId: string): Promise<void>
  getSummary(): Promise<TransactionsSummary>
}
