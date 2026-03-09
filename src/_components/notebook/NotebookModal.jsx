import { useState, useEffect } from "react"
import { X, Plus, Trash2, BookOpen, AlertCircle } from "lucide-react"

export default function NotebookModal({ open, onClose }) {

const STORAGE_KEY = "ielts-notebook"

const [data, setData] = useState({
vocabulary: [],
mistakes: [],
notes: ""
})

useEffect(() => {
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) setData(JSON.parse(saved))
}, [])

useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}, [data])

function addVocabulary() {
setData({
...data,
vocabulary: [...data.vocabulary, { word: "", meaning: "", example: "" }]
})
}

function updateVocabulary(i, field, value) {
const updated = [...data.vocabulary]
updated[i][field] = value
setData({ ...data, vocabulary: updated })
}

function removeVocabulary(i) {
const updated = data.vocabulary.filter((_, index) => index !== i)
setData({ ...data, vocabulary: updated })
}

function addMistake() {
setData({
...data,
mistakes: [...data.mistakes, { source: "", mistake: "", reason: "" }]
})
}

function updateMistake(i, field, value) {
const updated = [...data.mistakes]
updated[i][field] = value
setData({ ...data, mistakes: updated })
}

function removeMistake(i) {
const updated = data.mistakes.filter((_, index) => index !== i)
setData({ ...data, mistakes: updated })
}

if (!open) return null

return (


<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto">

  <div className="bg-card border border-border w-full max-w-4xl mt-20 rounded-xl p-8">

    {/* Header */}

    <div className="flex items-center justify-between mb-8">

      <h2 className="text-2xl font-bold flex items-center gap-2">
        📓 Study Notebook
      </h2>

      <button
        onClick={onClose}
        className="p-2 rounded-md hover:bg-secondary"
      >
        <X className="w-5 h-5"/>
      </button>

    </div>


    {/* Vocabulary */}

    <div className="mb-10">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-medium">
          <BookOpen className="w-4 h-4"/>
          Vocabulary
        </div>

        <button
          onClick={addVocabulary}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <Plus className="w-4 h-4"/> Add
        </button>
      </div>

      <div className="space-y-3">

        {data.vocabulary.map((v, i) => (

          <div key={i} className="grid grid-cols-3 gap-3 border border-border rounded-lg p-3">

            <input
              placeholder="Word"
              value={v.word}
              onChange={(e)=>updateVocabulary(i,"word",e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />

            <input
              placeholder="Meaning"
              value={v.meaning}
              onChange={(e)=>updateVocabulary(i,"meaning",e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />

            <div className="flex gap-2">

              <input
                placeholder="Example"
                value={v.example}
                onChange={(e)=>updateVocabulary(i,"example",e.target.value)}
                className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
              />

              <button
                onClick={()=>removeVocabulary(i)}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4"/>
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>


    {/* Mistakes */}

    <div className="mb-10">

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4"/>
          Mistakes
        </div>

        <button
          onClick={addMistake}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <Plus className="w-4 h-4"/> Add
        </button>

      </div>

      <div className="space-y-3">

        {data.mistakes.map((m, i) => (

          <div key={i} className="grid grid-cols-3 gap-3 border border-border rounded-lg p-3">

            <input
              placeholder="Source"
              value={m.source}
              onChange={(e)=>updateMistake(i,"source",e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />

            <input
              placeholder="Mistake"
              value={m.mistake}
              onChange={(e)=>updateMistake(i,"mistake",e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />

            <div className="flex gap-2">

              <input
                placeholder="Reason"
                value={m.reason}
                onChange={(e)=>updateMistake(i,"reason",e.target.value)}
                className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
              />

              <button
                onClick={()=>removeMistake(i)}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4"/>
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>


    {/* Notes */}

    <div>

      <div className="font-medium mb-2">
        Notes
      </div>

      <textarea
        value={data.notes}
        onChange={(e)=>setData({...data,notes:e.target.value})}
        placeholder="Write anything you learned today..."
        className="w-full bg-background border border-border rounded-lg p-3 text-sm"
        rows={5}
      />

    </div>

  </div>

</div>


)
}
