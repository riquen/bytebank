'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import Edit from '@/public/static/icons/edit.svg'
import Delete from '@/public/static/icons/delete.svg'
import type { GetResponse, TransactionData } from '@/app/api/transactions/types'
import { Loader } from '@/components/Loader'

const LIMIT = 5
const fetcher = (url: string) =>
  fetch(url).then((response) => response.json() as Promise<GetResponse>)

export default function Statement() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  const getKey = (pageIndex: number, prevPage: GetResponse | null) => {
    if (prevPage && !prevPage.hasMore) return null

    const params = new URLSearchParams({ limit: LIMIT.toString() })

    isHome
      ? params.set('latest', 'true')
      : params.set('page', String(pageIndex + 1))

    return `/api/transactions?${params.toString()}`
  }

  const {
    data,
    error,
    size,
    setSize,
    mutate: localMutate,
    isValidating,
  } = useSWRInfinite(getKey, fetcher, { revalidateFirstPage: isHome })
  const { mutate: globalMutate } = useSWRConfig()

  const transactions: TransactionData[] =
    data?.flatMap((page) => page.transactions) ?? []
  const hasMore = data ? data[data.length - 1].hasMore : true

  const { ref, inView } = useInView({
    rootMargin: '200px',
    threshold: 0,
  })

  useEffect(() => {
    if (!isHome && inView && hasMore && !isValidating && !error) {
      setSize(size + 1)
    }
  }, [inView, hasMore, isValidating, error, isHome, size, setSize])

  const handleDelete = async (transaction_id: string) => {
    try {
      const response = await fetch(`/api/transactions/${transaction_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error()

      await localMutate()
      await globalMutate(
        (key: string) => key.startsWith('/api/transactions'),
        undefined,
        { revalidate: true },
      )
      toast.success('Transação removida!')
    } catch {
      toast.error('Não foi possível excluir')
    }
  }

  if (!data) return <Loader />

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Extrato</h2>
        {isHome && (
          <button
            disabled={isValidating}
            onClick={() => localMutate()}
            className="px-2 py-1 rounded bg-foreground cursor-pointer font-semibold text-white disabled:opacity-50 focus:outline-none hover:opacity-80 transition-opacity"
          >
            {isValidating ? (
              <Loader size="sm" color="background" />
            ) : (
              'Atualizar'
            )}
          </button>
        )}
      </div>
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
                  <p className="sm:flex-1 font-semibold">{amount}</p>
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
      {!isHome && <div ref={ref} className="h-px w-full" aria-hidden="true" />}
      {!isHome && isValidating && <Loader size="sm" />}
      {!isHome && !hasMore && transactions.length > 0 && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
    </div>
  )
}
