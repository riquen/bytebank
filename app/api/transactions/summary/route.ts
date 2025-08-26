import { NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'
import { sinceStartOfNDaysAgoUTC } from '@/utils/timezone-range'
import { type TransactionsSummary } from './types'

export async function GET() {
  const { supabase, user } = await requireSession()

  const sinceUTC = sinceStartOfNDaysAgoUTC(30)

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('transaction_type, amount')
    .eq('profile_id', user?.id)
    .gte('created_at', sinceUTC.toISOString())

  if (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }

  const { totalAmount, amounts } = (
    transactions ?? []
  ).reduce<TransactionsSummary>(
    (acc, { transaction_type, amount }) => {
      acc.amounts[transaction_type] =
        (acc.amounts[transaction_type] ?? 0) + amount
      acc.totalAmount += amount

      return acc
    },
    { amounts: {}, totalAmount: 0 },
  )

  const body: TransactionsSummary = { totalAmount, amounts }

  return NextResponse.json(body)
}
