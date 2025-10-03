'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { formatCurrency } from '@/utils/currency'
import {
  useTransaction,
  useTransactionKinds,
} from '@/modules/transactions/presentation/hooks'
import { Loader } from '@/components/Loader'
import Card from '@/public/static/images/card.png'
import PixelsLight from '@/public/static/images/pixels-light.png'
import { saveTransactionUseCase } from '@/modules/transactions/infrastructure/dependencies'
import { emitTransactionEvent } from '@/modules/transactions/presentation/events/transaction-events'
import type { Transaction } from '@/modules/transactions/domain/entities'

interface NewTransactionProps {
  transaction_id?: string
}

export const NewTransaction = ({ transaction_id }: NewTransactionProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isEdit = Boolean(transaction_id)

  const { data: transaction, isLoading: transactionLoading } =
    useTransaction(transaction_id)

  const { kinds, isLoading: loadingKinds } = useTransactionKinds()

  const [amountFormatted, setAmountFormatted] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!transactionLoading && transaction) {
      setAmountFormatted(formatCurrency(transaction.amount))
      setTransactionType(transaction.transaction_type)
    }
  }, [transactionLoading, transaction])

  const { trigger: saveTransaction } = useSWRMutation<
    Transaction,
    Error,
    string,
    { amount: number; transaction_type: string }
  >(
    transaction_id ?? 'transaction:new',
    async (_, { arg }) =>
      saveTransactionUseCase.execute({
        transactionId: transaction_id,
        ...arg,
      }),
  )

  const handleSubmit = useCallback(async () => {
    const raw = amountFormatted.replace(/\D/g, '')
    const amount = Number(raw) / 100
    if (amount <= 0 || !transactionType || submitting) return

    setSubmitting(true)
    try {
      const result = await saveTransaction({
        amount,
        transaction_type: transactionType,
      })

      emitTransactionEvent({
        type: isEdit ? 'updated' : 'created',
        transaction: result,
      })

      if (isEdit) {
        router.back()
        toast.success('Transação atualizada com sucesso!')
      } else {
        setAmountFormatted('')
        setTransactionType('')
        toast.success('Transação adicionada com sucesso!')
      }
    } catch {
      toast.error('Erro ao salvar transação')
    } finally {
      setSubmitting(false)
    }
  }, [
    amountFormatted,
    transactionType,
    isEdit,
    saveTransaction,
    router,
    submitting,
  ])

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '')
    const number = Number(onlyNums) / 100
    setAmountFormatted(formatCurrency(number))
  }

  if (transactionLoading) return <Loader />

  const canSubmit =
    !submitting &&
    transactionType !== '' &&
    Number(amountFormatted.replace(/\D/g, '')) > 0

  return (
    <div
      className={`relative flex flex-col gap-4 p-6 bg-silver rounded-lg shadow-md sm:basis-1/2 ${!isHome && 'sm:flex-row sm:justify-between lg:justify-around'}`}
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
          disabled={loadingKinds || submitting}
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
          {submitting ? <Loader size="sm" color="background" /> : 'Salvar'}
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
