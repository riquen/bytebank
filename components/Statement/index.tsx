'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import Edit from '@/public/static/icons/edit.svg'
import Delete from '@/public/static/icons/delete.svg'
import { useInView } from 'react-intersection-observer'
import { type TransactionData } from '@/app/api/transactions/types'
import { Loader } from '@/components/Loader'
import { toast } from 'react-toastify'

interface StatementProps {
  refreshKey?: number
}

const LIMIT = 5

export const Statement: React.FC<StatementProps> = ({ refreshKey }) => {
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

      const response = await fetch(`/api/transactions?${params}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Erro ao buscar extrato')

      const { transactions: batch, hasMore: more } = await response.json()

      setTransactions((prev) =>
        page === 1 || isHome ? batch : [...prev, ...batch],
      )

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
    if (
      !isHome &&
      inView &&
      hasMore &&
      !loading &&
      transactions.length >= page * LIMIT
    ) {
      setPage((prev) => prev + 1)
    }
  }, [inView, hasMore, loading, isHome, page, transactions.length])

  useEffect(() => {
    if (refreshKey !== undefined) {
      setPage(1)
      fetchPage()
    }
  }, [refreshKey, fetchPage])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Falha ao excluir')

        setTransactions((prev) =>
          prev.filter((transaction) => transaction.id !== id),
        )

        await fetchPage()

        toast.success('Transação removida!')
      } catch (err) {
        console.error(err)
        toast.error('Não foi possível excluir')
      }
    },
    [fetchPage],
  )

  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Extrato</h2>
      <div className="flex flex-col gap-4">
        {transactions.length === 0 && isHome ? (
          <p className="text-center text-sm text-battleship-gray">
            — Você ainda não possui transações —
          </p>
        ) : (
          transactions.map(({ id, amount, type, date }) => (
            <div
              key={id}
              className="flex items-center justify-between border-b border-moss-green py-2"
            >
              <div>
                <p>{type}</p>
                <p className="font-semibold">{amount}</p>
                <p className="text-xs text-battleship-gray">{date}</p>
              </div>
              <div className="flex gap-4">
                <Image src={Edit} alt="Edit" style={imageHelper.intrinsic} />
                <button
                  onClick={() => handleDelete(id)}
                  aria-label="Deletar transação"
                >
                  <Image
                    src={Delete}
                    alt="Delete"
                    style={imageHelper.intrinsic}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {!isHome && <div ref={ref} className="h-px w-full" aria-hidden="true" />}
      {!isHome && loading && <Loader size="sm" />}
      {!isHome && !loading && !hasMore && (
        <p className="text-center text-sm text-battleship-gray">
          —{' '}
          {transactions.length === 0
            ? 'Você ainda não possui transações'
            : 'Fim do extrato'}{' '}
          —
        </p>
      )}
    </div>
  )
}
