import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X, Plus, Trash2, BookOpen, AlertCircle, FileText,
  Search, CheckCircle2, Loader2, Palette, Bold, Italic,
  Underline, Highlighter, PenLine, Circle, Square,
  Minus, ChevronDown, GripVertical, Undo2, Redo2, Eraser,
  Headphones, BookMarked, PenSquare, Mic, StickyNote, List
} from "lucide-react"
import { supabase } from "../_lib/supabase"

const TABS = [
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen,    color: "#7c3aed" },
  { id: "mistakes",   label: "Mistakes",   icon: AlertCircle, color: "#ef4444" },
  { id: "notes",      label: "Notes",      icon: FileText,    color: "#0ea5e9" },
]

const NOTE_SECTIONS = [
  { id: "general",   label: "General",   icon: StickyNote,  color: "#0ea5e9", accent: "#e0f2fe" },
  { id: "listening", label: "Listening", icon: Headphones,  color: "#7c3aed", accent: "#ede9fe" },
  { id: "reading",   label: "Reading",   icon: BookMarked,  color: "#16a34a", accent: "#d1fae5" },
  { id: "writing",   label: "Writing",   icon: PenSquare,   color: "#f97316", accent: "#fff7ed" },
  { id: "speaking",  label: "Speaking",  icon: Mic,         color: "#ef4444", accent: "#ffe4e6" },
]

const EMPTY_NOTES = { general: [], listening: [], reading: [], writing: [], speaking: [] }

const VOCAB_SECTIONS = [
  { id: "general",   label: "General",   icon: StickyNote,  color: "#7c3aed", accent: "#ede9fe" },
  { id: "listening", label: "Listening", icon: Headphones,  color: "#0ea5e9", accent: "#e0f2fe" },
  { id: "reading",   label: "Reading",   icon: BookMarked,  color: "#16a34a", accent: "#d1fae5" },
  { id: "writing",   label: "Writing",   icon: PenSquare,   color: "#f97316", accent: "#fff7ed" },
  { id: "speaking",  label: "Speaking",  icon: Mic,         color: "#8b5cf6", accent: "#ede9fe" },
]
const EMPTY_VOCAB = { general: [], listening: [], reading: [], writing: [], speaking: [] }

const MISTAKE_SECTIONS = [
  { id: "general",   label: "General",   icon: StickyNote,  color: "#64748b", accent: "#f1f5f9" },
  { id: "listening", label: "Listening", icon: Headphones,  color: "#7c3aed", accent: "#ede9fe" },
  { id: "reading",   label: "Reading",   icon: BookMarked,  color: "#0ea5e9", accent: "#e0f2fe" },
  { id: "writing",   label: "Writing",   icon: PenSquare,   color: "#f97316", accent: "#fff7ed" },
  { id: "speaking",  label: "Speaking",  icon: Mic,         color: "#16a34a", accent: "#d1fae5" },
]
const EMPTY_MISTAKES = { general: [], listening: [], reading: [], writing: [], speaking: [] }

const CARD_COLORS = [
  { label: "White",      bg: "#ffffff", border: "#e2e8f0", text: "#1e293b" },
  { label: "Sky",        bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e" },
  { label: "Violet",     bg: "#ede9fe", border: "#c4b5fd", text: "#3b0764" },
  { label: "Emerald",    bg: "#d1fae5", border: "#6ee7b7", text: "#064e3b" },
  { label: "Amber",      bg: "#fef3c7", border: "#fcd34d", text: "#78350f" },
  { label: "Rose",       bg: "#ffe4e6", border: "#fda4af", text: "#881337" },
  { label: "Slate",      bg: "#f1f5f9", border: "#cbd5e1", text: "#1e293b" },
  { label: "Peach",      bg: "#fff7ed", border: "#fdba74", text: "#7c2d12" },
]


const FONT_SIZES = [
  { label: "XS",  px: "11px", size: 1 },
  { label: "S",   px: "13px", size: 2 },
  { label: "M",   px: "15px", size: 3 },
  { label: "L",   px: "18px", size: 4 },
  { label: "XL",  px: "24px", size: 5 },
  { label: "2XL", px: "32px", size: 6 },
]

const TEXT_FG_COLORS = [
  "#1e293b","#64748b","#ef4444","#f97316","#ca8a04",
  "#16a34a","#2563eb","#7c3aed","#ec4899","#ffffff",
]

const HIGHLIGHT_COLORS = [
  { v: "#fef08a", name: "Yellow"  },
  { v: "#bbf7d0", name: "Green"   },
  { v: "#bfdbfe", name: "Blue"    },
  { v: "#fecaca", name: "Red"     },
  { v: "#e9d5ff", name: "Purple"  },
  { v: "#fed7aa", name: "Orange"  },
  { v: "transparent", name: "None" },
]

// Save / restore browser selection so toolbar clicks don't lose the cursor
function saveSelection() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  return sel.getRangeAt(0).cloneRange()
}
function restoreSelection(range) {
  if (!range) return
  const sel = window.getSelection()
  if (!sel) return
  sel.removeAllRanges()
  sel.addRange(range)
}

