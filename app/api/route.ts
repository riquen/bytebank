import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'

export interface HomeData {
  name: string
  date: string
  balance: string
}

export async function GET(): Promise<NextResponse<HomeData>> {
  const name = faker.person.firstName()

  const now = new Date()
  const date = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const dateFormatted = date[0].toUpperCase() + date.slice(1)

  const rawValue = faker.finance.amount({ min: 0, max: 10000 })
  const balance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(rawValue))

  return NextResponse.json({
    name,
    date: dateFormatted,
    balance
  })
}
