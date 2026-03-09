import { BookOpen } from "lucide-react"

export default function FloatingNotebook({ openNotebook }) {
return ( <button
   onClick={openNotebook}
   className="fixed bottom-6 right-6 bg-primary text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg hover:scale-105 transition"
 > <BookOpen className="w-5 h-5" />
Notebook </button>
)
}
