import { NextResponse } from 'next/server'
import { requireUser } from '@/utils/require-user'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { supabase } = await requireUser()

  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
