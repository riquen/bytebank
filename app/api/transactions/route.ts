import { type NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'
import { sinceStartOfNDaysAgoUTC } from '@/utils/timezone-range'
import type { GetResponse, PostRequestBody } from './types'

export async function GET(request: NextRequest) {
  const { supabase, user } = await requireSession()

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = parseInt(url.searchParams.get('limit') ?? '5', 10)
  const transactionTypeParam = url.searchParams.get('transactionType') ?? ''
  const periodParam = url.searchParams.get('period') ?? ''

  const allowedPeriods = new Set(['7', '15', '30'])
  const period = allowedPeriods.has(periodParam)
    ? Number(periodParam)
    : undefined

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('profile_id', user?.id)

  if (transactionTypeParam) {
    query = query.eq('transaction_type', transactionTypeParam)
  }

  if (period) {
    const sinceUTC = sinceStartOfNDaysAgoUTC(period)

    query = query.gte('created_at', sinceUTC.toISOString())
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }

  const hasMore = to + 1 < (count ?? 0)

  return NextResponse.json<GetResponse>({ transactions: data ?? [], hasMore })
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireSession()

    const { amount, transaction_type }: PostRequestBody = await request.json()

    if (amount <= 0 || !transaction_type) {
      return NextResponse.json(
        { error: 'Verifique os campos e tente novamente' },
        { status: 400 },
      )
    }

    const { data: kind } = await supabase
      .from('transaction_kinds')
      .select('code')
      .eq('code', transaction_type)
      .single()

    if (!kind) {
      return NextResponse.json(
        { error: 'Tipo de transação inválido' },
        { status: 400 },
      )
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{ amount, transaction_type, profile_id: user?.id }])
      .select('*')
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, transaction }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 },
    )
  }
}
