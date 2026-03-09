import { BookOpen } from "lucide-react"

export default function FloatingNotebookButton({ openNotebook }) {

return (


<button
  onClick={openNotebook}
  className="fixed bottom-6 right-6 z-40 bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition"
>
  <BookOpen className="w-5 h-5"/>
  Notebook
</button>

)

}
