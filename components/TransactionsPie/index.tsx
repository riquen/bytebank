'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Loader } from '@/components/Loader'
import { useTransactionsSummary } from '@/utils/useTransactionsSummary'
import { useTransactionKinds } from '@/utils/useTransactionKinds'

const PALETTE = [
  'var(--persian-green)',
  'var(--sandy-brown)',
  'var(--charcoal)',
  'var(--burnt-sienna)',
]

export function TransactionsPie() {
  const { counts, total, isLoading: loadingSummary } = useTransactionsSummary()
  const { kinds, isLoading: loadingKinds } = useTransactionKinds()

  const data = kinds
    .map((kind) => ({ name: kind.label, value: counts[kind.code] ?? 0 }))
    .filter((item) => item.value > 0)

  const isLoading = loadingSummary || loadingKinds

  return (
    <div className="flex flex-col sm:basis-1/2 gap-4 p-6 bg-white rounded-lg shadow-md">
      {isLoading && data.length === 0 ? (
        <Loader size="sm" />
      ) : (
        <>
          {data.length === 0 ? (
            <p className="text-center text-sm text-battleship-gray">
              — Você ainda não possui transações —
            </p>
          ) : (
            <>
              <div>
                <p className="text-end text-sm text-battleship-gray">
                  Últimos 30 dias
                </p>
                <p className="text-end text-sm text-battleship-gray">
                  Total de transações: {total}
                </p>
              </div>
              <div className="h-96 sm:h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ value }) => value}
                      className="outline-none"
                    >
                      {data.map(({ name }, index) => (
                        <Cell
                          key={name}
                          fill={PALETTE[index % PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
