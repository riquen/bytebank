import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { PostRequestBody, TransactionData } from '../types'
import { signedAmount } from '@/utils/signed-amount'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  const { transaction_id } = await params

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_id', transaction_id)
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Transação não encontrada' },
      { status: 404 },
    )
  }

  return NextResponse.json<TransactionData>(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  try {
    const { transaction_id } = await params
    const { amount, transaction_type }: PostRequestBody = await request.json()

    const { data: oldTransaction, error: errorOldTransaction } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .eq('transaction_id', transaction_id)
      .single()

    if (errorOldTransaction || !oldTransaction) {
      console.error(errorOldTransaction)
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    const { data: newTransaction, error: errorNewTransaction } = await supabase
      .from('transactions')
      .update({ amount, transaction_type })
      .eq('transaction_id', transaction_id)
      .select('*')
      .single()

    if (errorNewTransaction || !newTransaction) {
      console.error(errorNewTransaction)
      return NextResponse.json(
        { error: 'Erro ao atualizar transação' },
        { status: 404 },
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

    const updatedBalance =
      user.balance +
      signedAmount(newTransaction.transaction_type, newTransaction.amount)

    const { error } = await supabase
      .from('user')
      .update({ balance: updatedBalance })
      .eq('user_id', user.user_id)
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, transaction: newTransaction })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao atualizar transação' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  try {
    const { transaction_id } = await params

    const { data: transaction, error: errorTransaction } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .eq('transaction_id', transaction_id)
      .single()

    if (errorTransaction || !transaction) {
      console.error(errorTransaction)
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
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

    const updatedBalance =
      user.balance -
      signedAmount(transaction.transaction_type, transaction.amount)

    const { error: errorDelete } = await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transaction_id)

    if (errorDelete) {
      console.error(errorDelete)
      return NextResponse.json(
        { error: 'Erro ao deletar transação' },
        { status: 500 },
      )
    }

    const { error } = await supabase
      .from('user')
      .update({ balance: updatedBalance })
      .eq('user_id', user.user_id)
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao deletar transação' },
      { status: 500 },
    )
  }
}
