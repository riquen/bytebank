import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { GetResponse, PostRequestBody } from './types'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = parseInt(url.searchParams.get('limit') ?? '5', 10)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }

  const hasMore = to + 1 < (count ?? 0)

  return NextResponse.json<GetResponse>({ transactions: data, hasMore })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, transaction_type }: PostRequestBody = await request.json()

    if (amount <= 0 || !transaction_type) {
      return NextResponse.json(
        { error: 'Verifique os campos e tente novamente' },
        { status: 400 },
      )
    }

    const { data: transaction, error: errorTransaction } = await supabase
      .from('transactions')
      .insert([
        {
          amount,
          transaction_type,
          date: new Date().toLocaleDateString('pt-BR'),
        },
      ])
      .select('*')
      .single()

    if (errorTransaction || !transaction) {
      console.error(errorTransaction)
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 },
      )
    }

    const { data: user, error: errorUser } = await supabase
      .from('user')
      .select('user_id, balance')
      .single()

    if (errorUser || user === null) {
      console.error(errorUser)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    const operator = ['PIX', 'Câmbio'].includes(transaction.transaction_type)
      ? -1
      : +1
    const newBalance = user.balance + operator * transaction.amount

    const { error } = await supabase
      .from('user')
      .update({ balance: newBalance })
      .eq('user_id', user.user_id)
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: 201,
      success: true,
      transaction,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 },
    )
  }
}
