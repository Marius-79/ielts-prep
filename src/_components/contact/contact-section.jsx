import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Mail, User, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" ref={ref} className="py-32 px-6 relative section-glow">
      <div className="absolute inset-0 bg-linear-to-t from-primary/[0.03] to-transparent" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4 block">
            Contact
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Best <span className="text-primary">Regards</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 p-8 sm:p-12 rounded-2xl border border-border bg-card relative overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                Supervisor
              </h3>
              <p className="text-xl text-primary font-semibold mb-4">
                BELAIDI ABDELLAH
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    abdellahbelaidi42@gmail.com
                  </span>
                </div>

               <Button
  size="sm"
  className="group gap-2 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
  onClick={() =>
    window.open(
      "mailto:abdellahbelaidi42@gmail.com",
      "_blank"
    )
  }
>
  Get in Touch
  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
