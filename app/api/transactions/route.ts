import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { GetResponse, PostRequestBody } from './types'
import { transactionHelper } from '@/utils/transaction-helper'

export async function GET(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, transaction_type }: PostRequestBody = await request.json()

    if (!amount || !transaction_type) {
      return NextResponse.json(
        { error: 'Verifique os campos e tente novamente' },
        { status: 400 },
      )
    }

    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, balance')
      .limit(1)
      .single()

    if (userError) {
      console.error(userError)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 },
      )
    }

    const amountNumber = transactionHelper.parseAmount(amount)
    const balanceNumber = transactionHelper.parseAmount(user.balance)
    const delta = transactionHelper.isOutgoing(transaction_type)
      ? -amountNumber
      : amountNumber
    const newBalance = balanceNumber + delta

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          amount,
          transaction_type: transaction_type,
          date: new Date().toLocaleDateString('pt-BR'),
        },
      ])
      .select('*')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 },
      )
    }

    const { error: balanceError } = await supabase
      .from('user')
      .update({ balance: transactionHelper.formatAmount(newBalance) })
      .eq('id', user.id)

    if (balanceError) {
      console.error(balanceError)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: 201,
      success: true,
      transaction: data,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 },
    )
  }
}
