import { NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'
import { sinceStartOfNDaysAgoUTC } from '@/utils/timezone-range'
import { type TransactionsCount } from './types'

export async function GET() {
  const { supabase, user } = await requireSession()

  const sinceUTC = sinceStartOfNDaysAgoUTC(30)

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('transaction_type')
    .eq('profile_id', user?.id)
    .gte('created_at', sinceUTC.toISOString())

  if (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }

  const counts = (transactions ?? []).reduce<TransactionsCount['counts']>(
    (acc, { transaction_type }) => {
      acc[transaction_type] = (acc[transaction_type] ?? 0) + 1

      return acc
    },
    {},
  )

  const body: TransactionsCount = {
    total: transactions?.length ?? 0,
    counts,
  }

  return NextResponse.json(body)
}
