export interface Transaction {
  transaction_id: string
  profile_id: string
  created_at: string
  amount: number
  transaction_type: string
}

export interface TransactionListResult {
  transactions: Transaction[]
  hasMore: boolean
}
