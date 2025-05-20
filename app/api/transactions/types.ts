export interface TransactionData {
  id: string
  amount: string
  type: 'PIX' | 'Aplicação' | 'Câmbio'
  date: string
}

export interface GetResponse {
  transactions: TransactionData[]
  hasMore: boolean
}

export interface PostRequestBody {
  amount: string
  transactionType: TransactionData['type']
}
