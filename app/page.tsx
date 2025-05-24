'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { Loader } from '@/components/Loader'
import Eye from '@/public/static/icons/eye.svg'
import EyeOff from '@/public/static/icons/eye-off.svg'
import Pig from '@/public/static/images/pig.png'
import PixelsDark from '@/public/static/images/pixels-dark.png'
import { type HomeData } from './api/types'
import Statement from './statement/page'
import { NewTransaction } from './new-transaction/NewTransaction'

export default function Home() {
  const [showBalance, setShowBalance] = useState(true)
  const [data, setData] = useState<HomeData | null>(null)

  const toggleShowBalance = useCallback(
    () => setShowBalance((prev) => !prev),
    [],
  )

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api')

        if (!response.ok) throw new Error('Erro ao buscar dados')

        const data = await response.json()
        setData(data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  if (!data) return <Loader />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex flex-col sm:basis-1/2 gap-20 sm:gap-4 p-6 bg-foreground rounded-lg shadow-md text-white">
          <div className="flex flex-col gap-6">
            <h2 className="font-semibold text-2xl">{`Olá, ${data.name}! :)`}</h2>
            <p className="text-sm">{data.date}</p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-6">
                <h3 className="font-semibold text-xl">Saldo</h3>
                <button
                  className="focus:outline-none"
                  onClick={toggleShowBalance}
                >
                  <Image
                    src={showBalance ? Eye : EyeOff}
                    alt={showBalance ? 'EyeOff' : 'Eye'}
                    style={imageHelper.intrinsic}
                  />
                </button>
              </div>
              <hr className="h-0.5 bg-white" />
              <div className="flex flex-col gap-2">
                <p>Conta Corrente</p>
                <h2 className="text-3xl">
                  {showBalance ? data.balance : '••••••'}
                </h2>
              </div>
            </div>
          </div>
          <Image
            src={Pig}
            alt="Pig"
            style={imageHelper.intrinsic}
            className="z-1"
          />
          <Image
            src={PixelsDark}
            alt="Pixels dark"
            style={imageHelper.intrinsic}
            className="absolute bottom-0 right-0"
          />
        </div>
        <NewTransaction />
      </div>
      <Statement />
    </div>
  )
}
