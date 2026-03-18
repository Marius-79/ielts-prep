import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "../_lib/supabase"
import ProfileModal from "./ProfileModal"
import {
  LayoutDashboard, Brain, CalendarDays, Mail,
  Eye, EyeOff, User, Library, LogOut, Settings
} from "lucide-react"

const sections = [
  { id: "overview",   icon: LayoutDashboard, label: "Overview"  },
  { id: "skills",     icon: Brain,           label: "Skills"    },
  { id: "study-plan", icon: CalendarDays,    label: "Plan"      },
  { id: "resources",  icon: Library,         label: "Resources" },
  { id: "contact",    icon: Mail,            label: "Contact"   },
]

export default function FloatingTopBar({ openAuth }) {
  const [active,       setActive]       = useState("overview")
  const [collapsed,    setCollapsed]    = useState(false)
  const [wave,         setWave]         = useState(false)
  const [user,         setUser]         = useState(null)
  const [username,     setUsername]     = useState(null)
  const [avatarUrl,    setAvatarUrl]    = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Step 1 — restore from cache instantly (no flicker)
    try {
      const cached = JSON.parse(localStorage.getItem("ielts-profile") || "null")
      if (cached?.username) {
        setUsername(cached.username)
        setAvatarUrl(cached.avatarUrl ?? null)
      }
    } catch {}

    // Step 2 — get session and user immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchAndCacheProfile(session.user.id)
      } else {
        // No session — clear cache
        localStorage.removeItem("ielts-profile")
        setUsername(null)
        setAvatarUrl(null)
      }
    })

    // Step 3 — listen for login/logout while page is open
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        setUsername(null)
        setAvatarUrl(null)
        localStorage.removeItem("ielts-profile")
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        fetchAndCacheProfile(session.user.id)
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user)
        fetchAndCacheProfile(session.user.id)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchAndCacheProfile(id) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", id)
      .maybeSingle()
    if (data) {
      setUsername(data.username ?? null)
      setAvatarUrl(data.avatar_url ?? null)
      localStorage.setItem("ielts-profile", JSON.stringify({
        username: data.username ?? null,
        avatarUrl: data.avatar_url ?? null,
      }))
    }
  }

  // Outside click closes dropdown
  useEffect(() => {
    function handleMouseDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  // Section highlight on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: "-40% 0px -55% 0px" }
    )
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id) {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  function expandBar() {
    setCollapsed(false)
    setWave(true)
    setTimeout(() => setWave(false), 600)
  }

  async function logout() {
    setDropdownOpen(false)
    setUser(null)
    setUsername(null)
    setAvatarUrl(null)
    localStorage.removeItem("ielts-profile")
    Object.keys(localStorage)
      .filter(k => k.startsWith("sb-") || k.includes("-week-"))
      .forEach(k => localStorage.removeItem(k))
    supabase.auth.signOut()
    window.location.href = window.location.origin
  }

  function handleProfileUpdated({ username: u, avatarUrl: a }) {
    setUsername(u)
    setAvatarUrl(a)
    localStorage.setItem("ielts-profile", JSON.stringify({ username: u, avatarUrl: a }))
  }

  const initials = (username || "?").slice(0, 2).toUpperCase()

  return (
    <>
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          currentUsername={username}
          currentAvatar={avatarUrl}
          onUpdated={handleProfileUpdated}
        />
      )}

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          animate={{ scale: collapsed ? 0.9 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`relative flex items-center border border-border bg-white/90 backdrop-blur-md shadow-md
            ${collapsed ? "w-12 h-12 rounded-full justify-center" : "px-2 sm:px-3 py-2 rounded-full gap-1"}`}
        >
          <AnimatePresence>
            {wave && (
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-primary/10 origin-left rounded-full" />
            )}
          </AnimatePresence>

          {collapsed ? (
            <button onClick={expandBar} className="flex items-center justify-center w-full h-full text-muted-foreground">
              <Eye size={20} />
            </button>
          ) : (
            <div className="relative flex items-center gap-1">
              {sections.map(item => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <motion.button key={item.id} onClick={() => scrollTo(item.id)}
                    whileHover={{ y: -3, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex items-center gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition"
                  >
                    {isActive && (
                      <motion.div layoutId="navHighlight"
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    )}
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{item.label}</span>
                  </motion.button>
                )
              })}

              {!user && (
                <button onClick={openAuth}
                  className="ml-2 sm:ml-3 flex items-center gap-2 px-2 sm:px-4 py-2 rounded-full bg-primary text-white text-xs sm:text-sm hover:opacity-90 transition">
                  <User size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {user && (
                <div ref={dropdownRef} className="relative ml-2 sm:ml-3">
                  <button onClick={() => setDropdownOpen(p => !p)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary hover:opacity-80 transition">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-[10px] font-bold text-primary">{initials}</span>}
                    </div>
                    <span className="text-xs sm:text-sm truncate max-w-[70px] sm:max-w-[100px]">
                      {username || "Account"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {avatarUrl
                              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-primary">{initials}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{username || "Account"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <button onClick={() => { setDropdownOpen(false); setProfileOpen(true) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/70 transition">
                          <Settings size={14} className="text-muted-foreground" />
                          Edit profile
                        </button>
                        <button onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t border-border/60">
                          <LogOut size={14} />
                          Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <motion.button onClick={() => setCollapsed(true)}
                whileHover={{ y: -2, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="ml-1 p-2 text-muted-foreground hover:text-primary transition">
                <EyeOff size={18} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
