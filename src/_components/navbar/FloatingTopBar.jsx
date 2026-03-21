import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "../_lib/supabase"
import ProfileModal from "./ProfileModal"
import {
  LayoutDashboard, Brain, CalendarDays, Mail,
  Eye, EyeOff, User, Library, LogOut, Settings, Moon, Sun
} from "lucide-react"

const sections = [
  { id: "overview",   icon: LayoutDashboard, label: "Overview"  },
  { id: "skills",     icon: Brain,           label: "Skills"    },
  { id: "study-plan", icon: CalendarDays,    label: "Plan"      },
  { id: "resources",  icon: Library,         label: "Resources" },
  { id: "contact",    icon: Mail,            label: "Contact"   },
]

export default function FloatingTopBar({ openAuth }) {
  // ── Dark mode ─────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("ielts-theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("ielts-theme", dark ? "dark" : "light")
  }, [dark])

  const [active,       setActive]       = useState("overview")
  const [collapsed,    setCollapsed]    = useState(false)
  const [wave,         setWave]         = useState(false)
  const [user,         setUser]         = useState(null)
  const [username,     setUsername]     = useState(null)
  const [avatarUrl,    setAvatarUrl]    = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  // Track whether nav scroll area can scroll (for fade indicators)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const dropdownRef = useRef(null)
  const navScrollRef = useRef(null)

  // ── Check scroll edges ────────────────────────────────────────────────────
  function checkScroll() {
    const el = navScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }
  useEffect(() => {
    const el = navScrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect() }
  }, [collapsed])

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("ielts-profile") || "null")
      if (cached?.username) { setUsername(cached.username); setAvatarUrl(cached.avatarUrl ?? null) }
    } catch {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchAndCacheProfile(session.user.id) }
      else { localStorage.removeItem("ielts-profile"); setUsername(null); setAvatarUrl(null) }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null); setUsername(null); setAvatarUrl(null)
        localStorage.removeItem("ielts-profile")
      } else if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        setUser(session.user); fetchAndCacheProfile(session.user.id)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchAndCacheProfile(id) {
    const { data } = await supabase.from("profiles").select("username, avatar_url").eq("id", id).maybeSingle()
    if (data) {
      setUsername(data.username ?? null); setAvatarUrl(data.avatar_url ?? null)
      localStorage.setItem("ielts-profile", JSON.stringify({ username: data.username ?? null, avatarUrl: data.avatar_url ?? null }))
    }
  }

  useEffect(() => {
    function handleMouseDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

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
    setCollapsed(false); setWave(true); setTimeout(() => setWave(false), 600)
  }

  async function logout() {
    setDropdownOpen(false); setUser(null); setUsername(null); setAvatarUrl(null)
    localStorage.removeItem("ielts-profile")
    Object.keys(localStorage).filter(k => k.startsWith("sb-") || k.includes("-week-")).forEach(k => localStorage.removeItem(k))
    supabase.auth.signOut()
    window.location.href = window.location.origin
  }

  function handleProfileUpdated({ username: u, avatarUrl: a }) {
    setUsername(u); setAvatarUrl(a)
    localStorage.setItem("ielts-profile", JSON.stringify({ username: u, avatarUrl: a }))
  }

  const initials = (username || "?").slice(0, 2).toUpperCase()

  return (
    <>
      {user && (
        <ProfileModal
          open={profileOpen} onClose={() => setProfileOpen(false)}
          user={user} currentUsername={username} currentAvatar={avatarUrl}
          onUpdated={handleProfileUpdated}
        />
      )}

      {/* ── Fixed wrapper — centred, capped so it never overflows screen ── */}
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] sm:w-auto max-w-full">
        <motion.div
          animate={{ scale: collapsed ? 0.9 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`relative flex items-center border border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md
            ${collapsed ? "w-12 h-12 rounded-full justify-center mx-auto" : "rounded-full"}`}
        >
          <AnimatePresence>
            {wave && (
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-primary/10 origin-left rounded-full pointer-events-none" />
            )}
          </AnimatePresence>

          {collapsed ? (
            <button onClick={expandBar} className="flex items-center justify-center w-full h-full text-muted-foreground">
              <Eye size={20} />
            </button>
          ) : (
            /* ── Expanded layout: [scroll-zone] [pinned-actions] ── */
            <div className="flex items-center min-w-0 w-full">

              {/* ── Scrollable nav items ── */}
              <div className="relative flex-1 min-w-0">
                {/* Left fade when scrolled right */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-6 rounded-l-full pointer-events-none z-10 transition-opacity duration-200"
                  style={{
                    opacity: canScrollLeft ? 1 : 0,
                    background: "linear-gradient(to right, var(--background), transparent)",
                  }}
                />
                {/* Right fade when more content is available */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-6 rounded-r-full pointer-events-none z-10 transition-opacity duration-200"
                  style={{
                    opacity: canScrollRight ? 1 : 0,
                    background: "linear-gradient(to left, var(--background), transparent)",
                  }}
                />

                <div
                  ref={navScrollRef}
                  className="flex items-center gap-0.5 overflow-x-auto px-2 sm:px-3 py-2"
                  style={{
                    scrollbarWidth: "none",       // Firefox
                    msOverflowStyle: "none",      // IE
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {/* Hide scrollbar in WebKit */}
                  <style>{`.nav-scroll::-webkit-scrollbar{display:none}`}</style>

                  {sections.map(item => {
                    const Icon = item.icon
                    const isActive = active === item.id
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        whileHover={{ y: -2, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition flex-shrink-0 touch-manipulation"
                      >
                        {isActive && (
                          <motion.div layoutId="navHighlight"
                            className="absolute inset-0 bg-primary/10 rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                        )}
                        <Icon size={16} className="relative z-10 flex-shrink-0" />
                        {/* Show label always — they're short enough with scrolling */}
                        <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* ── Pinned action buttons — never scroll ── */}
              <div className="flex items-center gap-0.5 flex-shrink-0 pr-1.5 pl-1 border-l border-border/40">

                {/* Sign in / avatar */}
                {!user && (
                  <button
                    onClick={openAuth}
                    className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary text-white text-xs sm:text-sm hover:opacity-90 transition flex-shrink-0 touch-manipulation"
                  >
                    <User size={14} />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {user && (
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen(p => !p)}
                      className="flex items-center gap-2 pl-0.5 pr-2.5 py-0.5 rounded-full hover:bg-secondary/80 transition-all duration-200 touch-manipulation group"
                    >
                      {/* Avatar with ring */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-200 bg-primary/10 flex items-center justify-center">
                          {avatarUrl
                            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            : <span className="text-xs font-bold text-primary">{initials}</span>}
                        </div>
                        {/* Online dot */}
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
                      </div>
                      {/* Username — visible sm+ */}
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[80px] hidden sm:block">
                        {username || "Account"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 320, damping: 26 }}
                          className="absolute right-0 mt-3 w-56 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                        >
                          {/* Profile header */}
                          <div className="px-4 pt-4 pb-3 border-b border-border/60">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/20 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                {avatarUrl
                                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                  : <span className="text-sm font-bold text-primary">{initials}</span>}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{username || "Account"}</p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu items */}
                          <div className="py-1">
                            <button
                              onClick={() => { setDropdownOpen(false); setProfileOpen(true) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                <Settings size={13} className="text-muted-foreground" />
                              </div>
                              Edit profile
                            </button>
                          </div>

                          <div className="border-t border-border/60 py-1">
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/8 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <LogOut size={13} className="text-red-400" />
                              </div>
                              Log out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Dark mode toggle */}
                <motion.button
                  onClick={() => setDark(d => !d)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  title={dark ? "Light mode" : "Dark mode"}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition rounded-full touch-manipulation"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {dark
                      ? <motion.div key="sun"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><Sun  size={15}/></motion.div>
                      : <motion.div key="moon" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.18 }}><Moon size={15}/></motion.div>
                    }
                  </AnimatePresence>
                </motion.button>

                {/* Collapse */}
                <motion.button
                  onClick={() => setCollapsed(true)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition touch-manipulation"
                >
                  <EyeOff size={15} />
                </motion.button>

              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
