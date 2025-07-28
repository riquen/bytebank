'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function Statement() {
  const router = useRouter()
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
    if (inView && hasMore && !isValidating) setSize(size + 1)
  }, [inView, hasMore, isValidating, size, setSize])

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

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl">Extrato</h2>
      <div className="flex flex-col gap-4">
        {transactions.length === 0 ? (
          <p className="text-center text-sm text-battleship-gray">
            — Você ainda não possui transações —
          </p>
        ) : (
          transactions.map(
            ({ transaction_id, amount, transaction_type, date }) => (
              <div
                key={transaction_id}
                className="flex items-center justify-between border-b border-moss-green py-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:w-full">
                  <p className="sm:flex-1">{transaction_type}</p>
                  <p className="sm:flex-1 font-semibold">
                    {formatCurrency(amount)}
                  </p>
                  <p className="sm:flex-1 text-xs text-battleship-gray">
                    {date}
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
            ),
          )
        )}
      </div>
      {!hasMore && transactions.length > 0 && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
      <div ref={ref} />
    </div>
  )
}
