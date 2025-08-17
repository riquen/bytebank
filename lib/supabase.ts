import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('Supabase envs ausentes')

export const supabaseClient = () => createBrowserClient(url, key)
