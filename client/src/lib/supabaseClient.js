import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback 1: window globals (can be injected via index.html <script> before bundle)
if ((!supabaseUrl || !supabaseAnonKey) && typeof window !== 'undefined') {
  supabaseUrl = window.__SUPABASE_URL__ || supabaseUrl
  supabaseAnonKey = window.__SUPABASE_ANON_KEY__ || supabaseAnonKey
}

// Fallback 2: localStorage (useful for quick dev without restarting Vite)
if ((!supabaseUrl || !supabaseAnonKey) && typeof window !== 'undefined') {
  const lsUrl = window.localStorage?.getItem('DEV_SUPABASE_URL')
  const lsKey = window.localStorage?.getItem('DEV_SUPABASE_ANON_KEY')
  supabaseUrl = supabaseUrl || lsUrl
  supabaseAnonKey = supabaseAnonKey || lsKey
}

export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey)

// Provide a safe stub when env vars are missing to avoid white-screen crashes
function createStubClient() {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env.local and restart the dev server.'
  )
  const noConfigError = new Error('Supabase not configured')
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async signOut() {
        return { error: noConfigError }
      },
      async signInWithPassword() {
        return { data: null, error: noConfigError }
      },
      async signUp() {
        // mimic email confirmation path: no active session
        return { data: { session: null }, error: null }
      },
      async resetPasswordForEmail() {
        return { error: noConfigError }
      },
      async updateUser() {
        return { error: noConfigError }
      },
    },
  }
}

export const supabase = supabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createStubClient()
