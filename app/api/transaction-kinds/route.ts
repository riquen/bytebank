import { NextResponse } from 'next/server'
import { requireUser } from '@/utils/require-user'

export async function GET() {
  const { supabase, user } = await requireUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('transaction_kinds')
    .select('code, label, direction')
    .order('label', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar tipos' }, { status: 500 })
  }

  return NextResponse.json({ kinds: data })
}
