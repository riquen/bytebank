export interface TransactionData {
  transaction_id: string
  amount: string
  transaction_type: 'PIX' | 'Aplicação' | 'Câmbio'
  date: string
}

export interface GetResponse {
  transactions: TransactionData[]
  hasMore: boolean
}

export interface PostRequestBody {
  amount: string
  transaction_type: TransactionData['transaction_type']
}
