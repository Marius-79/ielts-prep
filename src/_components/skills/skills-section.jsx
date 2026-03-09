import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Headphones, BookOpen, PenTool, MessageCircle } from "lucide-react";

const skills = [
{
icon: Headphones,
title: "Listening",
description:
"Train with real IELTS listening tasks, note-taking drills, and timing discipline.",
},
{
icon: BookOpen,
title: "Reading",
description:
"Develop scanning, skimming, and question strategies to increase reading speed and accuracy.",
},
{
icon: PenTool,
title: "Writing",
description:
"Structured practice for Task 1 and Task 2 with vocabulary improvement and mistake correction.",
},
{
icon: MessageCircle,
title: "Speaking",
description:
"Practice speaking topics with timed responses to build fluency and confidence.",
},
];

export default function SkillsSection() {
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

return ( <section id="skills" ref={ref} className="py-32 px-6 relative overflow-hidden">


  {/* static gradient background (very cheap) */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px]  blur-[120px] rounded-full" />
  </div>

  <div className="max-w-6xl mx-auto relative">

    {/* header */}

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-20"
    >
      <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-4">
        Skills
      </span>

      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
        Master the <span className="text-primary">Four IELTS Skills</span>
      </h2>

      <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
        The program systematically trains all four IELTS skills through
        structured practice, targeted exercises, and exam-style simulations.
      </p>
    </motion.div>

    {/* skill cards */}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {skills.map((skill, i) => (
        <motion.div
          key={skill.title}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          whileHover={{ y: -6 }}
          className="group relative p-6 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
        >

          {/* hover glow */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-primary/[0.05] to-transparent" />

          <div className="relative">

            {/* floating icon */}

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
            >
              <skill.icon className="w-6 h-6 text-primary" />
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {skill.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {skill.description}
            </p>

          </div>
        </motion.div>
      ))}

    </div>

  </div>
</section>


);
}
