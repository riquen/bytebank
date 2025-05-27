import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { PostRequestBody, TransactionData } from '../types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  try {
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
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao buscar transação' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  try {
    const { transaction_id } = await params
    const { amount, transaction_type }: PostRequestBody = await request.json()

    const updates = { amount, transaction_type }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_id', transaction_id)
      .select('*')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, transaction: data })
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

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transaction_id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
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
