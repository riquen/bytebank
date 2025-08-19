'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { Loader } from '@/components/Loader'
import { supabaseClient } from '@/lib/supabase'
import { imageHelper } from '@/utils/image-helper'
import EyeForeground from '@/public/static/icons/eye-foreground.svg'
import EyeOffForeground from '@/public/static/icons/eye-off-foreground.svg'
import Logo from '../../icon.svg'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = supabaseClient()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      toast.error('Erro ao realizar login')
      return
    }

    toast.success('Login realizado com sucesso!')
    router.replace('/')
  }

  const canSubmit = email !== '' && password !== '' && !loading

  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="w-full max-w-sm space-y-28">
        <Image
          src={Logo}
          alt="Logo Bytebank"
          width={156}
          height={94}
          priority
          className="mx-auto sm:w-48 sm:h-28"
        />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="py-2 px-3 bg-white border border-foreground rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full py-2 pl-3 pr-10 bg-white border border-foreground rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((showPassword) => !showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer active:bg-foreground/10 hover:bg-foreground/10 transition-colors"
            >
              <Image
                src={showPassword ? EyeOffForeground : EyeForeground}
                alt={showPassword ? 'Eye' : 'EyeOff'}
                style={imageHelper.intrinsic}
              />
            </button>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="py-2 rounded-lg bg-foreground cursor-pointer font-semibold text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 hover:opacity-80 transition-opacity"
          >
            {loading ? <Loader size="sm" color="background" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
