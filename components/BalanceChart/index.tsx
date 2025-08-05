'use client'

import useSWR from 'swr'
import { Loader } from '@/components/Loader'
import { fetcher } from '@/utils/fetcher'
import type { GetResponse } from '@/app/api/transactions/types'

interface BalanceChartProps {
  balance: number
}

export const BalanceChart = ({ balance }: BalanceChartProps) => {
  const { data } = useSWR<GetResponse>(
    '/api/transactions?limit=100&page=1',
    fetcher,
  )

  if (!data) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="font-bold text-2xl">Desempenho Financeiro</h2>
        <Loader size="sm" />
      </div>
    )
  }

  if (data.transactions.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="font-bold text-2xl">Desempenho Financeiro</h2>
        <p className="text-sm text-battleship-gray text-center">
          — Sem transações —
        </p>
      </div>
    )
  }

  const net = data.transactions.reduce((acc, { amount, transaction_type }) => {
    const operator = ['PIX', 'Câmbio'].includes(transaction_type) ? -1 : 1
    return acc + operator * amount
  }, 0)

  let running = balance - net

  const points = data.transactions
    .slice()
    .reverse()
    .map((t) => {
      const operator = ['PIX', 'Câmbio'].includes(t.transaction_type) ? -1 : 1
      running += operator * t.amount
      return { date: t.date, balance: running }
    })

  const maxBalance = Math.max(...points.map((p) => p.balance))
  const minBalance = Math.min(...points.map((p) => p.balance))
  const xStep = points.length > 1 ? 100 / (points.length - 1) : 100

  const polylinePoints = points
    .map((p, i) => {
      const x = i * xStep
      const range = maxBalance - minBalance || 1
      const y = ((maxBalance - p.balance) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Desempenho Financeiro</h2>
      <svg viewBox="0 0 100 100" className="w-full h-48 text-tomato">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          points={polylinePoints}
        />
      </svg>
      <div className="flex justify-between text-xs">
        {points.map((p) => (
          <span key={p.date}>{p.date}</span>
        ))}
      </div>
    </div>
  )
}
