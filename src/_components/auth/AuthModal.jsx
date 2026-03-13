import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, User, Github, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useState } from "react"
import { supabase } from "../_lib/supabase"
import { toast } from "sonner"

function generateUsernameSuggestions(base) {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "")
  const num = () => Math.floor(Math.random() * 900) + 100
  return [
    `${clean}${num()}`,
    `${clean}_ielts`,
    `${clean}${new Date().getFullYear()}`,
    `the_${clean}`,
    `${clean}_pro`,
  ]
}

export default function AuthModal({ open, onClose }) {

const [username, setUsername] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [usernameStatus, setUsernameStatus] = useState(null) // null | "available" | "taken" | "checking"
const [loading, setLoading] = useState(false)
const [isLogin, setIsLogin] = useState(true)
const [showPassword, setShowPassword] = useState(false)
const [suggestions, setSuggestions] = useState([])

function validatePassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pw)
}

async function checkUsername(value) {
  setUsername(value)
  setSuggestions([])
  if (value.length < 3) { setUsernameStatus(null); return }
  setUsernameStatus("checking")
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", value)
    .maybeSingle()
  if (data) {
    setUsernameStatus("taken")
    setSuggestions(generateUsernameSuggestions(value))
  } else {
    setUsernameStatus("available")
  }
}

function refreshSuggestions() {
  setSuggestions(generateUsernameSuggestions(username))
}

async function handleAuth() {
  setLoading(true)

  if (!isLogin) {

    // check username
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters")
      setLoading(false)
      return
    }
    if (usernameStatus === "taken") {
      toast.error("Username already taken — pick one of the suggestions")
      setLoading(false)
      return
    }

    // check email duplicate before attempting signup
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", (await supabase.auth.getUser()).data?.user?.id ?? "")
      .single()

    if (!validatePassword(password)) {
      toast.error("Password must have 8+ chars, uppercase, number and symbol")
      setLoading(false)
      return
    }

    // attempt signup
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        toast.error("An account with this email already exists — try signing in")
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    const user = data.user
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: user.id, username })
      if (profileError) {
        toast.error("Profile creation failed: " + profileError.message)
        setLoading(false)
        return
      }
    }

    toast.success("Account created! Welcome 🎉")
    onClose()
    setLoading(false)
    return
  }

  // login
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message.toLowerCase().includes("invalid")) {
      toast.error("Wrong email or password")
    } else {
      toast.error(error.message)
    }
    setLoading(false)
    return
  }

  toast.success("Welcome back!")
  onClose()
  setLoading(false)
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

function switchMode(login) {
  setIsLogin(login)
  setUsername("")
  setEmail("")
  setPassword("")
  setUsernameStatus(null)
  setSuggestions([])
}

const strength = (() => {
  if (!password) return 0
  let s = 0
  if (password.length >= 8) s++
  if (/[A-Z]/.test(password)) s++
  if (/\d/.test(password)) s++
  if (/[@$!%*?&]/.test(password)) s++
  return s
})()

const strengthColor = ["bg-red-400","bg-red-400","bg-yellow-400","bg-green-400","bg-green-500"][strength]
const strengthLabel = ["","Weak","Fair","Good","Strong"][strength]

return (

<AnimatePresence>
{open && (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 z-[100] flex items-center justify-center p-4"
  style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
  onClick={onClose}
>
  <motion.div
    initial={{ scale: 0.94, opacity: 0, y: 16 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.94, opacity: 0, y: 16 }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="h-1 w-full bg-primary" />

    {/* header */}
    <div className="px-7 pt-6 pb-5 border-b border-border/60">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLogin ? "Sign in to sync your progress" : "Join to track your IELTS journey"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* tabs */}
      <div className="flex mt-5 bg-secondary rounded-xl p-1 gap-1">
        {[true, false].map((login) => (
          <button
            key={String(login)}
            onClick={() => switchMode(login)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isLogin === login
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {login ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>
    </div>

    {/* form */}
    <div className="px-7 py-6 space-y-4">

      {/* username — signup only */}
      <AnimatePresence mode="wait">
      {!isLogin && (
        <motion.div
          key="username-field"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: "hidden" }}
        >
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="your_username"
              value={username}
              minLength={3}
              onChange={(e) => checkUsername(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {usernameStatus === "checking" && <Loader2 size={14} className="animate-spin text-muted-foreground/50" />}
              {usernameStatus === "available" && <CheckCircle2 size={14} className="text-green-500" />}
              {usernameStatus === "taken" && <AlertCircle size={14} className="text-red-400" />}
            </span>
          </div>

          {usernameStatus === "available" && (
            <p className="text-green-500 text-xs mt-1 ml-0.5">Available ✓</p>
          )}

          {/* suggestions when taken */}
          {usernameStatus === "taken" && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-red-400 text-xs">Already taken — try one of these:</p>
                <button onClick={refreshSuggestions} className="text-muted-foreground hover:text-primary transition-colors">
                  <RefreshCw size={11} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setUsername(s); setUsernameStatus("available"); setSuggestions([]) }}
                    className="px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-xs font-medium border border-primary/15 hover:bg-primary/15 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* email */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* password */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder={isLogin ? "Your password" : "Min. 8 characters"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {!isLogin && password.length > 0 && (
          <div className="mt-2.5">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-secondary"}`} />
              ))}
            </div>
            <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-yellow-500" : "text-green-500"}`}>
              {strengthLabel} password
            </p>
          </div>
        )}
      </div>

      {/* submit */}
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" />{isLogin ? "Signing in..." : "Creating account..."}</>
          : isLogin ? "Sign in" : "Create account"
        }
      </button>

      {/* divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* github */}
      <button
        onClick={signInWithGithub}
        className="w-full flex items-center justify-center gap-2.5 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/70 active:scale-[0.98] transition-all duration-150"
      >
        <Github size={16} />
        Continue with GitHub
      </button>

    </div>
  </motion.div>
</motion.div>
)}
</AnimatePresence>
)
}
