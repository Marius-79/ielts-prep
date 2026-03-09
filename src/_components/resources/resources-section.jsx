import { motion } from "motion/react"
import { Send, Globe } from "lucide-react"

const resources = [
{
title: "Telegram Resource Pack",
description:
"Access vocabulary lists, IELTS practice material, writing samples, and additional exercises shared regularly.",
icon: Send,
link: "https://t.me/+N0LeTyNV-rYxYzRk",
button: "Join Channel"
},
{
title: "JumpInto IELTS Tests",
description:
"Practice real IELTS-style reading and listening tests with accurate timing and scoring simulation.",
icon: Globe,
link: "https://www.jumpinto.com/ielts/practice",
button: "Open Website"
},
{
title: "Engnovate IELTS Practice",
description:
"Additional mock tests and skill-based IELTS exercises to strengthen reading, writing and listening.",
icon: Globe,
link: "https://engnovate.com",
button: "Start Practicing"
}
]

export default function ResourcesSection() {

return ( <section id="resources" className="py-32 px-6">


  <div className="max-w-6xl mx-auto">

    <div className="text-center mb-20">

      <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-4">
        Resource Pack
      </span>

      <h2 className="text-4xl sm:text-5xl font-bold">
        Tools To <span className="text-primary">Accelerate</span> Your Preparation
      </h2>

      <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
        Use these curated resources to access additional IELTS material,
        realistic mock tests, and daily practice tools.
      </p>

    </div>

    <div className="grid md:grid-cols-3 gap-6">

      {resources.map((item, i) => {

        const Icon = item.icon

        return (

          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition"
          >

            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary"/>
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {item.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              {item.description}
            </p>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90 transition"
            >
              {item.button}
            </a>

          </motion.div>

        )

      })}

    </div>

  </div>

</section>


)

}
