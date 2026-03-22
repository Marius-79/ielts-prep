import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import HeroSection from "../_components/hero/hero-section.jsx"
import ProgressDashboard from "../_components/dashboard/ProgressDashboard.jsx"
import OverviewSection from "../_components/overview/overview-section.jsx"
import SkillsSection from "../_components/skills/skills-section.jsx"
import StudyPlanSection from "../_components/study-plan/study-plan-section.jsx"
import ContactSection from "../_components/contact/contact-section.jsx"
import Footer from "../_components/footer/footer.jsx"
import DailyReminder from "../_components/reminder/DailyReminder.jsx"
import FloatingTopBar from "../_components/navbar/FloatingTopBar.jsx"
import ResourcesSection from "../_components/resources/resources-section.jsx"
import NotebookModal from "../_components/notebook/NotebookModal.jsx"
import FloatingNotebookButton from "../_components/notebook/FloatingNotebookButton.jsx"
import AuthModal from "../_components/auth/AuthModal.jsx"
import { supabase } from "../_components/_lib/supabase.js"

export default function Index() {
  const [notebookOpen, setNotebookOpen] = useState(false)
  const [authOpen,     setAuthOpen]     = useState(false)
  const [authMode,     setAuthMode]     = useState("login")
  const [user,         setUser]         = useState(null)
  const [username,     setUsername]     = useState(null)
  const [avatarUrl,    setAvatarUrl]    = useState(null)
  const [authLoading,  setAuthLoading]  = useState(true)

  useEffect(() => {
    // Resolve session immediately — prevents hero flashing on refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null); setUsername(null); setAvatarUrl(null)
      } else if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    // Show cached data instantly
    try {
      const cached = JSON.parse(localStorage.getItem("ielts-profile") || "null")
      if (cached?.username)  setUsername(cached.username)
      if (cached?.avatarUrl) setAvatarUrl(cached.avatarUrl)
    } catch {}

    // Fetch fresh from Supabase
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle()

    if (data) {
      if (data.username)   setUsername(data.username)
      if (data.avatar_url) setAvatarUrl(data.avatar_url)
      // Update cache
      try {
        localStorage.setItem("ielts-profile", JSON.stringify({
          username:  data.username  || null,
          avatarUrl: data.avatar_url || null,
        }))
      } catch {}
    }
  }

  // Tiny spinner while Supabase resolves — prevents hero flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-7 h-7 rounded-full border-2 border-primary/20"
          style={{ borderTopColor:"var(--primary)", animation:"spin 0.7s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FloatingTopBar
        openAuth={()   => { setAuthMode("login");   setAuthOpen(true) }}
        openSignup={()  => { setAuthMode("signup");  setAuthOpen(true) }}
      />
      <DailyReminder />

      {/* KEY SWAP — Dashboard replaces Hero for logged-in users */}
      {user
        ? <ProgressDashboard user={user} username={username} avatarUrl={avatarUrl} />
        : <HeroSection />
      }

      <OverviewSection />
      <SkillsSection />
      <StudyPlanSection openAuth={() => { setAuthMode("login"); setAuthOpen(true) }} />
      <ResourcesSection />
      <ContactSection />
      <Footer />

      <FloatingNotebookButton openNotebook={() => setNotebookOpen(true)} />
      <NotebookModal
        open={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        openAuth={() => { setNotebookOpen(false); setAuthOpen(true) }}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
      />
      <Toaster position="top-center" />
    </div>
  )
}
