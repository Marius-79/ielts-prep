import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Mail, ArrowUpRight, Quote } from "lucide-react";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" ref={ref} className="py-32 px-6 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-3xl mx-auto relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 block">
            About the Creator
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Built from <span className="text-primary">Experience</span>
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative rounded-3xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: "0 4px 40px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)" }} />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

          <div className="p-8 sm:p-12 relative">

            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">

              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 260 }}
                className="relative shrink-0"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white select-none"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
                  M
                </div>
                <div className="absolute -bottom-1.5 -right-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>C1</span>
                </div>
              </motion.div>

              {/* Name + bio */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Creator</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Marius</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  For everyone asking <span className="font-semibold text-foreground">"where do I start?"</span> and <span className="font-semibold text-foreground">"what strategy should I follow?"</span> — this was built for you. I went through the IELTS preparation process myself, achieved a <span className="font-semibold text-foreground">C1 level</span>, and built this platform from everything that actually worked. No filler — just the strategies, tools, and daily structure that I'd follow again from day one.
                </p>
              </div>
            </div>

            {/* Motivational quote */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative rounded-2xl px-6 py-5 mb-8"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(167,139,250,0.08))", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <Quote size={18} className="text-primary/40 mb-2" />
              <p className="text-base font-medium text-foreground leading-relaxed italic">
                "We've all been there — it only takes dedication and practice."
              </p>
              <p className="text-xs text-primary font-semibold mt-2 not-italic">— Marius, C1 IELTS</p>
            </motion.div>

            {/* Contact row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/40">
                <Mail size={14} className="text-primary shrink-0" />
                <span className="text-sm text-foreground font-medium">abdellahbelaidi42@gmail.com</span>
              </div>
              <button
                onClick={() => window.open("mailto:abdellahbelaidi42@gmail.com", "_blank")}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}
              >
                Get in Touch
                <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Have questions about the plan or your preparation? Reach out anytime.
        </motion.p>

      </div>
    </section>
  );
}
