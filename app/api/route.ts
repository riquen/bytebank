import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { type HomeData } from './types'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('name, balance')
      .single()

    if (error || !data) {
      console.error(error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados' },
        { status: 500 },
      )
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
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao buscar dados iniciais' },
      { status: 500 },
    )
  }
}
