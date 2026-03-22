import { motion, useInView, AnimatePresence } from "motion/react"
import { useRef, useState } from "react"
import { Target, ArrowRight, CheckCircle, Zap, Clock, Trophy } from "lucide-react"

// ── Data derived from PLAN_META ───────────────────────────────────────────────
const plans = [
  {
    id:         "sprint",
    Icon:       Zap,
    label:      "25-Day Plan",
    band:       "6.5+",
    color:      "#7c3aed",
    accent:     "#ede9fe",
    badge:      "Best for retakes",
    days:       "25 days",
    weeks:      "5 weeks",
    hours:      "2–3 hrs/day",
    mocks:      13,
    forWho:     "I know English well — I just need exam technique and practice",
    highlights: ["13 full mock tests", "All 4 skills covered", "Writing & Speaking templates", "Band 6.5+ target"],
    roadmap: [
      { phase: "Week 1–2", title: "Listening & Reading",   desc: "Learn test formats, do timed drills, build speed and accuracy.", color: "#7c3aed" },
      { phase: "Week 3",   title: "Writing & Speaking",    desc: "Task 1 & Task 2 structures. Speaking templates on JumpInto.", color: "#9333ea" },
      { phase: "Week 4",   title: "Mock Tests & Errors",   desc: "5 full mocks. Track mistakes. Fix weak spots fast.", color: "#a855f7" },
      { phase: "Week 5",   title: "Exam Simulation",       desc: "Final 5 mocks. Real conditions. Confidence and polish.", color: "#c084fc" },
    ],
  },
  {
    id:         "standard",
    Icon:       Clock,
    label:      "2-Month Plan",
    band:       "7.0+",
    color:      "#0ea5e9",
    accent:     "#e0f2fe",
    badge:      "Most popular",
    days:       "56 days",
    weeks:      "8 weeks",
    hours:      "3–4 hrs/day",
    mocks:      20,
    forWho:     "I want a full preparation with deep skill-building and lots of practice",
    highlights: ["20 full mock tests", "Writing templates", "Speaking templates", "Band 7.0+ target"],
    roadmap: [
      { phase: "Month 1 · W1–2", title: "Foundations",          desc: "Listening & reading formats, core strategies, vocabulary building.", color: "#0ea5e9" },
      { phase: "Month 1 · W3–4", title: "Writing & Speaking",   desc: "Task 1 data/graphs, Task 2 essays, Part 1–3 speaking fluency.", color: "#38bdf8" },
      { phase: "Month 2 · W5–6", title: "Full Mock Tests",      desc: "10 complete mocks. Detailed error tracking and targeted fixes.", color: "#7dd3fc" },
      { phase: "Month 2 · W7–8", title: "Exam Simulation",      desc: "Final 10 mocks under real conditions. Consolidation and confidence.", color: "#bae6fd" },
    ],
  },
  {
    id:         "comprehensive",
    Icon:       Trophy,
    label:      "3-Month Plan",
    band:       "7.5+",
    color:      "#f97316",
    accent:     "#fff7ed",
    badge:      "Highest band target",
    days:       "84 days",
    weeks:      "12 weeks",
    hours:      "3–4 hrs/day",
    mocks:      32,
    forWho:     "I want the highest possible score with full preparation",
    highlights: ["32 full mock tests", "Full grammar work", "Complete templates", "Band 7.5+ target"],
    roadmap: [
      { phase: "Month 1",      title: "Language Foundations",   desc: "Grammar, advanced vocabulary, listening & reading mastery.", color: "#f97316" },
      { phase: "Month 2",      title: "Exam Skills Deep-Dive",  desc: "All writing task types, full speaking fluency, 12 full mocks.", color: "#fb923c" },
      { phase: "Month 3 W9–11",title: "Advanced Mastery",       desc: "Error elimination, sophisticated vocabulary, 12 more mocks.", color: "#fdba74" },
      { phase: "Month 3 W12",  title: "Exam Simulation",        desc: "Final 8 mocks. Confidence, timing, exam-day precision.", color: "#fed7aa" },
    ],
  },
]

const skills = [
  { icon: "🎧", label: "Listening", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)",
    img: "https://images.ctfassets.net/unrdeg6se4ke/1UDgBlLmYloO1wf0vW5HRl/a5c2d5292319cdb58701e4a69a766e1f/luyen-nghe-ielts-part-1.jpg?&w=1220",
    desc: "Train your ear with authentic accents and timed practice tests." },
  { icon: "📖", label: "Reading",   color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)",
    img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    desc: "Master skimming, scanning, and inference for complex passages." },
  { icon: "✍️", label: "Writing",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
    desc: "Craft band 7+ Task 1 reports and Task 2 essays with confidence." },
  { icon: "🎙️", label: "Speaking",  color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",
    img: "https://pecpte.com/wp-content/uploads/2021/02/IELTS-Speaking-Test.jpeg",
    desc: "Develop fluency, coherence, and vocabulary range for the interview." },
]


