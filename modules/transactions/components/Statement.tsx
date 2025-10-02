'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { formatCurrency } from '@/utils/currency'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import Edit from '@/public/static/icons/edit.svg'
import Delete from '@/public/static/icons/delete.svg'
import { Loader } from '@/components/Loader'
import { formatBRDateFromISO } from '@/utils/date'
import { useTransactionKinds } from '@/modules/transactions/hooks/useTransactionKinds'
import {
  useTransactionsFiltersStore,
  type TransactionsFiltersStore,
} from '@/modules/transactions/stores/useTransactionsFiltersStore'
import { shallow } from 'zustand/shallow'
import { SWR_KEYS } from '@/utils/swr-keys'

const selectTransactionsFilters = (state: TransactionsFiltersStore) => ({
  period: state.period,
  transactionTypeFilter: state.transactionType,
  setPeriod: state.setPeriod,
  setTransactionTypeFilter: state.setTransactionType,
  filters: state.filters,
})

export function Statement() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  const { mutate: mutateHome } = useSWRConfig()
  const { ref, inView } = useInView({ rootMargin: '200px' })

  const { period, transactionTypeFilter, setPeriod, setTransactionTypeFilter, filters } =
    useTransactionsFiltersStore(selectTransactionsFilters, shallow)

  const {
    transactions,
    hasMore,
    setSize,
    mutate: mutateTransactions,
    isValidating,
  } = useTransactions(isHome ? {} : filters)

  const { kinds, isLoading: loadingKinds } = useTransactionKinds()
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
      const response = await fetch(
        `${SWR_KEYS.transactions}/${transaction_id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) throw new Error()

      await mutateTransactions()
      mutateHome(SWR_KEYS.home)
      mutateHome(SWR_KEYS.summary)
      toast.success('Transação removida!')
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

  useEffect(() => {
    if (isHome) return
    setSize(1)
  }, [period, transactionTypeFilter, isHome, setSize])

  return (
    <div className="flex flex-col sm:basis-1/2 gap-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="font-bold text-2xl">Extrato</h2>
        {!isHome && (
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              id="period"
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as '' | '7' | '15' | '30')
              }
              className="py-2 pl-3 pr-6 bg-white border border-foreground rounded-lg text-foreground appearance-none bg-[url('/static/icons/arrow-down.svg')] bg-no-repeat bg-right focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
            >
              <option value="">Todos os períodos</option>
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
            <select
              id="transactionTypeFilter"
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              className="py-2 pl-3 pr-6 bg-white border border-foreground rounded-lg text-foreground appearance-none bg-[url('/static/icons/arrow-down.svg')] bg-no-repeat bg-right focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
              disabled={loadingKinds}
            >
              <option value="">Todos os tipos</option>
              {kinds.map((kind) => (
                <option key={kind.code} value={kind.code}>
                  {kind.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
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
                    <div
                      className={`flex flex-col ${isHome ? 'lg:flex-row lg:items-center lg:w-full' : 'sm:flex-row sm:items-center sm:w-full'}`}
                    >
                      <p className={`${isHome ? 'lg:flex-1' : 'sm:flex-1'}`}>
                        {transaction_type}
                      </p>
                      <p
                        className={`${isHome ? 'lg:flex-1' : 'sm:flex-1'} font-semibold ${amountColor}`}
                      >
                        {`${operator}${formatCurrency(amount)}`}
                      </p>
                      <p
                        className={`${isHome ? 'lg:flex-1' : 'sm:flex-1'} text-xs text-battleship-gray`}
                      >
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
