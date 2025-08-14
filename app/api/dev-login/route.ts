import { NextResponse } from 'next/server'
import { requireUser } from '@/utils/require-user'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const email = process.env.SUPABASE_EMAIL
  const password = process.env.SUPABASE_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email ou password ausentes' },
      { status: 500 },
    )
  }

  const { supabase } = await requireUser()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: 'Falha no login' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, user: data.user })
}
