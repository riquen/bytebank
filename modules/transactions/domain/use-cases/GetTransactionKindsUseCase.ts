import type { TransactionKind } from '../entities'
import type { TransactionKindRepository } from '../repositories'

export class GetTransactionKindsUseCase {
  constructor(private readonly repository: TransactionKindRepository) {}

  execute(): Promise<TransactionKind[]> {
    return this.repository.list()
  }
}
