import { createClient } from "@supabase/supabase-js"

const supabaseUrl     = "https://fjekxmtjfimgbdlmljfz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWt4bXRqZmltZ2JkbG1samZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ4MTMsImV4cCI6MjA4ODM5MDgxM30.aBWGpqNK7EqIzzCP4DUZJ_4SXPSc-WvNhUUTFi2Zrco"

// Vite HMR re-evaluates modules on every save, which would create a new
// GoTrueClient each time and trigger lock contention warnings.
// We store the singleton on import.meta.hot's data object in dev so it
// survives HMR cycles, and fall back to a plain module-level variable in prod.

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession:     true,
      detectSessionInUrl: true,
      storageKey:         "sb-fjekxmtjfimgbdlmljfz-auth-token",
      // Disable the navigator.locks mutex — avoids ALL lock warnings.
      // Safe because we guarantee a single instance ourselves below.
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  })
}

let supabaseClient

if (import.meta.hot) {
  // Dev: reuse the client stored in HMR state across hot reloads
  if (!import.meta.hot.data.supabaseClient) {
    import.meta.hot.data.supabaseClient = createSupabaseClient()
  }
  supabaseClient = import.meta.hot.data.supabaseClient
} else {
  // Prod: simple module-level singleton (module is evaluated exactly once)
  supabaseClient = createSupabaseClient()
}

export const supabase = supabaseClient