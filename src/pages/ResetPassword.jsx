import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { supabase } from "../_components/_lib/supabase"
import { toast } from "sonner"

export default function ResetPassword() {
  const [password,     setPassword]     = useState("")
  const [confirm,      setConfirm]      = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)
  const [ready,        setReady]        = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    // Supabase automatically parses the #access_token fragment on page load
    // and fires PASSWORD_RECOVERY — we just need to listen for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        // Session is now active; show the form.
        setReady(true)
        setError(null)
      } else if (event === "SIGNED_IN" && session && !ready) {
        // Some Supabase versions emit SIGNED_IN instead of PASSWORD_RECOVERY
        // when following a recovery link — treat it the same way.
        setReady(true)
        setError(null)
      }
    })

    // Fallback: if the listener never fires within 4 s the link was invalid/expired.
    const timeout = setTimeout(() => {
      setReady(prev => {
        if (!prev) setError("Invalid or expired reset link. Please request a new one.")
        return prev
      })
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^a-zA-Z0-9]/.test(password)) s++
    return s
  })()
  const strengthColor = ["bg-red-400","bg-red-400","bg-yellow-400","bg-green-400","bg-green-500"][strength]
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength]

  async function handleReset() {
    if (!password) { toast.error("Enter a new password"); return }
    if (password !== confirm) { toast.error("Passwords don't match"); return }
    if (strength < 3) { toast.error("Password too weak — try Tiger42!"); return }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { toast.error(error.message); return }

    await supabase.auth.signOut()
    setDone(true)
    setTimeout(() => { window.location.href = "/" }, 3000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="h-1 w-full bg-primary" />
        <div className="px-7 py-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3">
              <span className="text-white font-bold text-base">I</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">
              {done ? "Password updated!" : "Set new password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {done ? "Redirecting you to the site..." : "Choose a strong password for your account"}
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-500 text-center">{error}</p>
              <button onClick={() => window.location.href = "/"}
                className="mt-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
                Back to home
              </button>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm text-muted-foreground text-center">
                Your password has been updated. Redirecting in a moment...
              </p>
            </div>
          )}

          {/* Loading state */}
          {!ready && !error && !done && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" /> Verifying reset link...
            </div>
          )}

          {/* Form */}
          {ready && !done && !error && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-secondary"}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-yellow-500" : "text-green-500"}`}>
                      {strengthLabel} password
                      {strength <= 2 && <span className="text-muted-foreground"> — try <span className="font-mono font-semibold text-foreground">Tiger42!</span></span>}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input type={showPassword ? "text" : "password"} placeholder="Repeat your password"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="w-full pl-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
              </div>

              <button onClick={handleReset} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all mt-1">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
