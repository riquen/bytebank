'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { type TransactionData } from '../api/transactions/route'
import { Loader } from '@/components/Loader'

export default function Statement() {
  const LIMIT = 5
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const { ref, inView } = useInView({
    rootMargin: '200px',
    threshold: 0,
  })

  useEffect(() => {
    setTransactions([])
    setPage(1)
    setHasMore(true)
  }, [pathname])

  const fetchPage = useCallback(async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({ limit: LIMIT.toString() })

      if (isHome) {
        params.set('latest', 'true')
      } else {
        params.set('page', page.toString())
      }

      const response = await fetch(`/api/transactions?${params}`)
      if (!response.ok) throw new Error('Erro ao buscar extrato')

      const { transactions: batch, hasMore: more } = await response.json()

      if (isHome) {
        setTransactions(batch)
      } else {
        setTransactions((prev) => [...prev, ...batch])
      }

      setHasMore(more)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [isHome, page])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  useEffect(() => {
    if (inView && hasMore && !loading && !isHome) {
      setPage((prev) => prev + 1)
    }
  }, [inView, hasMore, loading, isHome])

  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Extrato</h2>
      <div className="flex flex-col gap-4">
        {transactions.map(({ amount, type, date }, index) => (
          <div
            key={`${index}-${type}->${amount}`}
            className="flex items-center justify-between border-b border-moss-green py-2"
          >
            <div>
              <p>{type}</p>
              <p className="font-semibold">{amount}</p>
              <p className="text-xs text-battleship-gray">{date}</p>
            </div>
          </div>
        ))}
      </div>
      {!isHome && <div ref={ref} className="h-px w-full" aria-hidden="true" />}
      {!isHome && loading && <Loader size="sm" />}
      {!isHome && !loading && !hasMore && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
    </div>
  )
}
