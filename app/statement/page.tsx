'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { formatCurrency } from '@/utils/currency'
import { useTransactions } from '@/utils/useTransactions'
import { isOutgoing } from '@/utils/signed-amount'
import Edit from '@/public/static/icons/edit.svg'
import Delete from '@/public/static/icons/delete.svg'
import { Loader } from '@/components/Loader'
import { formatBRDateFromISO } from '@/utils/date'

export default function Statement() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  const { mutate: mutateHome } = useSWRConfig()

  const {
    transactions,
    hasMore,
    size,
    setSize,
    mutate: mutateTransactions,
    isValidating,
  } = useTransactions()

  const { ref, inView } = useInView({ rootMargin: '200px' })

  useEffect(() => {
    if (isHome) return
    if (inView && hasMore && !isValidating) setSize(size + 1)
  }, [isHome, inView, hasMore, isValidating, size, setSize])

  const handleDelete = async (transaction_id: string) => {
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
    }
  }

  if (!transactions) return <Loader />

  const transactionsList = isHome ? transactions.slice(0, 5) : transactions

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Extrato</h2>
      <div className="flex flex-col gap-4">
        {transactionsList.length === 0 ? (
          <p className="text-center text-sm text-battleship-gray">
            — Você ainda não possui transações —
          </p>
        ) : (
          transactionsList.map(
            ({ transaction_id, created_at, amount, transaction_type }) => {
              const isOutflow = isOutgoing(transaction_type)
              const operator = isOutflow ? '-' : '+'
              const amountColor = isOutflow ? 'text-rojo' : 'text-kelly-green'

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
                      className="p-px rounded-full cursor-pointer focus:outline-none active:bg-foreground/20 hover:bg-foreground/20 transition-colors"
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
                      className="p-px rounded-full cursor-pointer focus:outline-none active:bg-foreground/20 hover:bg-foreground/20 transition-colors"
                    >
                      <Image
                        src={Delete}
                        alt="Delete"
                        style={imageHelper.intrinsic}
                      />
                    </button>
                  </div>
                </div>
              )
            },
          )
        )}
      </div>
      {!isHome && !hasMore && transactions.length > 0 && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
      {!isHome && <div ref={ref} />}
    </div>
  )
}
