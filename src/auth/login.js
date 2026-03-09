import { supabase } from "../lib/supabase"

export async function signIn(email, password) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }
}