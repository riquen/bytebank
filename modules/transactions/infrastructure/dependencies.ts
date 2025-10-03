import {
  DeleteTransactionUseCase,
  GetTransactionByIdUseCase,
  GetTransactionsSummaryUseCase,
  GetTransactionsUseCase,
  GetTransactionKindsUseCase,
  SaveTransactionUseCase,
} from '../domain/use-cases'
import { TransactionHttpRepository } from './http/TransactionHttpRepository'
import { TransactionKindHttpRepository } from './http/TransactionKindHttpRepository'

const transactionRepository = new TransactionHttpRepository()
const transactionKindRepository = new TransactionKindHttpRepository()

export const getTransactionsUseCase = new GetTransactionsUseCase(
  transactionRepository,
)
export const getTransactionByIdUseCase = new GetTransactionByIdUseCase(
  transactionRepository,
)
export const saveTransactionUseCase = new SaveTransactionUseCase(
  transactionRepository,
)
export const deleteTransactionUseCase = new DeleteTransactionUseCase(
  transactionRepository,
)
export const getTransactionKindsUseCase = new GetTransactionKindsUseCase(
  transactionKindRepository,
)
export const getTransactionsSummaryUseCase = new GetTransactionsSummaryUseCase(
  transactionRepository,
)
