export interface TransactionKind {
  code: string
  label: string
  direction: 'inflow' | 'outflow'
}
