'use client'

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { imageHelper } from "@/utils/image-helper";
import Pig from '@/public/static/images/pig.png'
import PixelsDark from '@/public/static/images/pixels-dark.png'
import { HomeData } from "./api/route";

export default function Home() {
  const [showBalance, setShowBalance] = useState(true)
  const [data, setData] = useState<HomeData | null>(null)

  const toggleShowBalance = useCallback(() => setShowBalance((prev) => !prev), [])

  useEffect(() => {
    fetch('/api')
      .then((res) => res.json() as Promise<HomeData>)
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) return <p>Carregando…</p>

  return (
    <div className="relative flex flex-col items-center justify-between gap-20 p-8 bg-foreground rounded-lg text-white">
      <div className="flex flex-col gap-6">
        <h2 className="font-semibold text-2xl">{`Olá, ${data.name}! :)`}</h2>
        <p className="text-sm">{data.date}</p>
        <div className="flex flex-col gap-4">
          <div className="flex gap-6 items-center">
            <h3 className="font-semibold text-xl">Saldo</h3>
            <button onClick={toggleShowBalance}>
              <Image
                src={showBalance ? '/static/icons/eye.svg' : '/static/icons/eye-off.svg'}
                alt={showBalance ? 'Eye off' : 'Eye'}
                width={20}
                height={20}
                style={imageHelper.intrinsic}
              />
            </button>
          </div>
          <hr className="h-0.5 bg-white" />
          <div className="flex flex-col gap-2">
            <p>Conta Corrente</p>
            <h2 className="text-3xl">{showBalance ? data.balance : '••••••'}</h2>
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
        alt="Pixels"
        style={imageHelper.intrinsic}
        className="absolute bottom-0 right-0"
      />
    </div>
  );
}
