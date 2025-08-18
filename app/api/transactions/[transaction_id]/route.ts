import { type NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'
import type { PostRequestBody, TransactionData } from '../types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> },
) {
  const { supabase, user } = await requireSession()

  const { transaction_id } = await params

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_id', transaction_id)
    .eq('profile_id', user?.id)
    .single()

  if (error || !data) {
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
    const { supabase, user } = await requireSession()

    const { transaction_id } = await params
    const { amount, transaction_type }: PostRequestBody = await request.json()

    if (transaction_type) {
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
    }

    const { data: updated, error } = await supabase
      .from('transactions')
      .update({ amount, transaction_type })
      .eq('transaction_id', transaction_id)
      .eq('profile_id', user?.id)
      .select('*')
      .single()

    if (error || !updated) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, transaction: updated })
  } catch {
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
    const { supabase, user } = await requireSession()

    const { transaction_id } = await params

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transaction_id)
      .eq('profile_id', user?.id)

    if (error) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao deletar transação' },
      { status: 500 },
    )
  }
}
