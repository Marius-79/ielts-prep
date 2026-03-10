import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, User, Github, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { supabase } from "../_lib/supabase"
import { toast } from "sonner"

export default function AuthModal({ open, onClose }) {

const [username, setUsername] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [usernameStatus, setUsernameStatus] = useState(null)
const [loading, setLoading] = useState(false)
const [isLogin, setIsLogin] = useState(true)
const [showPassword, setShowPassword] = useState(false)

function validatePassword(password) {
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
  return strong.test(password)
}

async function checkUsername(value) {
  setUsername(value)
  if (value.length < 3) { setUsernameStatus(null); return }
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", value)
    .single()
  setUsernameStatus(data ? "taken" : "available")
}

async function handleAuth() {
  setLoading(true)

  if (!isLogin) {
    if (usernameStatus === "taken") {
      toast.error("Username already taken")
      setLoading(false)
      return
    }
    if (!validatePassword(password)) {
      toast.error("Password must contain 8+ characters, uppercase, number and symbol")
      setLoading(false)
      return
    }
  }

  let result

  if (isLogin) {
    result = await supabase.auth.signInWithPassword({ email, password })
  } else {
    result = await supabase.auth.signUp({ email, password })
  }

  if (result.error) {
    toast.error(result.error.message)
    setLoading(false)
    return
  }

  const user = result.data.user

  if (!isLogin && user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: user.id, username })
    if (profileError) toast.error("Profile creation failed")
  }

  toast.success(isLogin ? "Welcome back!" : "Account created!")
  onClose()
  setLoading(false)
}

async function signInWithGithub() {
  await supabase.auth.signInWithOAuth({ provider: "github" })
}

function switchMode(login) {
  setIsLogin(login)
  setUsername("")
  setEmail("")
  setPassword("")
  setUsernameStatus(null)
}

const passwordStrength = () => {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[@$!%*?&]/.test(password)) score++
  return score
}

const strength = passwordStrength()
const strengthColor = ["bg-red-400", "bg-red-400", "bg-yellow-400", "bg-green-400", "bg-green-500"][strength]
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength]

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

    {/* top accent */}
    <div className="h-1 w-full bg-primary" />

    {/* header */}
    <div className="px-7 pt-6 pb-5 border-b border-border/60">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLogin
              ? "Sign in to sync your progress"
              : "Join to track your IELTS journey"}
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
        <button
          onClick={() => switchMode(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isLogin
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => switchMode(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            !isLogin
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign up
        </button>
      </div>
    </div>

    {/* form body */}
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
            {usernameStatus && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {usernameStatus === "available"
                  ? <CheckCircle2 size={14} className="text-green-500" />
                  : <AlertCircle size={14} className="text-red-400" />
                }
              </span>
            )}
          </div>
          {usernameStatus === "available" && (
            <p className="text-green-500 text-xs mt-1 ml-0.5">Username available ✓</p>
          )}
          {usernameStatus === "taken" && (
            <p className="text-red-400 text-xs mt-1 ml-0.5">Already taken</p>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* email */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
          Email
        </label>
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
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
          Password
        </label>
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

        {/* strength indicator — signup only */}
        {!isLogin && password.length > 0 && (
          <div className="mt-2.5">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength ? strengthColor : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              strength <= 1 ? "text-red-400" :
              strength === 2 ? "text-yellow-500" :
              "text-green-500"
            }`}>
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
        {loading ? (
          <><Loader2 size={15} className="animate-spin" />
          {isLogin ? "Signing in..." : "Creating account..."}</>
        ) : (
          isLogin ? "Sign in" : "Create account"
        )}
      </button>

      {/* divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* github */}
      <button
        onClick={signInWithGithub}
        className="w-full flex items-center justify-center gap-2.5 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/70 active:scale-[0.98] transition-all duration-150"
      >
        <Github size={16} />
        GitHub
      </button>

    </div>

  </motion.div>

</motion.div>

)}
</AnimatePresence>

)
}
