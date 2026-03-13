import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import HeroSection from "../_components/hero/hero-section.jsx"
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
  const [authOpen, setAuthOpen]         = useState(false)
  const [user, setUser]                 = useState(null)

  // Track auth state globally so Notebook (and any other component) can use it
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") setUser(null)
      else if (session?.user) setUser(session.user)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">

      <FloatingTopBar openAuth={() => setAuthOpen(true)} />
      <DailyReminder />

      <HeroSection />
      <OverviewSection />
      <SkillsSection />
      <StudyPlanSection openAuth={() => setAuthOpen(true)} />
      <ResourcesSection />
      <ContactSection />
      <Footer />

      <FloatingNotebookButton openNotebook={() => setNotebookOpen(true)} />

      <NotebookModal
        open={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        user={user}
        openAuth={() => { setNotebookOpen(false); setAuthOpen(true) }}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <Toaster position="top-center" />
    </div>
  )
}
