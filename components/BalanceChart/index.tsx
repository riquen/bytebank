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
    '/api/transactions?limit=20&page=1',
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

  const transactions = data.transactions.slice(0, 20)

  const net = transactions.reduce((acc, { amount, transaction_type }) => {
    const operator = ['PIX', 'Câmbio'].includes(transaction_type) ? -1 : 1
    return acc + operator * amount
  }, 0)

  let running = balance - net

  const points = transactions
    .slice()
    .reverse()
    .map((t) => {
      const operator = ['PIX', 'Câmbio'].includes(t.transaction_type) ? -1 : 1
      running += operator * t.amount
      return { balance: running }
    })

  const maxBalance = Math.max(...points.map((p) => p.balance))
  const minBalance = Math.min(...points.map((p) => p.balance))
  const minTick = Math.floor(minBalance / 1000) * 1000
  const maxTick = Math.ceil(maxBalance / 1000) * 1000
  const ticks: number[] = []
  for (let t = minTick; t <= maxTick; t += 1000) ticks.push(t)

  const range = maxTick - minTick || 1
  const xStep = points.length > 1 ? 100 / (points.length - 1) : 100

  const polylinePoints = points
    .map((p, i) => {
      const x = i * xStep
      const y = ((maxTick - p.balance) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="w-full flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Desempenho Financeiro</h2>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-48 text-tomato overflow-visible"
      >
        {ticks.map((t) => {
          const y = ((maxTick - t) / range) * 100
          return (
            <g key={t}>
              <line
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e5e5"
                strokeWidth={0.5}
              />
              <text
                x="-2"
                y={y}
                fontSize="3"
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#6b7280"
              >
                {t}
              </text>
            </g>
          )
        })}
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          points={polylinePoints}
        />
      </svg>
    </div>
  )
}
