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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error()

      await localMutate()

      if (!isHome) {
        await globalMutate('/api/transactions?latest=true')
      }
      toast.success('Transação removida!')
    } catch {
      toast.error('Não foi possível excluir')
    }
  }

  if (!data) return <Loader />

  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Extrato</h2>
        {isHome && (
          <button
            disabled={isValidating}
            onClick={() => localMutate()}
            className="px-2 py-1 rounded bg-foreground font-semibold text-white disabled:opacity-50 focus:outline-none"
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
                  className="focus:outline-none"
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
      {!isHome && !hasMore && transactions.length > 0 && (
        <p className="text-center text-sm text-battleship-gray">
          — Fim do extrato —
        </p>
      )}
    </div>
  )
}
