import { NextResponse } from 'next/server'
import { requireSession } from '@/utils/require-session'
import { type HomeData } from './types'

export async function GET() {
  const { supabase, user } = await requireSession()

  const { data, error } = await supabase
    .from('profiles')
    .select('name, balance')
    .eq('id', user?.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }

  const now = new Date()
  const date = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const dateFormatted = date[0].toUpperCase() + date.slice(1)

  return NextResponse.json<HomeData>({
    name: data.name,
    date: dateFormatted,
    balance: data.balance,
  })
}