// ── RichToolbar ───────────────────────────────────────────────────────────────
function RichToolbar({ editorRef, tool, setTool, color, setColor, thickness, setThickness, onUndo, onRedo, canUndo, canRedo, onMarkerInserted, activeMarker, onClearMarker }) {
  const [savedRange,   setSavedRange]   = useState(null)
  const [active,       setActive]       = useState({ bold: false, italic: false, underline: false, ul: false, ol: false })
  const [showSize,     setShowSize]     = useState(false)
  const [showFgColor,  setShowFgColor]  = useState(false)
  const [showHL,       setShowHL]       = useState(false)
  const [showList,     setShowList]     = useState(false)
  const [showDrColor,  setShowDrColor]  = useState(false)
  const [showThick,    setShowThick]    = useState(false)
  const [curSize,      setCurSize]      = useState(FONT_SIZES[2])
  const [curFg,        setCurFg]        = useState("#1e293b")
  const [curHL,        setCurHL]        = useState("#fef08a")

  const sizeRef    = useRef(null)
  const fgRef      = useRef(null)
  const hlRef      = useRef(null)
  const listRef    = useRef(null)
  const drColorRef = useRef(null)
  const thickRef   = useRef(null)

  // Close all dropdowns on outside click
  useEffect(() => {
    const pairs = [[sizeRef,setShowSize],[fgRef,setShowFgColor],[hlRef,setShowHL],[listRef,setShowList],[drColorRef,setShowDrColor],[thickRef,setShowThick]]
    function h(e) { pairs.forEach(([r,s]) => { if (r.current && !r.current.contains(e.target)) s(false) }) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // Poll bold/italic/underline/list state on selection change
  useEffect(() => {
    function poll() {
      const el = editorRef.current
      if (!el) return
      // Only poll when editor or a descendant is focused
      if (!el.contains(document.activeElement) && document.activeElement !== el) return
      setActive({
        bold:      document.queryCommandState("bold"),
        italic:    document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        ul:        document.queryCommandState("insertUnorderedList"),
        ol:        document.queryCommandState("insertOrderedList"),
      })
    }
    document.addEventListener("selectionchange", poll)
    document.addEventListener("keyup", poll)
    document.addEventListener("mouseup", poll)
    return () => {
      document.removeEventListener("selectionchange", poll)
      document.removeEventListener("keyup", poll)
      document.removeEventListener("mouseup", poll)
    }
  }, [editorRef])

  // Capture selection before editor blur (toolbar click causes blur)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    function onBlur() { const r = saveSelection(); if (r) setSavedRange(r) }
    el.addEventListener("blur", onBlur, true)
    return () => el.removeEventListener("blur", onBlur, true)
  }, [editorRef])

  function focusAndRestore() {
    const el = editorRef.current
    if (!el) return
    if (!el.contains(document.activeElement) && document.activeElement !== el) {
      el.focus()
      if (savedRange) restoreSelection(savedRange)
    }
  }

  function run(command, value = null) {
    focusAndRestore()
    document.execCommand(command, false, value)
    // Refresh active states immediately
    setActive({
      bold:      document.queryCommandState("bold"),
      italic:    document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul:        document.queryCommandState("insertUnorderedList"),
      ol:        document.queryCommandState("insertOrderedList"),
    })
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
  }

  function applyFontSize(fs) {
    setCurSize(fs)
    focusAndRestore()
    // execCommand fontSize uses legacy 1-7 sizes — remap immediately to px
    document.execCommand("fontSize", false, fs.size)
    setTimeout(() => {
      const el = editorRef.current
      if (!el) return
      el.querySelectorAll(`font[size="${fs.size}"]`).forEach(node => {
        node.style.fontSize = fs.px
        node.removeAttribute("size")
      })
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }, 0)
  }

  function applyFgColor(c) {
    setCurFg(c)
    run("foreColor", c)
  }

  function applyHL(c) {
    setCurHL(c)
    focusAndRestore()
    if (c === "transparent") {
      document.execCommand("hiliteColor", false, "transparent")
      document.execCommand("backColor",   false, "transparent")
    } else {
      document.execCommand("hiliteColor", false, c)
    }
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
  }

  function insertMarker(marker) {
    focusAndRestore()
    const el = editorRef.current
    if (!el) return
    const isEmpty = el.textContent.trim() === ""
    document.execCommand("insertText", false, (isEmpty ? "" : "\n") + marker + "\u00A0")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    onMarkerInserted?.(marker)
  }

  const drawingTools = ["pen", "eraser", "circle", "rect", "line"]
  const isDrawing    = drawingTools.includes(tool)

  const B  = "p-1.5 rounded transition text-[13px] leading-none"
  const on = "bg-primary/15 text-primary"
  const off = "text-foreground/60 hover:text-foreground hover:bg-secondary"

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-secondary/20 select-none"
      onMouseDown={e => e.preventDefault()} // prevent editor blur
    >
      {/* Bold / Italic / Underline */}
      <button onMouseDown={e => { e.preventDefault(); run("bold")      }} title="Bold (Ctrl+B)"      className={`${B} font-bold   ${active.bold      ? on : off}`}><Bold      size={13}/></button>
      <button onMouseDown={e => { e.preventDefault(); run("italic")    }} title="Italic (Ctrl+I)"    className={`${B} italic      ${active.italic    ? on : off}`}><Italic    size={13}/></button>
      <button onMouseDown={e => { e.preventDefault(); run("underline") }} title="Underline (Ctrl+U)" className={`${B}             ${active.underline ? on : off}`}><Underline size={13}/></button>

      <div className="w-px h-4 bg-border/50 mx-0.5"/>

      {/* Font size */}
      <div ref={sizeRef} className="relative">
        <button onMouseDown={e=>{ e.preventDefault(); setShowSize(p=>!p); setShowFgColor(false); setShowHL(false); setShowList(false); setShowDrColor(false); setShowThick(false) }}
          className={`${B} ${off} flex items-center gap-0.5 px-1.5`} title="Font size">
          <span className="text-[11px] font-semibold w-5 text-center">{curSize.label}</span>
          <ChevronDown size={9}/>
        </button>
        {showSize && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl overflow-hidden" style={{minWidth:92}}>
            {FONT_SIZES.map(fs => (
              <button key={fs.size} onMouseDown={e=>{ e.preventDefault(); applyFontSize(fs); setShowSize(false) }}
                className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-secondary/50 transition ${curSize.size===fs.size ? "text-primary font-semibold bg-primary/5" : "text-foreground/70"}`}>
                <span style={{fontSize:fs.px}}>{fs.label}</span>
                <span className="text-[10px] text-muted-foreground ml-4">{fs.px}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text color */}
      <div ref={fgRef} className="relative">
        <button onMouseDown={e=>{ e.preventDefault(); setShowFgColor(p=>!p); setShowSize(false); setShowHL(false); setShowList(false); setShowDrColor(false); setShowThick(false) }}
          className={`${B} ${off} flex items-center gap-0.5 px-1.5`} title="Text color">
          <span className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] font-bold leading-none">A</span>
            <span className="w-3.5 h-[3px] rounded-full" style={{backgroundColor:curFg}}/>
          </span>
          <ChevronDown size={9}/>
        </button>
        {showFgColor && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl p-2.5" style={{width:144}}>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Text Color</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_FG_COLORS.map(c=>(
                <button key={c} onMouseDown={e=>{ e.preventDefault(); applyFgColor(c); setShowFgColor(false) }}
                  className={`w-7 h-7 rounded-lg border-2 transition hover:scale-110 ${curFg===c?"border-primary shadow":"border-transparent"}`}
                  style={{backgroundColor:c, boxShadow:c==="#ffffff"?"inset 0 0 0 1px #e2e8f0":undefined}}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div ref={hlRef} className="relative">
        <button onMouseDown={e=>{ e.preventDefault(); setShowHL(p=>!p); setShowSize(false); setShowFgColor(false); setShowList(false); setShowDrColor(false); setShowThick(false) }}
          className={`${B} ${off} flex items-center gap-0.5 px-1.5`} title="Highlight">
          <Highlighter size={13}/>
          <span className="w-3 h-[3px] rounded-full" style={{backgroundColor:curHL==="transparent"?"#e2e8f0":curHL}}/>
          <ChevronDown size={9}/>
        </button>
        {showHL && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl p-2.5" style={{width:148}}>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Highlight</p>
            <div className="flex flex-wrap gap-1.5">
              {HIGHLIGHT_COLORS.map(({v,name})=>(
                <button key={v} onMouseDown={e=>{ e.preventDefault(); applyHL(v); setShowHL(false) }}
                  title={name}
                  className={`w-7 h-7 rounded-lg border-2 transition hover:scale-110 flex items-center justify-center ${curHL===v?"border-primary shadow":"border-transparent"}`}
                  style={{backgroundColor:v==="transparent"?"#f1f5f9":v, boxShadow:v==="#ffffff"?"inset 0 0 0 1px #e2e8f0":undefined}}>
                  {v==="transparent" && <X size={9} className="text-muted-foreground"/>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-border/50 mx-0.5"/>

      {/* Alignment */}
      <button onMouseDown={e=>{ e.preventDefault(); run("justifyLeft")   }} title="Left"   className={`${B} ${off}`}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg></button>
      <button onMouseDown={e=>{ e.preventDefault(); run("justifyCenter") }} title="Center" className={`${B} ${off}`}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></button>
      <button onMouseDown={e=>{ e.preventDefault(); run("justifyRight")  }} title="Right"  className={`${B} ${off}`}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg></button>

      <div className="w-px h-4 bg-border/50 mx-0.5"/>

      {/* Bullet list */}
      <button onMouseDown={e=>{ e.preventDefault(); run("insertUnorderedList") }} title="Bullet list"
        className={`${B} ${active.ul ? on : off}`}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
          <circle cx="4" cy="6"  r="2" fill="currentColor"/>
          <circle cx="4" cy="12" r="2" fill="currentColor"/>
          <circle cx="4" cy="18" r="2" fill="currentColor"/>
          <line x1="9" y1="6"  x2="21" y2="6"  stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {/* Numbered list */}
      <button onMouseDown={e=>{ e.preventDefault(); run("insertOrderedList") }} title="Numbered list"
        className={`${B} ${active.ol ? on : off}`}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
          <text x="1" y="8"  fontSize="8" fill="currentColor" fontWeight="700">1.</text>
          <text x="1" y="14" fontSize="8" fill="currentColor" fontWeight="700">2.</text>
          <text x="1" y="20" fontSize="8" fill="currentColor" fontWeight="700">3.</text>
          <line x1="11" y1="6"  x2="21" y2="6"  stroke="currentColor" strokeWidth="2"/>
          <line x1="11" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="11" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {/* Extra markers dropdown */}
      <div ref={listRef} className="relative">
        <button onMouseDown={e=>{ e.preventDefault(); setShowList(p=>!p); setShowSize(false); setShowFgColor(false); setShowHL(false); setShowDrColor(false); setShowThick(false) }}
          className={`${B} ${activeMarker ? on : off} flex items-center gap-0.5 px-1`} title="List markers">
          <List size={12}/>
          {activeMarker && <span className="text-[10px] font-bold leading-none ml-0.5">{activeMarker}</span>}
          <ChevronDown size={9}/>
        </button>
        {showList && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl overflow-hidden" style={{minWidth:148}}>
            <p className="text-[10px] text-muted-foreground px-3 pt-2.5 pb-1 font-medium uppercase tracking-wide">Insert Marker</p>
            {[{m:"•",l:"Bullet"},{m:"1.",l:"Numbered"},{m:"★",l:"Star"},{m:"➤",l:"Arrow"},{m:"✓",l:"Check"},{m:"—",l:"Dash"},{m:"◆",l:"Diamond"}].map(({m,l})=>(
              <button key={m} onMouseDown={e=>{ e.preventDefault(); insertMarker(m); setShowList(false) }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 hover:bg-secondary/50 transition text-sm ${activeMarker===m ? "text-primary font-semibold bg-primary/5" : "text-foreground/70 hover:text-foreground"}`}>
                <span className="text-base w-5 text-center leading-none">{m}</span>
                <span className="flex-1 text-left">{l}</span>
                {activeMarker===m && <span className="text-[9px] text-primary font-bold">ACTIVE</span>}
              </button>
            ))}
            {activeMarker && (
              <button onMouseDown={e=>{ e.preventDefault(); onClearMarker?.(); setShowList(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 transition text-xs text-red-400 border-t border-border/40">
                <span className="w-5 text-center">✕</span> Stop list
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-border/50 mx-0.5"/>

      {/* Undo / Redo (canvas drawing) */}
      <button onMouseDown={e=>{ e.preventDefault(); onUndo?.() }} disabled={!canUndo} title="Undo drawing"
        className={`${B} ${canUndo ? off : "text-muted-foreground/25 cursor-not-allowed"}`}><Undo2 size={13}/></button>
      <button onMouseDown={e=>{ e.preventDefault(); onRedo?.() }} disabled={!canRedo} title="Redo drawing"
        className={`${B} ${canRedo ? off : "text-muted-foreground/25 cursor-not-allowed"}`}><Redo2 size={13}/></button>

      <div className="w-px h-4 bg-border/50 mx-0.5"/>

      {/* Drawing tools */}
      {[{id:"pen",icon:PenLine,title:"Pen"},{id:"eraser",icon:Eraser,title:"Eraser"},{id:"circle",icon:Circle,title:"Circle"},{id:"rect",icon:Square,title:"Rect"},{id:"line",icon:Minus,title:"Line"}].map(t=>(
        <button key={t.id} onMouseDown={e=>{ e.preventDefault(); setTool(tool===t.id?null:t.id) }}
          title={t.title} className={`${B} ${tool===t.id ? on : off}`}><t.icon size={13}/></button>
      ))}

      {/* Drawing color + thickness (only when a draw tool is active) */}
      {isDrawing && <>
        <div ref={drColorRef} className="relative">
          <button onMouseDown={e=>{ e.preventDefault(); setShowDrColor(p=>!p); setShowThick(false) }}
            className={`${B} ${off} flex items-center gap-0.5 px-1.5`} title="Stroke color">
            <Palette size={12}/>
            <span className="w-3 h-3 rounded-full border border-border/60" style={{backgroundColor:color}}/>
            <ChevronDown size={9}/>
          </button>
          {showDrColor && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl p-2.5" style={{width:130}}>
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Stroke</p>
              <div className="grid grid-cols-5 gap-1.5">
                {["#1e293b","#ef4444","#f97316","#eab308","#22c55e","#0ea5e9","#7c3aed","#ec4899","#ffffff","#94a3b8"].map(c=>(
                  <button key={c} onMouseDown={e=>{ e.preventDefault(); setColor(c); setShowDrColor(false) }}
                    className={`w-6 h-6 rounded-lg border-2 transition hover:scale-110 ${color===c?"border-primary":"border-transparent"}`}
                    style={{backgroundColor:c, boxShadow:c==="#ffffff"?"inset 0 0 0 1px #e2e8f0":undefined}}/>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={thickRef} className="relative">
          <button onMouseDown={e=>{ e.preventDefault(); setShowThick(p=>!p); setShowDrColor(false) }}
            className={`${B} ${off} flex items-center gap-1 px-1.5`} title="Stroke width">
            <span className="rounded-full bg-current inline-block" style={{width:Math.min(thickness*2+2,10), height:Math.min(thickness*2+2,10)}}/>
            <ChevronDown size={9}/>
          </button>
          {showThick && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-border rounded-xl shadow-xl p-3 flex items-center gap-2.5">
              {[1,2,3,5,8].map(t=>(
                <button key={t} onMouseDown={e=>{ e.preventDefault(); setThickness(t); setShowThick(false) }}
                  className={`rounded-full bg-foreground/60 flex-shrink-0 transition ${thickness===t?"ring-2 ring-primary ring-offset-1":"hover:ring-1 hover:ring-border"}`}
                  style={{width:t*2+4, height:t*2+4}}/>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/50 hidden sm:inline ml-0.5">draw below ↓</span>
      </>}
    </div>
  )
}

// ── Canvas overlay for drawing on top of a note card ─────────────────────────
const MAX_HISTORY = 40

function DrawingCanvas({ tool, color, thickness, canvasData, onSave, onHistoryChange, registerUndo, registerRedo }) {
  const canvasRef   = useRef(null)
  const drawing     = useRef(false)
  const startPos    = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)   // per-stroke pre-draw snapshot (for shape preview)
  const historyRef  = useRef([])     // undo stack  — array of dataURL strings
  const redoRef     = useRef([])     // redo stack

  function notifyHistory() {
    onHistoryChange?.({
      canUndo: historyRef.current.length > 0,
      canRedo: redoRef.current.length > 0,
    })
  }

  // Push current canvas state onto undo stack before a new stroke
  function pushHistory() {
    const url = canvasRef.current.toDataURL()
    historyRef.current.push(url)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    redoRef.current = []   // new stroke clears redo
    notifyHistory()
  }

  // Restore a dataURL onto the canvas
  function restoreDataUrl(url) {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!url) { onSave(canvas.toDataURL()); notifyHistory(); return }
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      onSave(canvas.toDataURL())
      notifyHistory()
    }
    img.src = url
  }

  // Register undo/redo handlers with the parent NoteCard
  useEffect(() => {
    registerUndo?.(() => {
      if (historyRef.current.length === 0) return
      const current = canvasRef.current.toDataURL()
      redoRef.current.push(current)
      const prev = historyRef.current.pop()
      restoreDataUrl(prev)
    })
    registerRedo?.(() => {
      if (redoRef.current.length === 0) return
      const current = canvasRef.current.toDataURL()
      historyRef.current.push(current)
      const next = redoRef.current.pop()
      restoreDataUrl(next)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Restore saved drawing on mount (only once)
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current || !canvasData || !canvasRef.current) return
    restoredRef.current = true
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext("2d")
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = canvasData
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getPos(e, canvas) {
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  function onDown(e) {
    if (!tool) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    const pos    = getPos(e, canvas)
    drawing.current  = true
    startPos.current = pos

    // Save state BEFORE this stroke for undo
    pushHistory()
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  function onMove(e) {
    if (!drawing.current || !tool) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    const pos    = getPos(e, canvas)

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = thickness * 6   // eraser is wider
      ctx.lineCap   = "round"
      ctx.lineJoin  = "round"
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
    } else if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = color
      ctx.lineWidth   = thickness
      ctx.lineCap     = "round"
      ctx.lineJoin    = "round"
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else {
      // Shape tools — restore snapshot for live preview
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = color
      ctx.lineWidth   = thickness
      ctx.lineCap     = "round"
      ctx.lineJoin    = "round"
      const sx = startPos.current.x
      const sy = startPos.current.y
      ctx.beginPath()
      if (tool === "circle") {
        const rx = (pos.x - sx) / 2
        const ry = (pos.y - sy) / 2
        ctx.ellipse(sx + rx, sy + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
      } else if (tool === "rect") {
        ctx.rect(sx, sy, pos.x - sx, pos.y - sy)
      } else if (tool === "line") {
        ctx.moveTo(sx, sy)
        ctx.lineTo(pos.x, pos.y)
      }
      ctx.stroke()
    }
  }

  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    onSave(canvasRef.current.toDataURL())
  }

  const cursor = tool === "eraser" ? "cell" : tool ? "crosshair" : "default"

  return (
    <canvas
      ref={canvasRef}
      width={600} height={200}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      className="w-full rounded-b-xl"
      style={{
        cursor,
        display: "block",
        touchAction: tool ? "none" : "auto",
        background: "transparent",
        borderTop: "1px dashed rgba(0,0,0,0.08)",
      }}
    />
  )
}

// ── Single Note Card ──────────────────────────────────────────────────────────
function NoteCard({ note, index, onUpdate, onRemove, activeTool, toolColor, toolThickness }) {
  const editorRef        = useRef(null)
  const undoRef          = useRef(null)
  const redoRef          = useRef(null)
  const [tool,           setTool]           = useState(null)
  const [color,          setColor]          = useState(toolColor  || "#1e293b")
  const [thickness,      setThickness]      = useState(toolThickness || 2)
  const [showCardColors, setShowCardColors] = useState(false)
  const [canUndo,        setCanUndo]        = useState(false)
  const [canRedo,        setCanRedo]        = useState(false)
  const [activeMarker,   setActiveMarker]   = useState(null) // "•" | "★" | "1." | etc.
  const markerCounterRef = useRef(1) // for auto-incrementing numbered lists
  const colorBtnRef = useRef(null)

  const drawingTools = ["pen", "eraser", "circle", "rect", "line"]
  const isDrawing    = drawingTools.includes(tool)

  useEffect(() => { if (activeTool) setTool(activeTool) }, [activeTool])
  useEffect(() => { if (toolColor) setColor(toolColor) }, [toolColor])

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (note.html || "")) {
      editorRef.current.innerHTML = note.html || ""
    }
  }, []) // only on mount

  useEffect(() => {
    function h(e) { if (colorBtnRef.current && !colorBtnRef.current.contains(e.target)) setShowCardColors(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  function cmd(command, value) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const cardColor = CARD_COLORS.find(c => c.bg === note.cardColor) || CARD_COLORS[0]

  return (
    <div
      className="rounded-xl shadow-sm border group"
      style={{ borderColor: cardColor.border, backgroundColor: cardColor.bg }}
    >
      {/* Card top bar — grip handle is the drag handle, stops propagation on inputs */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: `1px solid ${cardColor.border}` }}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Grip — dragging initiates from here visually, but the whole wrapper is draggable */}
          <GripVertical size={13} className="text-muted-foreground/40 flex-shrink-0" style={{ cursor: "grab" }} />
          <input
            value={note.title || ""}
            onChange={e => onUpdate(index, "title", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Note title (e.g. Task 1 technique)"
            className="flex-1 min-w-0 text-xs font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 truncate"
            style={{ color: cardColor.text }}
          />
        </div>
        <div className="flex items-center gap-1">
          <div ref={colorBtnRef} className="relative">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setShowCardColors(p => !p)}
              title="Card color"
              className="p-1 rounded hover:bg-black/5 transition">
              <Palette size={12} style={{ color: cardColor.text + "80" }} />
            </button>
            {showCardColors && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-xl shadow-xl p-2 flex flex-wrap gap-1.5" style={{ width: 140 }}>
                {CARD_COLORS.map(c => (
                  <button key={c.bg} onClick={() => { onUpdate(index, "cardColor", c.bg); setShowCardColors(false) }}
                    title={c.label}
                    className={`w-7 h-7 rounded-lg border-2 transition hover:scale-110 ${note.cardColor === c.bg ? "border-primary" : "border-transparent"}`}
                    style={{ backgroundColor: c.bg, boxShadow: `0 0 0 1px ${c.border}` }} />
                ))}
              </div>
            )}
          </div>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => onRemove(index)}
            title="Delete note"
            className="p-1 rounded hover:bg-red-100 text-muted-foreground/30 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Rich text toolbar */}
      <RichToolbar
        editorRef={editorRef}
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        thickness={thickness} setThickness={setThickness}
        onUndo={() => undoRef.current?.()}
        onRedo={() => redoRef.current?.()}
        canUndo={canUndo} canRedo={canRedo}
        activeMarker={activeMarker}
        onClearMarker={() => { setActiveMarker(null); markerCounterRef.current = 1 }}
        onMarkerInserted={marker => {
          setActiveMarker(marker)
          if (marker === "1.") markerCounterRef.current = 2
        }}
      />

      {/* Auto-expanding contentEditable — grows with content, min 3 lines */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onMouseDown={e => e.stopPropagation()}
        onInput={() => onUpdate(index, "html", editorRef.current.innerHTML)}
        onKeyDown={e => {
          if (e.key === "Tab") {
            e.preventDefault()
            document.execCommand("insertText", false, "    ")
            return
          }

          if (e.key === "Enter" && activeMarker) {
            e.preventDefault()

            // Detect if the current line is ONLY the marker (empty item) → stop the list
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              // Walk up to find the current text line
              let node = range.startContainer
              if (node.nodeType === Node.TEXT_NODE) node = node.parentNode
              const lineText = node.textContent || ""
              // If line is just the marker + nbsp/space, treat as "exit list"
              const stripped = lineText.replace(/\u00A0/g, " ").trim()
              if (stripped === activeMarker.trim() || stripped === "") {
                // Remove the empty marker line and stop the list
                document.execCommand("selectAll", false, null)
                const full = editorRef.current.innerHTML
                // Remove the trailing empty marker line
                const markerEscaped = activeMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                const cleaned = full.replace(
                  new RegExp(`(\\n|<br\\s*/?>)?\\s*${markerEscaped}[\\u00A0\\s]*$`, "i"),
                  ""
                )
                editorRef.current.innerHTML = cleaned
                // Move cursor to end
                const r = document.createRange()
                r.selectNodeContents(editorRef.current)
                r.collapse(false)
                sel.removeAllRanges()
                sel.addRange(r)
                editorRef.current.dispatchEvent(new Event("input", { bubbles: true }))
                setActiveMarker(null)
                markerCounterRef.current = 1
                return
              }
            }

            // Continue the list — insert newline + next marker
            let nextMarker = activeMarker
            if (activeMarker === "1.") {
              // Auto-increment: 1. 2. 3. ...
              nextMarker = markerCounterRef.current + "."
              markerCounterRef.current += 1
            }
            document.execCommand("insertText", false, "\n" + nextMarker + "\u00A0")
            editorRef.current.dispatchEvent(new Event("input", { bubbles: true }))
          }
        }}
        data-placeholder="Write your note here..."
        className="w-full px-3 py-2.5 text-sm focus:outline-none leading-relaxed"
        style={{
          color:        cardColor.text,
          caretColor:   cardColor.text,
          minHeight:    "72px",
          wordBreak:    "break-word",
          overflowWrap: "break-word",
        }}
      />

      {/* Drawing canvas — only rendered when a drawing tool is selected */}
      {isDrawing && (
        <DrawingCanvas
          tool={tool}
          color={color}
          thickness={thickness}
          canvasData={note.canvasData}
          onSave={data => onUpdate(index, "canvasData", data)}
          onHistoryChange={({ canUndo: u, canRedo: r }) => { setCanUndo(u); setCanRedo(r) }}
          registerUndo={fn => { undoRef.current = fn }}
          registerRedo={fn => { redoRef.current = fn }}
        />
      )}

      {/* Show saved drawing even when no tool is active */}
      {!isDrawing && note.canvasData && (
        <div
          onMouseDown={e => e.stopPropagation()}
          className="px-3 pb-3"
        >
          <img
            src={note.canvasData}
            alt="drawing"
            className="w-full rounded-lg border border-border/40"
            style={{ display: "block", imageRendering: "crisp-edges" }}
          />
        </div>
      )}
    </div>
  )
}

// ── Vocabulary Card ───────────────────────────────────────────────────────────
function VocabCard({ v, ri, updateVocab, removeVocab, sectionColor, sectionAccent }) {
  const exampleRef       = useRef(null)
  const [activeMarker,   setActiveMarker]   = useState(null)
  const markerCounterRef = useRef(1)

  useEffect(() => {
    if (exampleRef.current && exampleRef.current.innerHTML !== (v.example || "")) {
      exampleRef.current.innerHTML = v.example || ""
    }
  }, []) // only on mount

  function insertMarker(marker) {
    const el = exampleRef.current
    if (!el) return
    el.focus()
    const isEmpty = el.textContent.trim() === ""
    document.execCommand("insertText", false, (isEmpty ? "" : "\n") + marker + "\u00A0")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    setActiveMarker(marker)
    if (marker === "1.") markerCounterRef.current = 2
  }

  return (
    <div
      className="rounded-xl border group overflow-hidden"
      style={{ borderColor: sectionColor + "30", backgroundColor: sectionAccent + "40" }}
    >
      {/* Top row: grip + word + meaning + delete */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <GripVertical size={14} className="text-muted-foreground/30 mt-2 flex-shrink-0" style={{ cursor: "grab" }} />
        <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
          <input
            value={v.word || ""}
            onChange={e => updateVocab(ri, "word", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Word or phrase"
            className="flex-1 min-w-0 text-sm font-semibold bg-white border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
          <input
            value={v.meaning || ""}
            onChange={e => updateVocab(ri, "meaning", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Meaning / definition"
            className="flex-1 min-w-0 text-sm bg-white border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
        </div>
        <button
          onClick={() => removeVocab(ri)}
          onMouseDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Example sentence — auto-expanding contentEditable */}
      <div className="px-3 pb-1">
        <div
          ref={exampleRef}
          contentEditable
          suppressContentEditableWarning
          onMouseDown={e => e.stopPropagation()}
          onInput={() => updateVocab(ri, "example", exampleRef.current.innerHTML)}
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault()
              document.execCommand("insertText", false, "    ")
              return
            }
            if (e.key === "Enter" && activeMarker) {
              e.preventDefault()
              const sel = window.getSelection()
              if (sel && sel.rangeCount > 0) {
                let node = sel.getRangeAt(0).startContainer
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode
                const stripped = (node.textContent || "").replace(/\u00A0/g, " ").trim()
                if (stripped === activeMarker.trim() || stripped === "") {
                  const full = exampleRef.current.innerHTML
                  const markerEscaped = activeMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                  const cleaned = full.replace(
                    new RegExp(`(\\n|<br\\s*/?>)?\\s*${markerEscaped}[\\u00A0\\s]*$`, "i"), ""
                  )
                  exampleRef.current.innerHTML = cleaned
                  const r = document.createRange()
                  r.selectNodeContents(exampleRef.current)
                  r.collapse(false)
                  sel.removeAllRanges()
                  sel.addRange(r)
                  exampleRef.current.dispatchEvent(new Event("input", { bubbles: true }))
                  setActiveMarker(null)
                  markerCounterRef.current = 1
                  return
                }
              }
              let nextMarker = activeMarker
              if (activeMarker === "1.") {
                nextMarker = markerCounterRef.current + "."
                markerCounterRef.current += 1
              }
              document.execCommand("insertText", false, "\n" + nextMarker + "\u00A0")
              exampleRef.current.dispatchEvent(new Event("input", { bubbles: true }))
            }
          }}
          data-placeholder="Example sentence (optional)"
          className="w-full text-xs focus:outline-none leading-relaxed rounded-lg px-3 py-2 bg-white/60 border border-border/40 italic"
          style={{
            minHeight:    "32px",
            wordBreak:    "break-word",
            overflowWrap: "break-word",
            color:        "#64748b",
            caretColor:   sectionColor,
          }}
        />
      </div>

      {/* Marker helpers */}
      <div className="px-3 pb-2.5 flex items-center gap-1.5">
        {[{ label: "• Bullet", marker: "•" }, { label: "1. Number", marker: "1." }, { label: "★ Star", marker: "★" }].map(({ label, marker }) => (
          <button
            key={marker}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={() => insertMarker(marker)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition ${activeMarker === marker ? "border-current bg-white font-semibold" : "border-border/50 text-muted-foreground hover:bg-white/80 hover:text-foreground"}`}
            style={{ color: activeMarker === marker ? sectionColor : undefined }}
          >
            <span className="text-sm leading-none">{marker}</span>
            <span>{label.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
        {activeMarker && (
          <button
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={() => { setActiveMarker(null); markerCounterRef.current = 1 }}
            className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground transition"
            title="Stop list"
          >✕</button>
        )}
      </div>
    </div>
  )
}

// ── Mistake Card ──────────────────────────────────────────────────────────────
function MistakeCard({ m, ri, updateMistake, removeMistake, sectionColor, sectionAccent }) {
  const reasonRef        = useRef(null)
  const [activeMarker,   setActiveMarker]   = useState(null)
  const markerCounterRef = useRef(1)

  useEffect(() => {
    if (reasonRef.current && reasonRef.current.innerHTML !== (m.reason || "")) {
      reasonRef.current.innerHTML = m.reason || ""
    }
  }, []) // only on mount

  function insertMarker(marker) {
    const el = reasonRef.current
    if (!el) return
    el.focus()
    const isEmpty = el.textContent.trim() === ""
    document.execCommand("insertText", false, (isEmpty ? "" : "\n") + marker + "\u00A0")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    setActiveMarker(marker)
    if (marker === "1.") markerCounterRef.current = 2
  }

  return (
    <div
      className="rounded-xl border group overflow-hidden"
      style={{ borderColor: sectionColor + "30", backgroundColor: sectionAccent + "60" }}
    >
      {/* Top row: grip + source + mistake + delete */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <GripVertical size={14} className="text-muted-foreground/30 mt-2 flex-shrink-0" style={{ cursor: "grab" }} />
        <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
          <input
            value={m.source || ""}
            onChange={e => updateMistake(ri, "source", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Source (e.g. Mock Test 2)"
            className="sm:w-36 w-full text-xs bg-white border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 flex-shrink-0"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
          <input
            value={m.mistake || ""}
            onChange={e => updateMistake(ri, "mistake", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="What was the mistake?"
            className="flex-1 min-w-0 text-sm bg-white border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
        </div>
        <button
          onClick={() => removeMistake(ri)}
          onMouseDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-100 transition opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Reason — auto-expanding contentEditable with Enter continuation */}
      <div className="px-3 pb-1">
        <div
          ref={reasonRef}
          contentEditable
          suppressContentEditableWarning
          onMouseDown={e => e.stopPropagation()}
          onInput={() => updateMistake(ri, "reason", reasonRef.current.innerHTML)}
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault()
              document.execCommand("insertText", false, "    ")
              return
            }

            if (e.key === "Enter" && activeMarker) {
              e.preventDefault()

              const sel = window.getSelection()
              if (sel && sel.rangeCount > 0) {
                let node = sel.getRangeAt(0).startContainer
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode
                const stripped = (node.textContent || "").replace(/\u00A0/g, " ").trim()
                if (stripped === activeMarker.trim() || stripped === "") {
                  // Empty marker line — exit the list
                  const full = reasonRef.current.innerHTML
                  const markerEscaped = activeMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                  const cleaned = full.replace(
                    new RegExp(`(\\n|<br\\s*/?>)?\\s*${markerEscaped}[\\u00A0\\s]*$`, "i"), ""
                  )
                  reasonRef.current.innerHTML = cleaned
                  const r = document.createRange()
                  r.selectNodeContents(reasonRef.current)
                  r.collapse(false)
                  sel.removeAllRanges()
                  sel.addRange(r)
                  reasonRef.current.dispatchEvent(new Event("input", { bubbles: true }))
                  setActiveMarker(null)
                  markerCounterRef.current = 1
                  return
                }
              }

              let nextMarker = activeMarker
              if (activeMarker === "1.") {
                nextMarker = markerCounterRef.current + "."
                markerCounterRef.current += 1
              }
              document.execCommand("insertText", false, "\n" + nextMarker + "\u00A0")
              reasonRef.current.dispatchEvent(new Event("input", { bubbles: true }))
            }
          }}
          data-placeholder="Why did this happen? How to avoid it?"
          className="w-full text-xs focus:outline-none leading-relaxed rounded-lg px-3 py-2 bg-white/70 border border-border/40"
          style={{
            minHeight:    "36px",
            wordBreak:    "break-word",
            overflowWrap: "break-word",
            color:        "#475569",
            caretColor:   sectionColor,
          }}
        />
      </div>

      {/* Bullet helpers */}
      <div className="px-3 pb-2.5 flex items-center gap-1.5">
        {[{ label: "• Bullet", marker: "•" }, { label: "1. Number", marker: "1." }, { label: "★ Star", marker: "★" }].map(({ label, marker }) => (
          <button
            key={marker}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={() => insertMarker(marker)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition ${activeMarker === marker ? "border-current bg-white font-semibold" : "border-border/50 text-muted-foreground hover:bg-white/80 hover:text-foreground"}`}
            style={{ color: activeMarker === marker ? sectionColor : undefined }}
          >
            <span className="text-sm leading-none">{marker}</span>
            <span>{label.split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
        {activeMarker && (
          <button
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={() => { setActiveMarker(null); markerCounterRef.current = 1 }}
            className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground transition"
            title="Stop list"
          >✕</button>
        )}
      </div>
    </div>
  )
}

// ── Reusable section dropdown ─────────────────────────────────────────────────
function SectionDropdown({ sections, activeSection, setActiveSection, counts, ddRef, show, setShow }) {
  const current  = sections.find(s => s.id === activeSection) || sections[0]
  const btnRef   = useRef(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })

  function openDropdown() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setShow(p => !p)
  }

  // Close on outside click — attach to the ddRef container
  return (
    <div ref={ddRef} className="relative flex-1">
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 transition text-sm font-medium"
        style={{ color: current.color }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: current.accent }}>
            <current.icon size={13} style={{ color: current.color }} />
          </div>
          <span>{current.label}</span>
          {(counts[current.id] || 0) > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: current.color }}>{counts[current.id]}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${show ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            style={{
              position: "fixed",
              top:   dropPos.top,
              left:  dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
              maxHeight: 260,
              overflowY: "auto",
            }}
            className="bg-white border border-border rounded-xl shadow-xl"
          >
            {sections.map(s => (
              <button key={s.id}
                onClick={() => { setActiveSection(s.id); setShow(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition ${activeSection === s.id ? "bg-secondary/30" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.accent }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
                <span className="text-sm font-medium flex-1 text-left" style={{ color: activeSection === s.id ? s.color : undefined }}>
                  {s.label}
                </span>
                {(counts[s.id] || 0) > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: s.color }}>{counts[s.id]}</span>
                )}
                {activeSection === s.id && <CheckCircle2 size={13} style={{ color: s.color }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Generic draggable list wrapper ────────────────────────────────────────────
function DraggableList({ items, onReorder, renderItem, className = "space-y-2" }) {
  const [dragging,   setDragging]   = useState(null)  // index being dragged
  const [dropTarget, setDropTarget] = useState(null)  // index being hovered over
  const dragIdx     = useRef(null)
  const dragOverIdx = useRef(null)

  function handleDragStart(e, i) {
    dragIdx.current = i
    setDragging(i)
    e.dataTransfer.effectAllowed = "move"
    // Transparent drag image so it doesn't look broken
    const ghost = document.createElement("div")
    ghost.style.position = "absolute"
    ghost.style.top = "-9999px"
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  function handleDragEnter(e, i) {
    e.preventDefault()
    if (dragIdx.current === i) return
    dragOverIdx.current = i
    setDropTarget(i)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  function handleDrop(e, i) {
    e.preventDefault()
    const from = dragIdx.current
    const to   = i
    if (from !== null && to !== null && from !== to) onReorder(from, to)
    dragIdx.current     = null
    dragOverIdx.current = null
    setDragging(null)
    setDropTarget(null)
  }

  function handleDragEnd() {
    dragIdx.current     = null
    dragOverIdx.current = null
    setDragging(null)
    setDropTarget(null)
  }

  return (
    <div className={className}>
      {items.map((item, i) => {
        const isDragging  = dragging   === i
        const isDropZone  = dropTarget === i && dragging !== i
        return (
          <div
            key={i}
            draggable
            onDragStart={e => handleDragStart(e, i)}
            onDragEnter={e => handleDragEnter(e, i)}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            style={{
              opacity:      isDragging ? 0.35 : 1,
              transform:    isDropZone ? "translateY(-2px)" : "none",
              boxShadow:    isDropZone ? "0 0 0 2px #7c3aed, 0 4px 12px rgba(124,58,237,0.15)" : "none",
              borderRadius: 12,
              transition:   "opacity 0.15s, transform 0.12s, box-shadow 0.12s",
            }}
          >
            {renderItem(item, i)}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function NotebookModal({ open, onClose, openAuth }) {
  const [activeTab,       setActiveTab]       = useState("vocabulary")
  const [noteSection,     setNoteSection]     = useState("general")
  const [vocabSection,    setVocabSection]    = useState("general")
  const [mistakeSection,  setMistakeSection]  = useState("general")
  const [showNoteDD,      setShowNoteDD]      = useState(false)
  const [showVocabDD,     setShowVocabDD]     = useState(false)
  const [showMistakeDD,   setShowMistakeDD]   = useState(false)

  const [data, setData] = useState({
    vocabulary: { ...EMPTY_VOCAB    },
    mistakes:   { ...EMPTY_MISTAKES },
    notes:      { ...EMPTY_NOTES    },
  })
  const [search,    setSearch]    = useState("")
  const [saveState, setSaveState] = useState("idle")
  const [loading,   setLoading]   = useState(false)
  const [user,      setUser]      = useState(null)

  const saveTimer  = useRef(null)
  const loaded      = useRef(false)
  const skipSave    = useRef(true)
  const noteDDRef    = useRef(null)
  const vocabDDRef   = useRef(null)
  const mistakeDDRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function h(e) {
      if (noteDDRef.current    && !noteDDRef.current.contains(e.target))    setShowNoteDD(false)
      if (vocabDDRef.current   && !vocabDDRef.current.contains(e.target))   setShowVocabDD(false)
      if (mistakeDDRef.current && !mistakeDDRef.current.contains(e.target)) setShowMistakeDD(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // ── Normalize helpers ──────────────────────────────────────────────────────
  function normalizeSectioned(raw, empty, legacyField) {
    if (raw && typeof raw === "object" && !Array.isArray(raw) && Object.keys(empty).some(k => k in raw)) {
      return { ...empty, ...Object.fromEntries(Object.keys(empty).map(k => [k, Array.isArray(raw[k]) ? raw[k] : []])) }
    }
    // Old flat array → migrate to general
    const arr = Array.isArray(raw) ? raw : []
    return { ...empty, general: arr }
  }

  function normalizeNotes(raw) {
    if (raw && typeof raw === "object" && !Array.isArray(raw) && Object.keys(EMPTY_NOTES).some(k => k in raw)) {
      return { ...EMPTY_NOTES, ...Object.fromEntries(NOTE_SECTIONS.map(s => [s.id, Array.isArray(raw[s.id]) ? raw[s.id] : []])) }
    }
    let arr = []
    if (Array.isArray(raw)) arr = raw
    else if (typeof raw === "string" && raw.trim()) arr = [{ html: raw.replace(/\n/g, "<br>"), cardColor: "#ffffff", canvasData: null, title: "" }]
    return { ...EMPTY_NOTES, general: arr }
  }

  function buildFresh(row) {
    return {
      vocabulary: normalizeSectioned(row.vocabulary, EMPTY_VOCAB),
      mistakes:   normalizeSectioned(row.mistakes,   EMPTY_MISTAKES),
      notes:      normalizeNotes(row.notes),
    }
  }

  // ── localStorage cache ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("ielts-notebook") || "null")
      if (cached) {
        // Migrate old flat arrays from cache
        const normalized = {
          vocabulary: normalizeSectioned(cached.vocabulary, EMPTY_VOCAB),
          mistakes:   normalizeSectioned(cached.mistakes,   EMPTY_MISTAKES),
          notes:      normalizeNotes(cached.notes),
        }
        setData(normalized)
        loaded.current = true
        setLoading(false)
      }
    } catch {}

    async function fetchFresh() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); skipSave.current = false; return }
      setUser(session.user)
      const { data: row } = await supabase
        .from("notebook").select("*")
        .eq("user_id", session.user.id).maybeSingle()
      if (row) {
        const fresh = buildFresh(row)
        setData(fresh)
        localStorage.setItem("ielts-notebook", JSON.stringify(fresh))
        loaded.current = true
      } else {
        // No row yet — still mark loaded so save can fire when user adds data
        loaded.current = true
      }
      skipSave.current = false
      setLoading(false)
    }

    if (!loaded.current) setLoading(true)
    fetchFresh().catch(() => { setLoading(false); skipSave.current = false })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        setData({ vocabulary: { ...EMPTY_VOCAB }, mistakes: { ...EMPTY_MISTAKES }, notes: { ...EMPTY_NOTES } })
        localStorage.removeItem("ielts-notebook")
        loaded.current   = false
        skipSave.current = true
        setLoading(false)
        return
      }
      if (event === "SIGNED_IN") {
        setUser(session.user)
        try {
          const { data: row } = await supabase
            .from("notebook").select("*")
            .eq("user_id", session.user.id).maybeSingle()
          if (row) {
            const fresh = buildFresh(row)
            setData(fresh)
            localStorage.setItem("ielts-notebook", JSON.stringify(fresh))
            loaded.current = true
          } else {
            loaded.current = true
          }
          skipSave.current = false
        } finally { setLoading(false) }
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ── Auto-save — only fires when loaded & user exists & skipSave is false ───
  useEffect(() => {
    if (!loaded.current || !user || skipSave.current) return
    clearTimeout(saveTimer.current)
    setSaveState("idle")
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving")
      try {
        localStorage.setItem("ielts-notebook", JSON.stringify(data))
        await supabase.from("notebook").upsert(
          { user_id: user.id, vocabulary: data.vocabulary, mistakes: data.mistakes, notes: data.notes, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 2000)
      } catch {
        setSaveState("idle")
      }
    }, 1000)
    return () => clearTimeout(saveTimer.current)
  }, [data, user])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // ── Generic sectioned helpers ─────────────────────────────────────────────
  function addItem(tab, section, template) {
    setData(d => ({ ...d, [tab]: { ...d[tab], [section]: [template, ...d[tab][section]] } }))
  }
  function updateItem(tab, section, i, field, val) {
    setData(d => {
      const arr = [...d[tab][section]]; arr[i] = { ...arr[i], [field]: val }
      return { ...d, [tab]: { ...d[tab], [section]: arr } }
    })
  }
  function removeItem(tab, section, i) {
    setData(d => ({ ...d, [tab]: { ...d[tab], [section]: d[tab][section].filter((_, idx) => idx !== i) } }))
  }
  function reorderItems(tab, section, from, to) {
    setData(d => {
      const arr = [...d[tab][section]]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...d, [tab]: { ...d[tab], [section]: arr } }
    })
  }

  // Shorthand helpers
  const addVocab      = () => addItem("vocabulary", vocabSection,   { word: "", meaning: "", example: "" })
  const updateVocab   = (i, f, v) => updateItem("vocabulary", vocabSection, i, f, v)
  const removeVocab   = (i) => removeItem("vocabulary", vocabSection, i)
  const reorderVocab  = (f, t) => reorderItems("vocabulary", vocabSection, f, t)

  const addMistake     = () => addItem("mistakes", mistakeSection, { source: "", mistake: "", reason: "" })
  const updateMistake  = (i, f, v) => updateItem("mistakes", mistakeSection, i, f, v)
  const removeMistake  = (i) => removeItem("mistakes", mistakeSection, i)
  const reorderMistake = (f, t) => reorderItems("mistakes", mistakeSection, f, t)

  const addNote      = () => addItem("notes", noteSection, { title: "", html: "", cardColor: "#ffffff", canvasData: null })
  const updateNote   = (i, f, v) => updateItem("notes", noteSection, i, f, v)
  const removeNote   = (i) => removeItem("notes", noteSection, i)
  const reorderNote  = (f, t) => reorderItems("notes", noteSection, f, t)

  // Counts
  const vocabCounts   = Object.fromEntries(VOCAB_SECTIONS.map(s => [s.id, data.vocabulary[s.id]?.length ?? 0]))
  const mistakeCounts = Object.fromEntries(MISTAKE_SECTIONS.map(s => [s.id, data.mistakes[s.id]?.length ?? 0]))
  const noteCounts    = Object.fromEntries(NOTE_SECTIONS.map(s => [s.id, data.notes[s.id]?.length ?? 0]))
  const totalVocab    = Object.values(vocabCounts).reduce((a, b) => a + b, 0)
  const totalMistakes = Object.values(mistakeCounts).reduce((a, b) => a + b, 0)
  const totalNotes    = Object.values(noteCounts).reduce((a, b) => a + b, 0)

  const currentVocabSection   = VOCAB_SECTIONS.find(s => s.id === vocabSection)   || VOCAB_SECTIONS[0]
  const currentMistakeSection = MISTAKE_SECTIONS.find(s => s.id === mistakeSection) || MISTAKE_SECTIONS[0]
  const currentNoteSection    = NOTE_SECTIONS.find(s => s.id === noteSection)      || NOTE_SECTIONS[0]

  const q              = search.toLowerCase()
  const currentVocab   = (data.vocabulary[vocabSection] || []).filter(v => !q || v.word?.toLowerCase().includes(q) || v.meaning?.toLowerCase().includes(q))
  const currentMistakes = (data.mistakes[mistakeSection] || []).filter(m => !q || m.mistake?.toLowerCase().includes(q) || m.source?.toLowerCase().includes(q))
  const currentNotes   = data.notes[noteSection] || []

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
          <button onClick={onClose}  className="px-5 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary transition">Close</button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <style>{`
            [data-placeholder]:empty:before { content: attr(data-placeholder); opacity: 0.35; pointer-events: none; }
            [contenteditable] ul { list-style-type: disc;    padding-left: 1.4em; margin: 0.2em 0; }
            [contenteditable] ol { list-style-type: decimal; padding-left: 1.4em; margin: 0.2em 0; }
            [contenteditable] li { margin: 0.1em 0; }
          `}</style>
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-background border border-border w-full max-w-2xl rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📓</span>
                <h2 className="text-base font-bold">Study Notebook</h2>
              </div>
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
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
                const count = tab.id === "vocabulary" ? totalVocab : tab.id === "mistakes" ? totalMistakes : totalNotes
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
                      <motion.div layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: tab.color }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Section dropdown + search bar */}
            <div className="px-5 pt-3 pb-2 flex-shrink-0 flex items-center gap-2">
              {activeTab === "vocabulary" && (
                <SectionDropdown sections={VOCAB_SECTIONS} activeSection={vocabSection} setActiveSection={setVocabSection}
                  counts={vocabCounts} ddRef={vocabDDRef} show={showVocabDD} setShow={setShowVocabDD} />
              )}
              {activeTab === "mistakes" && (
                <SectionDropdown sections={MISTAKE_SECTIONS} activeSection={mistakeSection} setActiveSection={setMistakeSection}
                  counts={mistakeCounts} ddRef={mistakeDDRef} show={showMistakeDD} setShow={setShowMistakeDD} />
              )}
              {activeTab === "notes" && (
                <SectionDropdown sections={NOTE_SECTIONS} activeSection={noteSection} setActiveSection={setNoteSection}
                  counts={noteCounts} ddRef={noteDDRef} show={showNoteDD} setShow={setShowNoteDD} />
              )}
              {activeTab !== "notes" && (
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={activeTab === "vocabulary" ? "Search words..." : "Search mistakes..."}
                    className="w-full text-sm bg-secondary/60 border border-border rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading your notebook...
                </div>
              ) : (
                <>
                  {/* ── Vocabulary tab ── */}
                  {activeTab === "vocabulary" && (
                    <div>
                      <button onClick={addVocab}
                        className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition"
                        style={{ borderColor: currentVocabSection.color + "80", color: currentVocabSection.color }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = currentVocabSection.accent}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Plus size={15} /> Add {currentVocabSection.label} Word
                      </button>
                      {currentVocab.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          {search ? "No words match." : `No ${currentVocabSection.label.toLowerCase()} vocabulary yet.`}
                        </p>
                      )}
                      <DraggableList
                        items={currentVocab}
                        onReorder={reorderVocab}
                        renderItem={(v, i) => {
                          const ri = (data.vocabulary[vocabSection] || []).indexOf(v)
                          return (
                            <VocabCard
                              key={ri}
                              v={v}
                              ri={ri}
                              updateVocab={updateVocab}
                              removeVocab={removeVocab}
                              sectionColor={currentVocabSection.color}
                              sectionAccent={currentVocabSection.accent}
                            />
                          )
                        }}
                      />
                    </div>
                  )}

                  {/* ── Mistakes tab ── */}
                  {activeTab === "mistakes" && (
                    <div>
                      <button onClick={addMistake}
                        className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition"
                        style={{ borderColor: currentMistakeSection.color + "80", color: currentMistakeSection.color }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = currentMistakeSection.accent}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Plus size={15} /> Log {currentMistakeSection.label} Mistake
                      </button>
                      {currentMistakes.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          {search ? "No mistakes match." : `No ${currentMistakeSection.label.toLowerCase()} mistakes logged yet.`}
                        </p>
                      )}
                      <DraggableList
                        items={currentMistakes}
                        onReorder={reorderMistake}
                        renderItem={(m, i) => {
                          const ri = (data.mistakes[mistakeSection] || []).indexOf(m)
                          return (
                            <MistakeCard
                              key={ri}
                              m={m}
                              ri={ri}
                              updateMistake={updateMistake}
                              removeMistake={removeMistake}
                              sectionColor={currentMistakeSection.color}
                              sectionAccent={currentMistakeSection.accent}
                            />
                          )
                        }}
                      />
                    </div>
                  )}

                  {/* ── Notes tab ── */}
                  {activeTab === "notes" && (
                    <div>
                      <button onClick={addNote}
                        className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition"
                        style={{ borderColor: currentNoteSection.color + "80", color: currentNoteSection.color }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = currentNoteSection.accent}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Plus size={15} /> New {currentNoteSection.label} Note
                      </button>
                      {currentNotes.length === 0 && (
                        <div className="flex flex-col items-center py-10 gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: currentNoteSection.accent }}>
                            <currentNoteSection.icon size={22} style={{ color: currentNoteSection.color }} />
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            No {currentNoteSection.label.toLowerCase()} notes yet.<br />Add a card to get started!
                          </p>
                        </div>
                      )}
                      <DraggableList
                        items={currentNotes}
                        onReorder={reorderNote}
                        className="space-y-3"
                        renderItem={(note, i) => (
                          <NoteCard
                            note={note}
                            index={i}
                            onUpdate={updateNote}
                            onRemove={removeNote}
                            activeTool={null}
                            toolColor="#1e293b"
                            toolThickness={2}
                          />
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-secondary/20 flex-shrink-0">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>📚 {totalVocab} words</span>
                <span>❌ {totalMistakes} mistakes</span>
                <span>📝 {totalNotes} notes</span>
              </div>
              <span className="text-xs text-muted-foreground">Synced to your account</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

