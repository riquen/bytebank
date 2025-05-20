import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'
import { type HomeData } from './types'

export async function GET() {
  try {
    const name = faker.person.firstName()

    const now = new Date()
    const date = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const dateFormatted = date[0].toUpperCase() + date.slice(1)

    const rawValue = faker.finance.amount({ min: 0, max: 10000 })
    const balance = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(rawValue))

    return NextResponse.json<HomeData>({
      name,
      date: dateFormatted,
      balance,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Não foi possível gerar os dados iniciais' },
      { status: 500 },
    )
  }
}
