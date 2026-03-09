import { useState } from "react"
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

export default function Index() {

  const [openNotebook, setOpenNotebook] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  return (

    <div className="min-h-screen bg-background text-foreground">

      {/* Navigation */}
      <FloatingTopBar openAuth={() => setAuthOpen(true)} />
      <DailyReminder/>
      {/* Sections */}
      <HeroSection/>
      <OverviewSection/>
      <SkillsSection/>
      <StudyPlanSection/>
      <ResourcesSection/>
      <ContactSection/>
      <Footer/>

      {/* Floating notebook button */}
      <FloatingNotebookButton
        openNotebook={() => setOpenNotebook(true)}
      />

      {/* Notebook modal */}
      <NotebookModal
        open={openNotebook}
        onClose={() => setOpenNotebook(false)}
      />

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />

        <Toaster position="top-center" />

    </div>

  )

}