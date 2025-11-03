import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (for API routes)
export const supabase = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // Return a dummy client to prevent build errors, but will fail at runtime
    // if env vars aren't set
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceRoleKey || 'placeholder-key'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Client-side Supabase client (for frontend use with real-time subscriptions)
// This will be created on the client side where env vars are available
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return a dummy client
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase client environment variables not set')
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export a singleton instance for client-side use
export const supabaseClient = typeof window !== 'undefined' 
  ? getSupabaseClient()
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )
