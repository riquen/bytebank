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

  const canSubmit = transactionType !== '' && amount && amount !== 'R$ 0,00'

  //     <div className="relative flex flex-col items-center justify-between gap-20 p-8 bg-silver rounded-lg shadow-md">
  //       <div className="flex flex-col gap-6 text-center">
  //         <h2 className="font-bold text-2xl text-foreground">Nova transação</h2>
  //         <select />
  //         <div className="flex flex-col gap-4">
  //           <p className="font-semibold text-foreground">Valor</p>
  //           <input type="text" className="py-2 bg-white border border-foreground rounded-lg text-center outline-foreground" />
  //         </div>
  //         <button className="py-2 bg-foreground rounded-lg font-semibold text-white">Adicionar</button>
  //       </div>
  //       <Image
  //         src={Card}
  //         alt="Card"
  //         style={imageHelper.intrinsic}
  //         className="z-1"
  //       />
  //       <Image
  //         src={PixelsLight}
  //         alt="Pixels light"
  //         style={imageHelper.intrinsic}
  //         className="absolute bottom-0 right-0"
  //       />
  //     </div>

  return (
    <div className="relative flex flex-col items-center justify-between gap-20 p-8 bg-silver rounded-lg shadow-md">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <h2 className="text-center font-bold text-2xl text-foreground">
          Nova transação
        </h2>
        <div className="flex flex-col">
          <label
            htmlFor="transactionType"
            className="mb-1 text-sm font-medium text-foreground"
          >
            Tipo de transação
          </label>
          <select
            id="transactionType"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="
              w-full py-2 px-3
              bg-white border border-foreground rounded-lg
              text-foreground
              focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent
              transition
            "
          >
            <option value="" disabled>
              Selecione o tipo de transação
            </option>
            <option value="exchange">Câmbio de Moeda</option>
            <option value="docted">DOC/TED</option>
            <option value="emprestimo">Empréstimo e Financiamento</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="valor"
            className="mb-1 text-sm font-medium text-foreground"
          >
            Valor
          </label>
          <input
            id="valor"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleValueChange}
            placeholder="R$ 0,00"
            className="
              w-full py-2 px-3 text-center
              bg-white border border-foreground rounded-lg
              text-foreground
              focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent
              transition
            "
          />
        </div>
        <button
          disabled={!canSubmit}
          className={`
            w-full py-2 rounded-lg font-semibold text-white
            bg-foreground
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          `}
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
