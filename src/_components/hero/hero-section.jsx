import { motion } from "motion/react";
import { Headphones, BookOpen, PenTool, MessageCircle } from "lucide-react";

const skills = [
{ icon: Headphones, label: "Listening & Reading Mastery" },
{ icon: PenTool, label: "Writing Precision" },
{ icon: MessageCircle, label: "Speaking Confidence" },
];

export default function HeroSection() {
return ( <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">


  {/* Static gradient background (extremely cheap for GPU) */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
  </div>

  {/* HERO CONTENT */}

  <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

    {/* badge */}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-10"
    >
      <BookOpen className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-primary uppercase tracking-wide">
        25-Day Intensive Program
      </span>
    </motion.div>

    {/* heading */}

    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
    >
      <span className="text-foreground">GET READY</span>
      <br />
      <span className="text-foreground">FOR </span>
      <span className="text-primary ielts-highlight">IELTS</span>
    </motion.h1>

    {/* subtitle */}

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
    >
      Your path to{" "}
      <span className="text-foreground font-semibold">IELTS C1 Level</span>.
      A structured 25-day plan helping B1-B2 students master all four IELTS
      skills through focused practice and realistic exam simulation.
    </motion.p>

    {/* skill badges */}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="mt-12 flex flex-wrap justify-center gap-4"
    >
      {skills.map((skill, i) => (
        <motion.div
          key={skill.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
          whileHover={{ scale: 1.05, y: -3 }}
          className="flex items-center gap-3 px-5 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300"
        >
          <skill.icon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {skill.label}
          </span>
        </motion.div>
      ))}
    </motion.div>

    {/* scroll indicator */}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-20"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
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

  {/* smooth transition to next section */}

  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />

</section>


);
}
