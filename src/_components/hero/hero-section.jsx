import { motion } from "motion/react"
import { Headphones, BookOpen, PenTool, MessageCircle } from "lucide-react"

const skills = [
  { Icon: Headphones,    label: "Listening" },
  { Icon: BookOpen,      label: "Reading"   },
  { Icon: PenTool,       label: "Writing"   },
  { Icon: MessageCircle, label: "Speaking"  },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1000px] h-[500px] sm:h-[600px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 sm:mb-10"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide">
            25-Day · 2-Month · 3-Month Plans
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95] sm:leading-[0.9]"
        >
          <span className="text-foreground">GET READY</span>
          <br />
          <span className="text-foreground">FOR </span>
          <span className="text-primary ielts-highlight">IELTS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 sm:mt-8 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2"
        >
          Three structured plans targeting{" "}
          <span className="text-foreground font-semibold">Band 6.5 to 7.5+</span>.
          Pick the timeline that fits your schedule — all four skills, real mock tests,
          writing and speaking templates included.
        </motion.p>

        {/* 4 skill badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {skills.map((skill, i) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <skill.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">{skill.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 sm:mt-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Fade to next section */}
      <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 lg:h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />

    </section>
  )
}
