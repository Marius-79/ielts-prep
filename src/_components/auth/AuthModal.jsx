import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, User, Github, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "../_lib/supabase"
import { toast } from "sonner"

function generateUsernameSuggestions(base) {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "")
  const num = () => Math.floor(Math.random() * 900) + 100
  return [`${clean}${num()}`, `${clean}_ielts`, `${clean}${new Date().getFullYear()}`, `the_${clean}`, `${clean}_pro`]
}

export default function AuthModal({ open, onClose }) {
  const [username,       setUsername]       = useState("")
  const [email,          setEmail]          = useState("")
  const [password,       setPassword]       = useState("")
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [isLogin,        setIsLogin]        = useState(true)
  const [isForgot,       setIsForgot]       = useState(false)
  const [showPassword,   setShowPassword]   = useState(false)
  const [suggestions,    setSuggestions]    = useState([])

  function validatePassword(pw) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(pw)
  }

  async function handleForgotPassword() {
    if (!email) { toast.error("Enter your email first"); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success("Reset link sent! Check your email 📧")
    setIsForgot(false)
  }

  async function checkUsername(value) {
    setUsername(value)
    setSuggestions([])
    if (value.length < 3) { setUsernameStatus(null); return }
    setUsernameStatus("checking")
    const { data } = await supabase.from("profiles").select("username").eq("username", value).maybeSingle()
    if (data) { setUsernameStatus("taken"); setSuggestions(generateUsernameSuggestions(value)) }
    else setUsernameStatus("available")
  }

  async function handleAuth() {
    setLoading(true)

    if (!isLogin) {
      if (!username || username.length < 3) { toast.error("Username must be at least 3 characters"); setLoading(false); return }
      if (usernameStatus === "taken") { toast.error("Username already taken"); setLoading(false); return }
      if (!validatePassword(password)) { toast.error("Password needs 8+ chars, uppercase, number & symbol — e.g. Tiger42!"); setLoading(false); return }

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message.toLowerCase().includes("already") ? "Email already registered — try signing in" : error.message)
        setLoading(false); return
      }
      if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, username }, { onConflict: "id" })
      await supabase.auth.signOut()
      localStorage.removeItem("ielts-profile"); localStorage.removeItem("ielts-notebook"); localStorage.removeItem("ielts-scores")
      toast.success("Account created! Check your email to confirm before signing in 📧")
      switchMode(true); setLoading(false); return
    }

    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message.toLowerCase().includes("invalid") ? "Wrong email or password" : error.message); setLoading(false); return }
    if (loginData?.user && !loginData.user.email_confirmed_at) {
      await supabase.auth.signOut()
      toast.error("Please confirm your email before signing in 📧"); setLoading(false); return
    }
    toast.success("Welcome back!"); onClose(); setLoading(false)
  }

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" }
    }
  })

  if (error || !data?.url) { toast.error(error?.message ?? "GitHub login failed"); return }

  const width = 600, height = 700
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2
  window.open(data.url, "github-oauth", `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`)

  // Listen for success message from popup
  window.addEventListener("message", function handler(e) {
    if (e.origin !== window.location.origin) return
    if (e.data?.type === "GITHUB_AUTH_SUCCESS") {
      window.removeEventListener("message", handler)
      window.location.href = "/"
    }
  })
}


async function promptUserForAccount(options) {
  // Create a dropdown menu to select the account
  const selectedAccount = await Swal.fire({
    title: 'Select an account',
    input: 'select',
    inputOptions: options,
    inputPlaceholder: 'Select an account',
  });

  return selectedAccount.value;
}
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })
    if (error) toast.error(error.message)
  }

  function switchMode(login) {
    setIsLogin(login); setIsForgot(false); setUsername(""); setEmail(""); setPassword(""); setUsernameStatus(null); setSuggestions([])
  }

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++; if (/[A-Z]/.test(password)) s++; if (/\d/.test(password)) s++; if (/[^a-zA-Z0-9]/.test(password)) s++
    return s
  })()
  const strengthColor = ["bg-red-400","bg-red-400","bg-yellow-400","bg-green-400","bg-green-500"][strength]
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-[380px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            {/* Purple top accent */}
            <div className="h-1 w-full bg-primary" />

            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition">
              <X size={15} />
            </button>

            <div className="px-7 pt-7 pb-7">

              {/* Logo + title */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-base">I</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {isForgot ? "Reset your password" : isLogin ? "Sign in to IELTS Prep" : "Create your account"}
                </h2>
                {!isForgot && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => switchMode(!isLogin)} className="text-primary font-semibold hover:underline">
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                )}
              </div>

              {/* ── Forgot password ── */}
              {isForgot && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                      <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                    </div>
                  </div>
                  <button onClick={handleForgotPassword} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                  </button>
                  <button onClick={() => setIsForgot(false)} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition">
                    ← Back to sign in
                  </button>
                </div>
              )}

              {/* ── Main form ── */}
              {!isForgot && (
                <div className="space-y-3">

                  {/* Social buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={signInWithGoogle}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary/60 transition">
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button onClick={signInWithGithub}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary/60 transition">
                      <Github size={15} />
                      GitHub
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Username — signup only */}
                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div key="username" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Username</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                          <input type="text" placeholder="your_username" value={username} onChange={e => checkUsername(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {usernameStatus === "checking" && <Loader2 size={13} className="animate-spin text-muted-foreground/40" />}
                            {usernameStatus === "available" && <CheckCircle2 size={13} className="text-green-500" />}
                            {usernameStatus === "taken" && <AlertCircle size={13} className="text-red-400" />}
                          </span>
                        </div>
                        {usernameStatus === "taken" && suggestions.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {suggestions.slice(0, 3).map(s => (
                              <button key={s} onClick={() => { setUsername(s); setUsernameStatus("available"); setSuggestions([]) }}
                                className="text-xs px-2 py-0.5 rounded-lg bg-primary/8 text-primary border border-primary/15 hover:bg-primary/15 transition">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                      <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Password</label>
                      {isLogin && (
                        <button onClick={() => setIsForgot(true)} className="text-xs text-primary font-semibold hover:underline">
                          Forgot your password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                      <input type={showPassword ? "text" : "password"} placeholder={isLogin ? "Your password" : "Min. 8 characters"}
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {!isLogin && password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-secondary"}`} />
                          ))}
                        </div>
                        <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-yellow-500" : "text-green-500"}`}>
                          {strengthLabel} password
                          {strength <= 2 && <span className="text-muted-foreground"> — try something like <span className="font-mono font-semibold text-foreground">Tiger42!</span></span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button onClick={handleAuth} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all mt-1">
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" />{isLogin ? "Signing in..." : "Creating account..."}</>
                      : isLogin ? "Sign in" : "Create account"
                    }
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground pt-1">
                    By signing in, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-primary transition">Terms</span>
                    {" "}and{" "}
                    <span className="underline cursor-pointer hover:text-primary transition">Privacy Policy</span>
                  </p>

                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
