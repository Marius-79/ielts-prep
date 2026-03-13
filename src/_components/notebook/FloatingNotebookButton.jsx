import { BookOpen } from "lucide-react"
import { motion } from "motion/react"

export default function FloatingNotebookButton({ openNotebook }) {
  return (
    <motion.button
      onClick={openNotebook}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold"
    >
      <BookOpen className="w-4 h-4" />
      Notebook
    </motion.button>
  )
}
