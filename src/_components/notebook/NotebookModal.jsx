import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Plus, Trash2, BookOpen, AlertCircle, FileText, Search, CheckCircle2, Loader2 } from "lucide-react"
import { supabase } from "../_lib/supabase"

const TABS = [
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen,     color: "#7c3aed" },
  { id: "mistakes",   label: "Mistakes",   icon: AlertCircle,  color: "#ef4444" },
  { id: "notes",      label: "Notes",      icon: FileText,     color: "#0ea5e9" },
]

export default function NotebookModal({ open, onClose, user, openAuth }) {
  const [activeTab, setActiveTab] = useState("vocabulary")
  const [data, setData]           = useState({ vocabulary: [], mistakes: [], notes: "" })
  const [search, setSearch]       = useState("")
  const [saveState, setSaveState] = useState("idle") // idle | saving | saved
  const [loading, setLoading]     = useState(false)
  const saveTimer    = useRef(null)
  const initialized  = useRef(false)

  // Load from Supabase when modal opens
  useEffect(() => {
    if (open && user && !initialized.current) loadNotebook()
    if (!open) initialized.current = false
  }, [open, user])

  async function loadNotebook() {
    setLoading(true)
    const { data: row } = await supabase
      .from("notebook")
      .select("*")
      .eq("user_id", user.id)
      .single()
    if (row) setData({ vocabulary: row.vocabulary ?? [], mistakes: row.mistakes ?? [], notes: row.notes ?? "" })
    initialized.current = true
    setLoading(false)
  }

  // Auto-save 800ms after last change
  useEffect(() => {
    if (!user || !initialized.current) return
    clearTimeout(saveTimer.current)
    setSaveState("idle")
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving")
      await supabase.from("notebook").upsert({
        user_id: user.id, vocabulary: data.vocabulary, mistakes: data.mistakes, notes: data.notes, updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [data])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  function addVocab() { setData(d => ({ ...d, vocabulary: [{ word: "", meaning: "", example: "" }, ...d.vocabulary] })) }
  function updateVocab(i, f, v) { setData(d => { const a = [...d.vocabulary]; a[i] = { ...a[i], [f]: v }; return { ...d, vocabulary: a } }) }
  function removeVocab(i) { setData(d => ({ ...d, vocabulary: d.vocabulary.filter((_, idx) => idx !== i) })) }

  function addMistake() { setData(d => ({ ...d, mistakes: [{ source: "", mistake: "", reason: "" }, ...d.mistakes] })) }
  function updateMistake(i, f, v) { setData(d => { const a = [...d.mistakes]; a[i] = { ...a[i], [f]: v }; return { ...d, mistakes: a } }) }
  function removeMistake(i) { setData(d => ({ ...d, mistakes: d.mistakes.filter((_, idx) => idx !== i) })) }

  const q = search.toLowerCase()
  const filteredVocab    = data.vocabulary.filter(v => !q || v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q))
  const filteredMistakes = data.mistakes.filter(m => !q || m.mistake.toLowerCase().includes(q) || m.source.toLowerCase().includes(q))

  if (!open) return null

  if (!user) return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-background border border-border rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">📓</div>
        <h3 className="text-lg font-bold mb-2">Sign in to use Notebook</h3>
        <p className="text-sm text-muted-foreground mb-5">Your notes are saved to your account and accessible from any device.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={openAuth} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">Sign In</button>
          <button onClick={onClose} className="px-5 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary transition">Close</button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-background border border-border w-full max-w-2xl rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📓</span>
                <h2 className="text-base font-bold">Study Notebook</h2>
              </div>
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {saveState === "saving" && (
                    <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 size={11} className="animate-spin" /> Saving...
                    </motion.div>
                  )}
                  {saveState === "saved" && (
                    <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={12} /> Saved
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border flex-shrink-0 px-5">
              {TABS.map(tab => {
                const Icon  = tab.icon
                const count = tab.id !== "notes" ? data[tab.id].length : null
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch("") }}
                    className="relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition mr-1"
                    style={{ color: activeTab === tab.id ? tab.color : undefined }}>
                    <Icon size={14} />
                    {tab.label}
                    {count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ml-0.5"
                        style={{ backgroundColor: tab.color }}>{count}</span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: tab.color }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            {activeTab !== "notes" && (
              <div className="px-5 pt-3 pb-1 flex-shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={activeTab === "vocabulary" ? "Search words..." : "Search mistakes..."}
                    className="w-full text-sm bg-secondary/60 border border-border rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading your notebook...
                </div>
              ) : (
                <>
                  {activeTab === "vocabulary" && (
                    <div>
                      <button onClick={addVocab}
                        className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 text-sm font-medium hover:bg-purple-50 transition">
                        <Plus size={15} /> Add Word
                      </button>
                      {filteredVocab.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          {search ? "No words match your search." : "No vocabulary yet. Add words as you study!"}
                        </p>
                      )}
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {filteredVocab.map(v => {
                            const ri = data.vocabulary.indexOf(v)
                            return (
                              <motion.div key={ri} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="border border-border rounded-xl p-3 bg-card/50 group">
                                <div className="flex gap-2 mb-2">
                                  <input value={v.word} onChange={e => updateVocab(ri, "word", e.target.value)} placeholder="Word or phrase"
                                    className="flex-1 text-sm font-semibold bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400/30" />
                                  <input value={v.meaning} onChange={e => updateVocab(ri, "meaning", e.target.value)} placeholder="Meaning"
                                    className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400/30" />
                                  <button onClick={() => removeVocab(ri)}
                                    className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <input value={v.example} onChange={e => updateVocab(ri, "example", e.target.value)} placeholder="Example sentence (optional)"
                                  className="w-full text-xs text-muted-foreground bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none italic" />
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {activeTab === "mistakes" && (
                    <div>
                      <button onClick={addMistake}
                        className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition">
                        <Plus size={15} /> Log Mistake
                      </button>
                      {filteredMistakes.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          {search ? "No mistakes match." : "No mistakes logged. Record errors to avoid repeating them!"}
                        </p>
                      )}
                      <div className="space-y-2">
                        <AnimatePresence initial={false}>
                          {filteredMistakes.map(m => {
                            const ri = data.mistakes.indexOf(m)
                            return (
                              <motion.div key={ri} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="border border-red-100 rounded-xl p-3 bg-red-50/30 group">
                                <div className="flex gap-2 mb-2">
                                  <input value={m.source} onChange={e => updateMistake(ri, "source", e.target.value)} placeholder="Source (e.g. Mock Test 2)"
                                    className="w-36 text-xs bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300/30" />
                                  <input value={m.mistake} onChange={e => updateMistake(ri, "mistake", e.target.value)} placeholder="What was the mistake?"
                                    className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300/30" />
                                  <button onClick={() => removeMistake(ri)}
                                    className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-100 transition opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <input value={m.reason} onChange={e => updateMistake(ri, "reason", e.target.value)} placeholder="Why did this happen? How to avoid it?"
                                  className="w-full text-xs text-muted-foreground bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none" />
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div>
                      <textarea value={data.notes} onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                        placeholder={"Write anything you learned today...\n\n• Key tips\n• Things to remember\n• Goals for tomorrow"}
                        className="w-full h-80 text-sm bg-secondary/30 border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
                      <p className="text-right text-xs text-muted-foreground mt-1">{data.notes.length} characters</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-secondary/20 flex-shrink-0">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>📚 {data.vocabulary.length} words</span>
                <span>❌ {data.mistakes.length} mistakes</span>
              </div>
              <span className="text-xs text-muted-foreground">Synced to your account</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
