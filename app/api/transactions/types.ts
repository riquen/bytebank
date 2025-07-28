export interface TransactionData {
  transaction_id: string
  amount: number
  transaction_type: 'PIX' | 'Aplicação' | 'Câmbio' | 'Depósito'
  date: string
}

export interface GetResponse {
  transactions: TransactionData[]
  hasMore: boolean
}

export interface PostRequestBody {
  amount: number
  transaction_type: TransactionData['transaction_type']
}
