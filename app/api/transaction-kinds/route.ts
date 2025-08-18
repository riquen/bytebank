import { NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'

export async function GET() {
  const { supabase } = await requireSession()

  const { data, error } = await supabase
    .from('transaction_kinds')
    .select('code, label, direction')
    .order('label', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar tipos' }, { status: 500 })
  }

  return NextResponse.json({ kinds: data })
}
