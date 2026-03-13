import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Clock, Target, BookOpen, BarChart3, Mic, GraduationCap, ArrowRight, CheckCircle } from "lucide-react"

const skills = [
  {
    icon: "🎧",
    label: "Listening",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    img: "https://images.ctfassets.net/unrdeg6se4ke/1UDgBlLmYloO1wf0vW5HRl/a5c2d5292319cdb58701e4a69a766e1f/luyen-nghe-ielts-part-1.jpg?&w=1220",
    desc: "Train your ear with authentic accents and timed practice tests.",
  },
  {
    icon: "📖",
    label: "Reading",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
    img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    desc: "Master skimming, scanning, and inference for complex passages.",
  },
  {
    icon: "✍️",
    label: "Writing",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
    desc: "Craft band 7+ Task 1 reports and Task 2 essays with confidence.",
  },
  {
    icon: "🎙️",
    label: "Speaking",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    img: "https://pecpte.com/wp-content/uploads/2021/02/IELTS-Speaking-Test.jpeg",
    desc: "Develop fluency, coherence, and vocabulary range for the interview.",
  },
]

const stats = [
  { value: "25", unit: "Days", label: "Intensive Program" },
  { value: "4",  unit: "Skills", label: "Fully Covered" },
  { value: "7+", unit: "Band", label: "Target Score" },
  { value: "100+", unit: "Tasks", label: "Practice Exercises" },
]

const milestones = [
  { week: "Week 1–2", title: "Foundation & Drilling", desc: "Build core listening and reading skills with focused daily practice.", color: "#7c3aed" },
  { week: "Week 3",   title: "Writing & Speaking Intro", desc: "Learn Task 1, Task 2 structure and speaking techniques.", color: "#0ea5e9" },
  { week: "Week 4",   title: "Full Mock Tests", desc: "Timed simulations across all 4 skills. Track and fix weak points.", color: "#f59e0b" },
  { week: "Week 5",   title: "Exam Simulation", desc: "Real exam conditions, final polish, and confidence building.", color: "#10b981" },
]

export default function OverviewSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="overview" ref={ref} className="py-24 px-4 sm:px-6 relative overflow-hidden bg-background">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl mx-auto relative">

        {/* ── Header ───────────────────────────────────────────────────────── */}
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
            Your Path to{" "}
            <span className="text-primary relative">
              Band 7+
              <motion.span
                initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/30 rounded-full origin-left block"
              />
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            A 25-day structured program for B1–B2 students. Every day targets a specific skill
            with guided tasks, timed drills, and expert-level tips.
          </p>
        </motion.div>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="text-3xl font-extrabold text-primary leading-none">
                {s.value}<span className="text-lg font-bold text-primary/60">{s.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── 4 Skills Grid with images ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-center mb-8 text-foreground">
            All 4 IELTS Skills — Fully Covered
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl"
                style={{ borderColor: skill.border, backgroundColor: skill.bg }}
              >
                {/* Image */}
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
                {/* Text */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{skill.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Program Timeline ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Target size={16} className="text-primary" />
            <h3 className="font-bold text-base">5-Week Roadmap</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {milestones.map((m, i) => (
              <motion.div
                key={m.week}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="p-5 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{m.week}</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{m.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom CTA strip ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {["No prior IELTS prep needed", "Designed for B1–B2 students", "Realistic Band 7 target"].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-foreground/80">
                <CheckCircle size={14} className="text-primary flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <a href="#study-plan"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary whitespace-nowrap hover:gap-2.5 transition-all">
            Start the Plan <ArrowRight size={15} />
          </a>
        </motion.div>

      </div>
    </section>
  )
}