// ── MethodologyAccordion ──────────────────────────────────────────────────────
const METHOD_SECTIONS = [
  {
    id: "simon",
    emoji: "📘",
    label: "Simon",
    title: "Simon's Teaching",
    tagline: "Strategy & templates — the brain of every plan",
    color: "#7c3aed",
    content: [
      { text: "Simon's method is built on one core principle: ", bold: false },
      { text: "simplicity with precision", bold: true },
      { text: ". No complicated language, no filler — just the clearest path to a high band score.", bold: false },
    ],
    bullets: [
      { label: "4 core rules", desc: "written at the top of the plan for students to copy into their notebooks on Day 1 — because understanding the method matters more than following it blindly." },
      { label: "Named lessons", desc: "every task directly references Simon’s specific material — “Read Simon’s Task 2 introduction (30 min)” — so students know exactly what to open and why." },
      { label: "Ideas before language", desc: "his writing and speaking templates ensure students express clear ideas first, then wrap them in the right vocabulary — not the other way around." },
    ],
  },
  {
    id: "jumpinto",
    emoji: "🤖",
    label: "JumpInto",
    title: "JumpInto AI Practice",
    tagline: "Daily feedback partner — not just an occasional exercise",
    color: "#0ea5e9",
    content: [
      { text: "JumpInto is wired into ", bold: false },
      { text: "every single day", bold: true },
      { text: " of the plan for Speaking practice across all 3 parts — with AI feedback that actually tells you what to fix.", bold: false },
    ],
    bullets: [
      { label: "4 scored criteria", desc: "Fluency, Vocabulary, Grammar, and Pronunciation — students are told exactly which score to focus on each week and what to do differently based on that feedback." },
      { label: "All 4 skills tested", desc: "full AI-scored mock tests for Listening, Reading, Writing, and Speaking — one platform that covers the entire exam." },
      { label: "Daily training partner", desc: "not an optional resource. Every week has specific JumpInto targets — e.g. 'aim for a Fluency score above 6.5 by Week 3'." },
    ],
  },
  {
    id: "engnovate",
    emoji: "📊",
    label: "Engnovate",
    title: "Engnovate Mock Tests",
    tagline: "Cambridge-format tests with measurable progress tracking",
    color: "#10b981",
    content: [
      { text: "Engnovate handles the ", bold: false },
      { text: "heavy lifting of structured testing", bold: true },
      { text: " — every mock in the plan is Cambridge-format and automatically scored so progress is always measurable.", bold: false },
    ],
    bullets: [
      { label: "Cambridge-format mocks", desc: "identical to real exam conditions — students get an accurate band estimate after every single test, not just a percentage." },
      { label: "AI writing scoring", desc: "essays submitted for AI feedback on all 4 writing criteria: Task Achievement, Coherence, Lexical Resource, and Grammar." },
      { label: "Pronunciation & shadowing", desc: "scheduled on specific days when speaking skills need deepening — not random, but deliberately placed at the right point in each plan." },
    ],
  },
  {
    id: "discord",
    emoji: "💬",
    label: "Discord",
    title: "Discord Speaking",
    tagline: "Human interaction — the one thing AI cannot replace",
    color: "#f97316",
    content: [
      { text: "Every single week has a dedicated ", bold: false },
      { text: "structured Discord session", bold: true },
      { text: " — extending to 1.5 hours in Month 2 — each with a specific focus so it builds progressively.", bold: false },
    ],
    bullets: [
      { label: "Progressive structure", desc: "Part 2 practice in Week 3, Part 3 abstract discussion in Week 4, full mock simulations in the final weeks — never just 'go talk to someone'." },
      { label: "Real examiner pressure", desc: "speaking with a real person who can ask follow-up questions prepares you for the unpredictability of the actual Speaking test in a way no AI can replicate." },
      { label: "1–1.5 hours weekly", desc: "the minimum needed to build the confidence and spontaneity required for a Band 7+ speaking performance." },
    ],
  },
]

