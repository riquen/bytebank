import { supabaseServer } from '@/lib/supabase-server'

export async function requireSession() {
  const supabase = await supabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { session, supabase, user }
}
