import { useEffect } from "react"
import { supabase } from "../_components/_lib/supabase"

export default function AuthCallback() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        subscription.unsubscribe()

        // Ensure a profiles row exists for OAuth users (e.g. GitHub)
        // who never go through the normal signUp flow that inserts a row.
        const user = session.user
        const { data: existing } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (!existing) {
          // Build a sensible default username from GitHub metadata
          const meta        = user.user_metadata ?? {}
          const rawUsername = (meta.user_name || meta.preferred_username || meta.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_")
            .slice(0, 30) || "user"

          // Avoid collisions by appending a short random suffix if needed
          let finalUsername = rawUsername
          const { data: taken } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", rawUsername)
            .maybeSingle()
          if (taken) {
            finalUsername = `${rawUsername}_${Math.floor(Math.random() * 9000) + 1000}`
          }

          const avatarUrl = meta.avatar_url || meta.picture || null

          await supabase.from("profiles").insert({
            id:         user.id,
            username:   finalUsername,
            avatar_url: avatarUrl,
          })
        } else if (!existing.avatar_url) {
          // Profile row exists but avatar may be missing — backfill from OAuth metadata
          const meta      = user.user_metadata ?? {}
          const avatarUrl = meta.avatar_url || meta.picture || null
          if (avatarUrl) {
            await supabase
              .from("profiles")
              .update({ avatar_url: avatarUrl })
              .eq("id", user.id)
          }
        }

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: "GITHUB_AUTH_SUCCESS" }, window.location.origin)
          window.close()
        } else {
          window.location.replace("/")
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: "12px" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontFamily: "sans-serif", color: "#888", fontSize: 14 }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
