'use client'

import { useEffect } from 'react'
import type { TransactionEvent } from '../events/transaction-events'
import { transactionEvents$ } from '../events/transaction-events'

export function useTransactionEvents(
  callback: (event: TransactionEvent) => void,
) {
  useEffect(() => {
    const subscription = transactionEvents$.subscribe(callback)

    return () => {
      subscription.unsubscribe()
    }
  }, [callback])
}
