import { SWR_KEYS } from '@/utils/swr-keys'
import type { TransactionKind } from '../../domain/entities'
import type { TransactionKindRepository } from '../../domain/repositories'

interface TransactionKindsResponse {
  kinds: TransactionKind[]
}

export class TransactionKindHttpRepository
  implements TransactionKindRepository
{
  async list(): Promise<TransactionKind[]> {
    const response = await fetch(SWR_KEYS.transactionKinds)

    if (!response.ok) {
      throw new Error('Erro ao buscar tipos de transação')
    }

    const data = (await response.json()) as TransactionKindsResponse

    return data.kinds.map((kind) => ({ ...kind }))
  }
}
