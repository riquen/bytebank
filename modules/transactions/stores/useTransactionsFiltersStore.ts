import { createWithEqualityFn } from 'zustand/traditional'
import type { TransactionsFilters } from '@/modules/transactions/domain/entities'

export type PeriodOption = '' | '7' | '15' | '30'

type TransactionsFiltersState = {
  period: PeriodOption
  transactionType: string
  filters: TransactionsFilters
}

type TransactionsFiltersActions = {
  setPeriod: (period: PeriodOption) => void
  setTransactionType: (transactionType: string) => void
  reset: () => void
}

const buildFilters = (
  period: PeriodOption,
  transactionType: string,
): TransactionsFilters => ({
  ...(period ? { period: Number(period) as 7 | 15 | 30 } : {}),
  ...(transactionType ? { transactionType } : {}),
})

const INITIAL_PERIOD: PeriodOption = ''
const INITIAL_TRANSACTION_TYPE = ''

export type TransactionsFiltersStore =
  TransactionsFiltersState & TransactionsFiltersActions

export const useTransactionsFiltersStore = createWithEqualityFn<TransactionsFiltersStore>((set) => ({
  period: INITIAL_PERIOD,
  transactionType: INITIAL_TRANSACTION_TYPE,
  filters: {},
  setPeriod: (period) =>
    set((state) => ({
      period,
      filters: buildFilters(period, state.transactionType),
    })),
  setTransactionType: (transactionType) =>
    set((state) => ({
      transactionType,
      filters: buildFilters(state.period, transactionType),
    })),
  reset: () =>
    set(() => ({
      period: INITIAL_PERIOD,
      transactionType: INITIAL_TRANSACTION_TYPE,
      filters: {},
    })),
}))
