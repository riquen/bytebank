'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isHome = pathname === '/'

  const getKey = (pageIndex: number, prevPage: GetResponse | null) => {
    if (prevPage && !prevPage.hasMore) return null

    const params = new URLSearchParams({ limit: LIMIT.toString() })

    if (isHome) {
      params.set('latest', 'true')
    } else {
      params.set('page', String(pageIndex + 1))
    }

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
    data?.flatMap((item) => item.transactions) ?? []
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
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

  if (!data && !error) return <Loader />

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
      {!isHome && isValidating && <Loader size="sm" />}
      {!isHome && !hasMore && (
        <p className="text-center text-sm text-battleship-gray">
          {transactions.length === 0
            ? '— Você ainda não possui transações —'
            : '— Fim do extrato —'}
        </p>
      )}
    </div>
  )
}
