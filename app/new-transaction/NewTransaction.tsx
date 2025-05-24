'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { Loader } from '@/components/Loader'
import Card from '@/public/static/images/card.png'
import PixelsLight from '@/public/static/images/pixels-light.png'
import type { TransactionData } from '@/app/api/transactions/types'

interface NewTransactionProps {
  id?: string
}

export const NewTransaction = ({ id }: NewTransactionProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { mutate: globalMutate } = useSWRConfig()
  const isEdit = Boolean(id)
  const isHome = pathname === '/'

  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTransaction, setLoadingTransaction] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) {
      setLoadingTransaction(false)
      return
    }

    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${id}`)

        if (!response.ok) throw new Error()

        const { transaction }: { transaction: TransactionData } =
          await response.json()

        setAmount(transaction.amount)
        setTransactionType(transaction.type)
      } catch {
        toast.error('Erro ao carregar transação')
      } finally {
        setLoadingTransaction(false)
      }
    }

    fetchTransaction()
  }, [id, isEdit])

  const handleSubmit = useCallback(async () => {
    if (!transactionType || Number(amount.replace(/\D/g, '')) <= 0) return
    setLoading(true)

    try {
      const url = isEdit ? `/api/transactions/${id}` : '/api/transactions'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, transactionType }),
      })

      if (!response.ok) throw new Error()

      toast.success(
        `Transação ${isEdit ? 'atualizada' : 'adicionada'} com sucesso!`,
      )
      setAmount('')
      setTransactionType('')

      await globalMutate(
        (key: string) => key.startsWith('/api/transactions'),
        undefined,
        { revalidate: true },
      )

      if (isEdit) router.back()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }, [amount, transactionType, id, isEdit, router, globalMutate])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const onlyNums = e.target.value.replace(/\D/g, '')
      const number = Number(onlyNums) / 100
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(number)
      setAmount(formatted)
    },
    [],
  )

  if (loadingTransaction) return <Loader />

  const canSubmit =
    !loading && transactionType !== '' && Number(amount.replace(/\D/g, '')) > 0

  return (
    <div
      className={`relative flex flex-col gap-20 sm:gap-4 p-6 bg-silver rounded-lg shadow-md sm:basis-1/2 ${!isHome && 'sm:flex-row sm:justify-between'}`}
    >
      <div
        className={`flex flex-col gap-6 text-center ${!isHome && 'sm:basis-1/2'}`}
      >
        <h2 className="font-bold text-2xl text-foreground">
          {isEdit ? 'Editar transação' : 'Nova transação'}
        </h2>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          value={amount}
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
        >
          <option value="" disabled>
            Selecione o tipo de transação
          </option>
          <option value="PIX">PIX</option>
          <option value="Aplicação">Aplicação</option>
          <option value="Câmbio">Câmbio</option>
        </select>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="py-2 rounded-lg bg-foreground font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? <Loader size="sm" color="background" /> : 'Salvar'}
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
