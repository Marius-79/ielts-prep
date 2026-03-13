import { useEffect } from "react"
import { supabase } from "../_components/_lib/supabase"

export default function AuthCallback() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        subscription.unsubscribe()
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