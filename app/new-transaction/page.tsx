'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { toast } from 'react-toastify'
import { Loader } from '@/components/Loader'
import Card from '@/public/static/images/card.png'
import PixelsLight from '@/public/static/images/pixels-light.png'

export default function NewTransaction() {
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [loading, setLoading] = useState(false)

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

  const canSubmit =
    transactionType !== '' && Number(amount.replace(/\D/g, '')) > 0

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          transactionType,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success('Transação adicionada com sucesso!')
        setAmount('')
        setTransactionType('')
      } else {
        toast.error(data.error ?? 'Erro ao adicionar transação')
      }
    } catch (error) {
      console.error(error)
      toast.error('Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [amount, transactionType, canSubmit])

  return (
    <div className="relative flex flex-col gap-20 p-8 bg-silver rounded-lg shadow-md">
      <div className="flex flex-col gap-6 text-center">
        <h2 className="font-bold text-2xl text-foreground">Nova transação</h2>
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
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className="py-2 rounded-lg font-semibold text-white bg-foreground disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? <Loader size="sm" color="background" /> : 'Adicionar'}
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
