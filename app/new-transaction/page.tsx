'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { formatCurrency } from '@/utils/currency'
import { fetcher } from '@/utils/fetcher'
import { useTransactions } from '@/utils/useTransactions'
import { useTransactionKinds } from '@/utils/useTransactionKinds'
import { Loader } from '@/components/Loader'
import Card from '@/public/static/images/card.png'
import PixelsLight from '@/public/static/images/pixels-light.png'
import type { TransactionData } from '@/app/api/transactions/types'

export default function Statement() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const transaction_id = searchParams.get('transaction_id') ?? undefined
  const isHome = pathname === '/'
  const isEdit = Boolean(transaction_id)

  const { mutate: mutateHome } = useSWRConfig()
  const { mutate: mutateTransactions } = useTransactions()

  const { data: transaction, isLoading: transactionLoading } =
    useSWR<TransactionData>(
      transaction_id ? `/api/transactions/${transaction_id}` : null,
      fetcher,
    )

  const { kinds, isLoading: loadingKinds } = useTransactionKinds()

  const [amountFormatted, setAmountFormatted] = useState('')
  const [transactionType, setTransactionType] = useState('')

  useEffect(() => {
    if (!transactionLoading && transaction) {
      setAmountFormatted(formatCurrency(transaction.amount))
      setTransactionType(transaction.transaction_type)
    }
  }, [transactionLoading, transaction])

  const { trigger: saveTransaction, isMutating: saving } = useSWRMutation<
    unknown,
    any,
    string,
    { amount: number; transaction_type: string }
  >(
    transaction_id
      ? `/api/transactions/${transaction_id}`
      : '/api/transactions',
    async (url, { arg }) => {
      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      return response.json()
    },
  )

  const handleSubmit = useCallback(async () => {
    const raw = amountFormatted.replace(/\D/g, '')
    const amount = Number(raw) / 100
    if (amount <= 0 || !transactionType) return

    try {
      await saveTransaction({ amount, transaction_type: transactionType })
      toast.success(
        `Transação ${isEdit ? 'atualizada' : 'adicionada'} com sucesso!`,
      )

      await mutateTransactions()
      mutateHome('/api')

      setAmountFormatted('')
      setTransactionType('')

      if (isEdit) router.back()
    } catch {
      toast.error('Erro ao salvar transação')
    }
  }, [
    amountFormatted,
    transactionType,
    isEdit,
    saveTransaction,
    mutateTransactions,
    mutateHome,
    router,
  ])

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '')
    const number = Number(onlyNums) / 100
    setAmountFormatted(formatCurrency(number))
  }

  if (transactionLoading) return <Loader />

  const canSubmit =
    !saving &&
    transactionType !== '' &&
    Number(amountFormatted.replace(/\D/g, '')) > 0

  return (
    <div
      className={`relative flex flex-col gap-20 sm:gap-4 p-6 bg-silver rounded-lg shadow-md sm:basis-1/2 ${!isHome && 'sm:flex-row sm:justify-between lg:justify-around'}`}
    >
      <div
        className={`flex flex-col gap-6 text-center ${!isHome && 'sm:basis-1/2 lg:max-w-lg'}`}
      >
        <h2 className="font-bold text-2xl text-foreground">
          {isEdit ? 'Editar transação' : 'Nova transação'}
        </h2>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          value={amountFormatted}
          onChange={handleValueChange}
          placeholder="R$ 0,00"
          maxLength={14}
          className="py-2 bg-white border border-foreground rounded-lg text-center text-foreground focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
        />
        <select
          id="transactionType"
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="py-2 pl-3 bg-white border border-foreground rounded-lg text-foreground appearance-none bg-[url('/static/icons/arrow-down.svg')] bg-no-repeat bg-right focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
          disabled={loadingKinds}
        >
          <option value="" disabled>
            Selecione o tipo de transação
          </option>
          {kinds.map((kind) => (
            <option key={kind.code} value={kind.code}>
              {kind.label}
            </option>
          ))}
        </select>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="py-2 rounded-lg bg-foreground cursor-pointer font-semibold text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 hover:opacity-80 transition-opacity"
        >
          {saving ? <Loader size="sm" color="background" /> : 'Salvar'}
        </button>
      </div>
      <Image
        src={Card}
        alt="Card"
        style={imageHelper.intrinsic}
        className="z-1"
      />
      <Image
        src={PixelsLight}
        alt="Pixels light"
        style={imageHelper.intrinsic}
        className="absolute bottom-0 right-0"
      />
    </div>
  )
}
