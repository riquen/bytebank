import { supabaseServer } from '@/lib/supabase'

export async function requireUser() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}
