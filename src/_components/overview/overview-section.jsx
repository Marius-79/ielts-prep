import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
Clock,
Target,
BookOpen,
BarChart3,
Mic,
GraduationCap,
} from "lucide-react";

const highlights = [
{
icon: Clock,
title: "4 Hours / Day",
description: "Structured daily sessions with morning and afternoon blocks",
},
{
icon: Target,
title: "25 Days",
description: "Intensive program from foundation building to exam simulation",
},
{
icon: BookOpen,
title: "4 Skills",
description:
"Listening, Reading, Writing, and Speaking covered systematically",
},
{
icon: BarChart3,
title: "Mistake Analysis",
description: "Track errors, correct patterns, and improve continuously",
},
{
icon: Mic,
title: "Speaking Prep",
description: "Structured practice with topics, timing, and confidence drills",
},
{
icon: GraduationCap,
title: "Mock Exams",
description: "Full timed simulations in weeks 4 and 5 for exam readiness",
},
];

export default function OverviewSection() {
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

return ( <section id="overview" ref={ref} className="py-32 px-6 relative overflow-hidden">


  {/* Static gradient background (GPU friendly) */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px]  blur-[120px] rounded-full" />
  </div>

  <div className="max-w-6xl mx-auto relative">

    {/* HEADER */}

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-20"
    >
      <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 block">
        Overview
      </span>

      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
        Your Path to{" "}
        <span className="text-primary">IELTS C1 Level</span>
      </h2>

      <p className="mt-6 text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
        This plan gradually develops all four IELTS skills through targeted
        practice, mistake analysis, timed mock tests, and structured speaking
        preparation. Designed for{" "}
        <span className="text-foreground font-medium">B1-B2 students</span>{" "}
        aiming to reach C1 proficiency.
      </p>
    </motion.div>

    {/* HIGHLIGHT GRID */}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {highlights.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          whileHover={{ y: -6 }}
          className="group relative p-6 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
        >
          {/* hover glow */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-primary/[0.04] to-transparent" />

          <div className="relative">

            {/* icon */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
            >
              <item.icon className="w-5 h-5 text-primary" />
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {item.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>

          </div>
        </motion.div>
      ))}

    </div>

    {/* BOTTOM STATS */}

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-20 grid grid-cols-1 sm:grid-cols-4 gap-4"
    >
      {[
        { label: "Structured Practice", value: "Daily" },
        { label: "Timing Discipline", value: "Timed" },
        { label: "Vocabulary Building", value: "Progressive" },
        { label: "Exam Simulation", value: "Weeks 4-5" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
          className="text-center p-6 rounded-xl border border-border bg-card"
        >
          <div className="text-2xl font-bold text-primary mb-1">
            {stat.value}
          </div>

          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>

  </div>
</section>


);
}
