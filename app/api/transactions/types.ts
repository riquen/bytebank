export interface TransactionData {
  transaction_id: string
  created_at: string
  amount: number
  transaction_type: 'PIX' | 'Aplicação' | 'Câmbio' | 'Depósito'
}

export interface GetResponse {
  transactions: TransactionData[]
  hasMore: boolean
}

export interface PostRequestBody {
  amount: number
  transaction_type: TransactionData['transaction_type']
}