function MethodologyAccordion({ isInView }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="mt-10 rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* ── Toggle header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-5 hover:bg-secondary/30 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base">⚡</span>
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-foreground leading-tight">
              Why This Plan Works — The Method Behind It
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simon · JumpInto · Engnovate · Discord — how the four tools combine
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0 ml-3 w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 border-t border-border">

              {/* Intro line */}
              <p className="text-sm text-muted-foreground leading-relaxed pt-5 pb-6 max-w-3xl">
                Each plan is built around <strong className="text-foreground font-semibold">four tools that do completely different jobs</strong> — none of them redundant, each one doing something the others cannot.
              </p>

              {/* 4 sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {METHOD_SECTIONS.map(sec => (
                  <div key={sec.id}
                    className="rounded-xl border p-4 sm:p-5"
                    style={{ borderColor: sec.color + "30", backgroundColor: sec.color + "08" }}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: sec.color + "18" }}>
                        {sec.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{sec.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{sec.tagline}</p>
                      </div>
                    </div>

                    {/* Lead sentence */}
                    <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                      {sec.content.map((chunk, ci) =>
                        chunk.bold
                          ? <strong key={ci} className="text-foreground font-semibold">{chunk.text}</strong>
                          : <span key={ci}>{chunk.text}</span>
                      )}
                    </p>

                    {/* Bullets */}
                    <ul className="space-y-2.5">
                      {sec.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <p className="text-xs text-foreground/75 leading-relaxed">
                            <strong className="text-foreground font-semibold">{b.label}</strong>
                            {" — "}{b.desc}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Bottom summary strip */}
              <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3.5 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { color: "#7c3aed", text: "Simon gives the strategy & templates" },
                  { color: "#0ea5e9", text: "JumpInto gives daily AI feedback" },
                  { color: "#10b981", text: "Engnovate gives structured mock tests" },
                  { color: "#f97316", text: "Discord gives real human practice" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-foreground/80">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    {item.text}
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OverviewSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="overview" ref={ref} className="py-24 px-4 sm:px-6 relative overflow-hidden bg-background">

      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl mx-auto relative">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
            ✦ Overview
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">
            Pick the Plan That{" "}
            <span className="text-primary relative">
              Fits You
              <motion.span
                initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/30 rounded-full origin-left block"
              />
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Three structured programmes for different timelines and goals. Every plan covers
            all 4 IELTS skills with daily tasks, timed drills, full mock tests, and writing & speaking templates.
          </p>
        </motion.div>

        {/* ── 3 Plan Comparison Cards ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-all duration-300"
              style={{ borderColor: plan.color + "33" }}
            >
              {/* Coloured top strip */}
              <div className="h-1.5 w-full" style={{ backgroundColor: plan.color }} />

              <div className="p-5">
                {/* Badge */}
                <span
                  className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white mb-3 tracking-wide"
                  style={{ backgroundColor: plan.color }}
                >
                  {plan.badge}
                </span>

                {/* Icon + label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: plan.accent }}>
                    <plan.Icon size={15} style={{ color: plan.color }} />
                  </div>
                  <span className="font-bold text-sm text-foreground">{plan.label}</span>
                </div>

                {/* Band */}
                <div className="text-4xl font-extrabold mb-1" style={{ color: plan.color }}>
                  Band {plan.band}
                </div>

                {/* Quick stats row */}
                <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">📅 {plan.weeks}</span>
                  <span className="flex items-center gap-1">⏱ {plan.hours}</span>
                  <span className="flex items-center gap-1">📝 {plan.mocks} full mocks</span>
                </div>

                {/* For who */}
                <p className="text-xs italic text-muted-foreground border-l-2 pl-3 mb-4 leading-relaxed"
                  style={{ borderColor: plan.color + "60" }}>
                  "{plan.forWho}"
                </p>

                {/* Highlights */}
                <div className="space-y-1.5">
                  {plan.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle size={12} style={{ color: plan.color }} className="flex-shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>

                {/* Roadmap */}
                <div className="mt-5 pt-4 border-t border-border space-y-2">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Roadmap</p>
                  {plan.roadmap.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.phase} · </span>
                        <span className="text-[11px] font-semibold text-foreground">{r.title}</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── 4 Skills Grid ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-center mb-8 text-foreground">
            All 4 IELTS Skills — Covered in Every Plan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl"
                style={{ borderColor: skill.border, backgroundColor: skill.bg }}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={skill.img}
                    alt={skill.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="text-white font-bold text-base">{skill.label}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{skill.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick comparison table ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Target size={16} className="text-primary" />
            <h3 className="font-bold text-base">At a Glance — Which Plan is Right for You?</h3>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-4 border-b border-border text-xs font-semibold text-muted-foreground">
            <div className="px-4 py-3 border-r border-border"></div>
            {plans.map(p => (
              <div key={p.id} className="px-4 py-3 border-r border-border last:border-r-0 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                {p.label}
              </div>
            ))}
          </div>

          {[
            { label: "Duration",    vals: ["25 days", "2 months", "3 months"] },
            { label: "Daily time",  vals: ["2–3 hrs",  "3–4 hrs",  "3–4 hrs"] },
            { label: "Full mocks",  vals: ["13",        "20",        "32"]      },
            { label: "Band target", vals: ["6.5+",      "7.0+",      "7.5+"]    },
            { label: "Best for",    vals: ["Retakers / exam-ready", "Full preparation", "Maximum score"] },
          ].map((row, ri) => (
            <div key={ri} className={`grid grid-cols-4 text-xs ${ri % 2 === 0 ? "bg-secondary/20" : ""}`}>
              <div className="px-4 py-3 border-r border-border font-medium text-muted-foreground">{row.label}</div>
              {row.vals.map((v, vi) => (
                <div key={vi} className="px-4 py-3 border-r border-border last:border-r-0 text-foreground/80">{v}</div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* ── Methodology Accordion ─────────────────────────────────────────── */}
        <MethodologyAccordion isInView={isInView} />

        {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {["All plans cover every IELTS skill", "Writing & speaking templates included", "Full mock tests in every plan"].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-foreground/80">
                <CheckCircle size={14} className="text-primary flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <a
            href="#study-plan"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary whitespace-nowrap hover:gap-2.5 transition-all"
          >
            Choose Your Plan <ArrowRight size={15} />
          </a>
        </motion.div>

      </div>
    </section>
  )
}
