'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { imageHelper } from '@/utils/image-helper'
import { fetcher } from '@/utils/fetcher'
import { formatCurrency } from '@/utils/currency'
import { Loader } from '@/components/Loader'
import Eye from '@/public/static/icons/eye.svg'
import EyeOff from '@/public/static/icons/eye-off.svg'
import Pig from '@/public/static/images/pig.png'
import PixelsDark from '@/public/static/images/pixels-dark.png'
import { type HomeData } from './api/types'
import Statement from './statement/page'
import { NewTransaction } from './new-transaction/NewTransaction'

export default function Home() {
  const { data, isValidating } = useSWR<HomeData>('/api', fetcher)
  const [showBalance, setShowBalance] = useState(true)

  const toggleShowBalance = () => setShowBalance((prev) => !prev)

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
                  className="px-1 rounded-full cursor-pointer focus:outline-none active:bg-background/10 hover:bg-background/10 transition-colors"
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
                {isValidating ? (
                  <Loader size="sm" color="background" start />
                ) : (
                  <h2 className="text-3xl">
                    {showBalance ? formatCurrency(data.balance) : '••••••'}
                  </h2>
                )}
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
