import { motion, useInView, AnimatePresence } from "motion/react"
import { useRef, useState } from "react"
import { Headphones, BookOpen, PenTool, MessageCircle, ChevronRight, Clock, Target, TrendingUp } from "lucide-react"

const skills = [
  {
    id: "listening",
    icon: Headphones,
    emoji: "🎧",
    title: "Listening",
    tagline: "Train your ear, ace the test",
    color: "#7c3aed",
    lightColor: "rgba(124,58,237,0.06)",
    borderColor: "rgba(124,58,237,0.25)",
    img: "/images/IELTS listening.jpg",
    description: "Train with real IELTS listening tasks, note-taking drills, and timing discipline to catch every detail across 4 sections.",
    tips: ["Focus on keywords, not every word", "Predict answers before audio plays", "Practice with British & Australian accents"],
    stats: [
      { icon: Clock,      label: "Duration",    value: "30 min" },
      { icon: Target,     label: "Questions",   value: "40" },
      { icon: TrendingUp, label: "Band Target", value: "7.5+" },
    ],
  },
  {
    id: "reading",
    icon: BookOpen,
    emoji: "📖",
    title: "Reading",
    tagline: "Speed, strategy, precision",
    color: "#0ea5e9",
    lightColor: "rgba(14,165,233,0.06)",
    borderColor: "rgba(14,165,233,0.25)",
    img: "/images/IELTS reading.jpg",
    description: "Develop scanning, skimming, and inference strategies to boost your speed and answer accuracy under exam pressure.",
    tips: ["Skim headings before deep reading", "Match paragraph type to question type", "Max 20 minutes per passage"],
    stats: [
      { icon: Clock,      label: "Duration",    value: "60 min" },
      { icon: Target,     label: "Questions",   value: "40" },
      { icon: TrendingUp, label: "Band Target", value: "7+" },
    ],
  },
  {
    id: "writing",
    icon: PenTool,
    emoji: "✍️",
    title: "Writing",
    tagline: "Structure, vocabulary, clarity",
    color: "#f59e0b",
    lightColor: "rgba(245,158,11,0.06)",
    borderColor: "rgba(245,158,11,0.25)",
    img: "/images/IELTS writing.jpg",
    description: "Master Task 1 data reports and Task 2 essays with band-level vocabulary, coherence, and strong argument structure.",
    tips: ["Always plan before writing", "Task 2 = 40 min, Task 1 = 20 min", "Vary sentence structures throughout"],
    stats: [
      { icon: Clock,      label: "Duration",    value: "60 min" },
      { icon: Target,     label: "Tasks",       value: "2" },
      { icon: TrendingUp, label: "Band Target", value: "7+" },
    ],
  },
  {
    id: "speaking",
    icon: MessageCircle,
    emoji: "🎙️",
    title: "Speaking",
    tagline: "Fluency, range, confidence",
    color: "#10b981",
    lightColor: "rgba(16,185,129,0.06)",
    borderColor: "rgba(16,185,129,0.25)",
    img: "/images/IELTS speaking.jpg",
    description: "Build fluency, coherence, and lexical range through timed responses, cue card drills, and mock interview practice.",
    tips: ["Use connectors: however, moreover", "Extend answers with examples", "Avoid long pauses — use fillers naturally"],
    stats: [
      { icon: Clock,      label: "Duration",    value: "11–14 min" },
      { icon: Target,     label: "Parts",       value: "3" },
      { icon: TrendingUp, label: "Band Target", value: "7+" },
    ],
  },
]

export default function SkillsSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [active, setActive] = useState("listening")
  const current = skills.find(s => s.id === active)

  return (
    <section id="skills" ref={ref} className="py-24 px-4 sm:px-6 relative overflow-hidden bg-background">

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
            ✦ Skills
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">
            Master All{" "}
            <span className="text-primary relative">
              Four Skills
              <motion.span
                initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/30 rounded-full origin-left block"
              />
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Each skill is trained systematically with targeted exercises, timed practice, and proven exam strategies.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {skills.map((s, i) => {
            const isActive = active === s.id
            return (
              <motion.button
                key={s.id}
                onClick={() => setActive(s.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.25 + i * 0.06 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive ? s.color : "transparent",
                  borderColor:     isActive ? s.color : undefined,
                  color:           isActive ? "#fff"  : undefined,
                  boxShadow:       isActive ? `0 4px 20px ${s.color}40` : "none",
                }}
              >
                <span>{s.emoji}</span>
                {s.title}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Active skill panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: current.borderColor, backgroundColor: current.lightColor }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* Image */}
              <div className="relative h-56 sm:h-72 lg:h-auto min-h-[280px] overflow-hidden">
                <img src={current.img} alt={current.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${current.color}cc 0%, transparent 60%)` }} />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="text-4xl mb-2">{current.emoji}</div>
                  <h3 className="text-3xl font-extrabold text-white">{current.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{current.tagline}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex flex-col justify-between gap-6 bg-background/80 backdrop-blur-sm">
                <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">{current.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {current.stats.map(stat => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
                        <Icon size={14} className="mx-auto mb-1" style={{ color: current.color }} />
                        <div className="text-sm font-bold text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Tips */}
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: current.color }}>
                    Expert Tips
                  </p>
                  <div className="space-y-2">
                    {current.tips.map((tip, i) => (
                      <motion.div
                        key={tip}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2 text-sm text-foreground/70"
                      >
                        <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: current.color }} />
                        {tip}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom mini cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {skills.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.id}
                onClick={() => setActive(s.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="relative group rounded-2xl overflow-hidden border text-left transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: active === s.id ? s.color : undefined }}
              >
                <img src={s.img} alt={s.title} className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-105 opacity-60" />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${s.color}ee 0%, transparent 60%)` }} />
                <div className="absolute bottom-0 left-0 p-3 flex items-center gap-2">
                  <Icon size={14} className="text-white flex-shrink-0" />
                  <span className="text-white text-xs font-bold">{s.title}</span>
                </div>
                {active === s.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                )}
              </motion.button>
            )
          })}
        </div>

      </div>
    </section>
  )
}
