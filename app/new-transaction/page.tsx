'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import Card from '@/public/static/images/card.png'
import PixelsLight from '@/public/static/images/pixels-light.png'

export default function NewTransaction() {
  const [transactionType, setTransactionType] = useState('')
  const [amount, setAmount] = useState('')

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
          <option value="pix">PIX</option>
          <option value="investment">Aplicação</option>
          <option value="exchange">Câmbio</option>
        </select>
        <button
          disabled={!canSubmit}
          className="py-2 rounded-lg font-semibold text-white bg-foreground disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Adicionar
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
