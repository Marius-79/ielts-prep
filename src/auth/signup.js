import { supabase } from "../lib/supabase"

export async function signUp(email, password, username) {

  if (!email || !password || !username) {
    return {
      data: null,
      error: { message: "Email, password and username are required" }
    }
  }

  // normalize email
  let normalizedEmail = email.trim().toLowerCase()

  if (normalizedEmail.endsWith("@gmail.com")) {
    normalizedEmail = normalizedEmail.split("+")[0]
  }

  // check if username exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single()

  if (existingUser) {
    return {
      data: null,
      error: { message: "Username already taken" }
    }
  }

  // create account
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password
  })

  if (error) return { data: null, error }

  const user = data.user

  if (user) {

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username
      })

    if (profileError) {
      return { data: null, error: profileError }
    }

  }

  return { data, error: null }
}