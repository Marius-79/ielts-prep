import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Send, ExternalLink, ArrowUpRight, Zap, BookOpen, Target } from "lucide-react"

const resources = [
  {
    id: "telegram",
    label: "Community",
    title: "Telegram Resource Pack",
    tagline: "Vocabulary · Writing Samples · Exercises",
    description: "Join an active channel with curated IELTS vocabulary lists, writing samples, reading passages and exercises updated regularly.",
    icon: Send,
    link: "https://t.me/+N0LeTyNV-rYxYzRk",
    button: "Join Channel",
    color: "#0088cc",
    accent: "rgba(0,136,204,0.08)",
    stats: [
      { icon: Zap,      label: "Updated",  value: "Weekly"  },
      { icon: BookOpen, label: "Content",  value: "All skills" },
      { icon: Target,   label: "Level",    value: "B2–C1"   },
    ],
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    imgAlt: "Students studying together",
  },
  {
    id: "jumpinto",
    label: "Mock Tests",
    title: "JumpInto IELTS Tests",
    tagline: "Timed · Scored · Realistic",
    description: "Practice full IELTS-style reading and listening tests with real exam timing, answer sheets, and automatic scoring simulation.",
    icon: ExternalLink,
    link: "https://www.jumpinto.com/ielts/practice",
    button: "Open Website",
    color: "#7c3aed",
    accent: "rgba(124,58,237,0.08)",
    stats: [
      { icon: Zap,      label: "Format",   value: "Real exam"  },
      { icon: BookOpen, label: "Skills",   value: "L + R"      },
      { icon: Target,   label: "Scoring",  value: "Auto"       },
    ],
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    imgAlt: "Person taking a test",
  },
  {
    id: "engnovate",
    label: "Practice",
    title: "Engnovate Practice",
    tagline: "Reading · Listening · Writing",
    description: "Additional mock tests and skill-based IELTS exercises to reinforce every module with targeted, exam-level difficulty.",
    icon: ExternalLink,
    link: "https://engnovate.com",
    button: "Start Practicing",
    color: "#059669",
    accent: "rgba(5,150,105,0.08)",
    stats: [
      { icon: Zap,      label: "Skills",   value: "R + L + W" },
      { icon: BookOpen, label: "Tests",    value: "Exam-level" },
      { icon: Target,   label: "Use",      value: "Daily"      },
    ],
    img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    imgAlt: "Open notebook with pen",
  },
]

function ResourceCard({ item, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const Icon   = item.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img
          src={item.img}
          alt={item.imgAlt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${item.color}22 0%, ${item.color}88 100%)` }}
        />
        {/* Label badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </span>
        </div>
        {/* Icon */}
        <div
          className="absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md"
          style={{ backgroundColor: `${item.color}33`, border: `1px solid ${item.color}55` }}
        >
          <Icon size={16} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5" style={{ color: item.color }}>
          {item.tagline}
        </p>
        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl"
          style={{ backgroundColor: item.accent }}
        >
          {item.stats.map(stat => {
            const S = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <S size={12} className="mx-auto mb-1" style={{ color: item.color }} />
                <p className="text-xs font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:gap-3"
          style={{ backgroundColor: item.color }}
        >
          {item.button}
          <ArrowUpRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </a>
      </div>
    </motion.div>
  )
}

export default function ResourcesSection() {
  const headerRef    = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" })

  return (
    <section id="resources" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-[0.3em] mb-5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            ✦ Resource Pack
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-1 mb-4">
            Tools To <span className="text-primary">Accelerate</span> Your Prep
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Three curated platforms for extra IELTS material, timed mock tests,
            and daily skill-building practice — all free.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {resources.map((item, i) => (
            <ResourceCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/60 mt-10"
        >
          All resources are free to use and recommended as part of the study plans above.
        </motion.p>

      </div>
    </section>
  )
}
