import { Subject } from 'rxjs'
import type { Transaction } from '../../domain/entities'

type TransactionEventType = 'created' | 'updated' | 'deleted'

export interface TransactionEvent {
  type: TransactionEventType
  transaction?: Transaction
  transactionId?: string
}

const transactionSubject = new Subject<TransactionEvent>()

export const transactionEvents$ = transactionSubject.asObservable()

export const emitTransactionEvent = (event: TransactionEvent) => {
  transactionSubject.next(event)
}
