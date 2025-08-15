'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { formatCurrency } from '@/utils/currency'
import { useTransactions } from '@/utils/useTransactions'
import Edit from '@/public/static/icons/edit.svg'
import Delete from '@/public/static/icons/delete.svg'
import { Loader } from '@/components/Loader'
import { formatBRDateFromISO } from '@/utils/date'
import { useTransactionKinds } from '@/utils/useTransactionKinds'

export default function Statement() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  const { mutate: mutateHome } = useSWRConfig()
  const { ref, inView } = useInView({ rootMargin: '200px' })

  const {
    transactions,
    hasMore,
    setSize,
    mutate: mutateTransactions,
    isValidating,
  } = useTransactions()

  const { kinds } = useTransactionKinds()
  const flowMap = useMemo(
    () => new Map(kinds.map((kind) => [kind.code, kind.direction])),
    [kinds],
  )

  const transactionsList = isHome ? transactions.slice(0, 5) : transactions

  const isLoadingMore =
    !isHome && isValidating && hasMore && transactionsList.length > 0

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (transaction_id: string) => {
    if (deletingId) return
    setDeletingId(transaction_id)

    try {
      const response = await fetch(`/api/transactions/${transaction_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error()

      toast.success('Transação removida!')
      await mutateTransactions()
      mutateHome('/api')
    } catch {
      toast.error('Não foi possível excluir')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (isHome) return
    if (inView && hasMore && !isValidating) setSize((prevSize) => prevSize + 1)
  }, [isHome, inView, hasMore, isValidating, setSize])

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Extrato</h2>
      {isValidating && transactionsList.length === 0 ? (
        <Loader size="sm" />
      ) : (
        <div className="flex flex-col gap-4">
          {transactionsList.length === 0 ? (
            <p className="text-center text-sm text-battleship-gray">
              — Você ainda não possui transações —
            </p>
          ) : (
            transactionsList.map(
              ({ transaction_id, created_at, amount, transaction_type }) => {
                const isOutflow = flowMap.get(transaction_type) === 'outflow'
                const operator = isOutflow ? '-' : '+'
                const amountColor = isOutflow ? 'text-rojo' : 'text-kelly-green'
                const isDeleting = deletingId === transaction_id

                return (
                  <div
                    key={transaction_id}
                    className="flex items-center justify-between border-b border-foreground py-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:w-full">
                      <p className="sm:flex-1">{transaction_type}</p>
                      <p className={`sm:flex-1 font-semibold ${amountColor}`}>
                        {`${operator}${formatCurrency(amount)}`}
                      </p>
                      <p className="sm:flex-1 text-xs text-battleship-gray">
                        {formatBRDateFromISO(created_at)}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          router.push(
                            `/new-transaction?transaction_id=${transaction_id}`,
                          )
                        }}
                        aria-label="Editar transação"
                        className="p-px rounded-full cursor-pointer focus:outline-none active:bg-foreground/20 hover:bg-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!deletingId}
                      >
                        <Image
                          src={Edit}
                          alt="Edit"
                          style={imageHelper.intrinsic}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction_id)}
                        aria-label="Deletar transação"
                        className="p-px rounded-full cursor-pointer focus:outline-none active:bg-foreground/20 hover:bg-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!deletingId}
                      >
                        {isDeleting ? (
                          <Loader size="sm" />
                        ) : (
                          <Image
                            src={Delete}
                            alt="Delete"
                            style={imageHelper.intrinsic}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                )
              },
            )
          )}
        </div>
      )}
      {!isHome && hasMore && (
        <>
          <div ref={ref} />
          {isLoadingMore && <Loader size="sm" />}
        </>
      )}
      {!isHome && !hasMore && transactions.length > 0 && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
    </div>
  )
}
