export interface TransactionData {
  transaction_id: string
  profile_id: string
  created_at: string
  amount: number
  transaction_type: string
}

export interface GetResponse {
  transactions: TransactionData[]
  hasMore: boolean
}

export interface PostRequestBody {
  amount: number
  transaction_type: string
}

export interface TransactionsFilters {
  period?: 7 | 15 | 30
  transactionType?: string
}
