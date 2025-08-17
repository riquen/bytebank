'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Loader } from '@/components/Loader'
import { supabaseClient } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    router.push('/')
    router.refresh()
  }

  const canSubmit = email !== '' && password !== '' && !loading

  return (
    <div className="flex flex-1 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="py-2 px-3 bg-white border border-foreground rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="py-2 px-3 bg-white border border-foreground rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-tomato focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="py-2 rounded-lg bg-foreground cursor-pointer font-semibold text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 hover:opacity-80 transition-opacity"
        >
          {loading ? <Loader size="sm" color="background" /> : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
