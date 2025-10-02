import type { TransactionKind } from '../entities'

export interface TransactionKindRepository {
  list(): Promise<TransactionKind[]>
}
