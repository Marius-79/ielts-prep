import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
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

// ── FloatingSelectionBar — appears above selected text (Canva-style) ──────────
// Rendered via portal so it floats above everything. Minimal essential tools.
function FloatingSelectionBar({ editorRef, onMarkerInserted, activeMarker, onClearMarker }) {
  const [pos,    setPos]    = useState(null)  // { top, left } in viewport px
  const [active, setActive] = useState({ bold: false, italic: false, underline: false })
  const [curFg,  setCurFg]  = useState("#1e293b")
  const [curHL,  setCurHL]  = useState("#fef08a")
  const [panel,  setPanel]  = useState(null)  // "color" | "highlight" | "marker" | null
  const barRef   = useRef(null)
  const savedRangeRef = useRef(null)

  // Re-position bar whenever selection changes inside the editor
  useEffect(() => {
    function onSelChange() {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setPos(null); setPanel(null); return }
      const el = editorRef.current
      if (!el) return
      // Only show if selection is inside our editor
      const anchorNode = sel.anchorNode
      if (!el.contains(anchorNode)) { setPos(null); setPanel(null); return }
      // Position bar above the selection
      const range = sel.getRangeAt(0)
      const rect  = range.getBoundingClientRect()
      if (rect.width === 0) { setPos(null); return }
      // Save the range so we can restore it after toolbar clicks cause blur
      savedRangeRef.current = range.cloneRange()
      setPos({ top: rect.top + window.scrollY - 48, left: rect.left + window.scrollX + rect.width / 2 })
      // Update format state
      setActive({
        bold:      document.queryCommandState("bold"),
        italic:    document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      })
      setCurFg(document.queryCommandValue("foreColor") || "#1e293b")
    }
    document.addEventListener("selectionchange", onSelChange)
    document.addEventListener("mouseup", onSelChange)
    return () => {
      document.removeEventListener("selectionchange", onSelChange)
      document.removeEventListener("mouseup", onSelChange)
    }
  }, [editorRef])

  // Close panel on outside click
  useEffect(() => {
    function h(e) {
      if (barRef.current && !barRef.current.contains(e.target)) setPanel(null)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  function restoreAndFocus() {
    const el = editorRef.current
    if (!el) return
    el.focus()
    if (savedRangeRef.current) {
      const sel = window.getSelection()
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current) }
    }
  }

  function run(cmd, val = null) {
    restoreAndFocus()
    document.execCommand(cmd, false, val)
    setActive({
      bold:      document.queryCommandState("bold"),
      italic:    document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    })
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
  }

  function applyColor(c) {
    setCurFg(c)
    restoreAndFocus()
    document.execCommand("foreColor", false, c)
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
    setPanel(null)
  }

  function applyHL(c) {
    setCurHL(c)
    restoreAndFocus()
    if (c === "none") {
      document.execCommand("hiliteColor", false, "transparent")
      document.execCommand("backColor",   false, "transparent")
    } else {
      document.execCommand("hiliteColor", false, c)
    }
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
    setPanel(null)
  }

  function insertMarker(m) {
    restoreAndFocus()
    document.execCommand("insertText", false, m + "\u00A0")
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }))
    onMarkerInserted?.(m)
    setPanel(null)
    setPos(null)
  }

  if (!pos) return null

  const BAR_W = 300
  // Clamp horizontally so bar never goes off-screen
  const clampedLeft = Math.max(8, Math.min(pos.left - BAR_W / 2, window.innerWidth - BAR_W - 8))

  const Div = () => <div className="w-px h-4 bg-white/20 mx-0.5 flex-shrink-0"/>
  const Btn = ({ onClick, active: isOn, title, children }) => (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded-md transition flex-shrink-0 text-sm leading-none ${isOn ? "bg-white/25 text-white" : "text-white/80 hover:bg-white/15 hover:text-white"}`}
    >{children}</button>
  )

  const FG_COLORS = ["#1e293b","#ef4444","#f97316","#eab308","#16a34a","#2563eb","#7c3aed","#ec4899","#ffffff"]
  const HL_COLORS = [
    { v:"#fef08a", label:"Yellow" }, { v:"#bbf7d0", label:"Green" },
    { v:"#bfdbfe", label:"Blue"   }, { v:"#fecaca", label:"Red"   },
    { v:"#e9d5ff", label:"Purple" }, { v:"none",    label:"None"  },
  ]
  const MARKERS = ["•","★","➤","✓","◆","—"]

  return createPortal(
    <div
      ref={barRef}
      style={{ position: "absolute", top: pos.top, left: clampedLeft, width: BAR_W, zIndex: 99999 }}
    >
      {/* Arrow pointing down */}
      <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
        borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1e293b" }}/>

      {/* Main bar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl shadow-2xl select-none"
        style={{ background: "#1e293b", backdropFilter: "blur(8px)" }}
        onMouseDown={e => e.preventDefault()}
      >
        {/* Bold */}
        <Btn onClick={() => run("bold")}      active={active.bold}      title="Bold"><Bold size={13}/></Btn>
        {/* Italic */}
        <Btn onClick={() => run("italic")}    active={active.italic}    title="Italic"><Italic size={13}/></Btn>
        {/* Underline */}
        <Btn onClick={() => run("underline")} active={active.underline} title="Underline"><Underline size={13}/></Btn>

        <Div/>

        {/* Text color swatch trigger */}
        <button
          onMouseDown={e => { e.preventDefault(); setPanel(p => p === "color" ? null : "color") }}
          title="Text color"
          className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-md text-white/80 hover:bg-white/15 hover:text-white transition"
        >
          <span className="text-[12px] font-bold leading-none">A</span>
          <span className="w-3.5 h-[3px] rounded-full" style={{ backgroundColor: curFg === "rgb(255,255,255)" ? "#fff" : curFg }}/>
        </button>

        {/* Highlight swatch trigger */}
        <button
          onMouseDown={e => { e.preventDefault(); setPanel(p => p === "highlight" ? null : "highlight") }}
          title="Highlight"
          className="p-1.5 rounded-md text-white/80 hover:bg-white/15 hover:text-white transition"
        >
          <Highlighter size={13}/>
        </button>

        <Div/>

        {/* Bullet list */}
        <Btn onClick={() => { run("insertUnorderedList"); setPos(null) }} title="Bullet list">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
            <circle cx="4" cy="6" r="2.2" fill="currentColor"/>
            <circle cx="4" cy="12" r="2.2" fill="currentColor"/>
            <line x1="9" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2.2"/>
            <line x1="9" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2.2"/>
          </svg>
        </Btn>

        {/* Markers */}
        <button
          onMouseDown={e => { e.preventDefault(); setPanel(p => p === "marker" ? null : "marker") }}
          title="Insert marker"
          className={`p-1.5 rounded-md transition text-sm leading-none ${panel === "marker" ? "bg-white/25 text-white" : "text-white/80 hover:bg-white/15 hover:text-white"}`}
        >
          <List size={13}/>
        </button>

        <Div/>

        {/* Clear formatting */}
        <Btn onClick={() => { run("removeFormat"); setPos(null) }} title="Clear format">
          <X size={13}/>
        </Btn>
      </div>

      {/* Sub-panel: text color */}
      {panel === "color" && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-border rounded-xl shadow-2xl p-3" style={{ minWidth: 168 }}>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Text Color</p>
          <div className="flex flex-wrap gap-1.5">
            {FG_COLORS.map(c => (
              <button key={c} onMouseDown={e => { e.preventDefault(); applyColor(c) }}
                className={`w-6 h-6 rounded-lg border-2 transition hover:scale-110 ${curFg === c ? "border-primary shadow" : "border-transparent"}`}
                style={{ backgroundColor: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e2e8f0" : undefined }}/>
            ))}
          </div>
        </div>
      )}

      {/* Sub-panel: highlight */}
      {panel === "highlight" && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-border rounded-xl shadow-2xl p-3" style={{ minWidth: 168 }}>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Highlight</p>
          <div className="flex flex-wrap gap-1.5">
            {HL_COLORS.map(({ v, label }) => (
              <button key={v} onMouseDown={e => { e.preventDefault(); applyHL(v) }}
                title={label}
                className="w-6 h-6 rounded-lg border-2 border-transparent transition hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: v === "none" ? "#f1f5f9" : v }}>
                {v === "none" && <X size={9} className="text-muted-foreground"/>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-panel: markers */}
      {panel === "marker" && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-border rounded-xl shadow-2xl p-3" style={{ minWidth: 168 }}>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Insert Marker</p>
          <div className="flex flex-wrap gap-1.5">
            {MARKERS.map(m => (
              <button key={m} onMouseDown={e => { e.preventDefault(); insertMarker(m) }}
                className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition hover:scale-110 border-2 ${activeMarker === m ? "border-primary bg-primary/5" : "border-transparent hover:bg-secondary"}`}>
                {m}
              </button>
            ))}
          </div>
          {activeMarker && (
            <button onMouseDown={e => { e.preventDefault(); onClearMarker?.(); setPanel(null) }}
              className="mt-2 w-full text-[11px] text-red-400 hover:text-red-500 flex items-center justify-center gap-1 py-1 rounded-lg hover:bg-red-50 transition">
              <X size={9}/> Stop list
            </button>
          )}
        </div>
      )}
    </div>,
    document.body
  )
}

// ── DrawMiniBar — draw toolbar with shapes dropdown + text tool ───────────────
function DrawMiniBar({ tool, setTool, color, setColor, thickness, setThickness, fontSize, setFontSize, onUndo, onRedo, canUndo, canRedo }) {
  const [showColors,  setShowColors]  = useState(false)
  const [showSizes,   setShowSizes]   = useState(false)
  const [showShapes,  setShowShapes]  = useState(false)
  const colorsRef  = useRef(null)
  const sizesRef   = useRef(null)
  const shapesRef  = useRef(null)

  useEffect(() => {
    function h(e) {
      if (colorsRef.current  && !colorsRef.current.contains(e.target))  setShowColors(false)
      if (sizesRef.current   && !sizesRef.current.contains(e.target))   setShowSizes(false)
      if (shapesRef.current  && !shapesRef.current.contains(e.target))  setShowShapes(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const DRAW_COLORS = ["#1e293b","#ef4444","#f97316","#eab308","#22c55e","#0ea5e9","#7c3aed","#ec4899","#94a3b8","#ffffff"]
  const SIZES = [1, 2, 3, 5, 8]
  const FONT_SIZES_DRAW = [12, 14, 16, 20, 28, 36]

  // Shapes grouped like Word/Canva
  const SHAPE_GROUPS = [
    {
      label: "Lines",
      shapes: [
        { id:"line",        label:"Line",           svg: <line x1="3" y1="19" x2="19" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
        { id:"arrow",       label:"Arrow →",        svg: <><line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="13,6 19,12 13,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
        { id:"arrowLeft",   label:"Arrow ←",        svg: <><line x1="19" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="9,6 3,12 9,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
        { id:"arrowDouble", label:"Arrow ↔",        svg: <><line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="13,6 19,12 13,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8,6 3,12 8,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
        { id:"arrowUp",     label:"Arrow ↑",        svg: <><line x1="12" y1="19" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="6,9 12,3 18,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
        { id:"arrowDiag",   label:"Arrow ↗",        svg: <><line x1="4" y1="18" x2="18" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="9,4 18,4 18,13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
      ]
    },
    {
      label: "Basic Shapes",
      shapes: [
        { id:"rect",        label:"Rectangle",      svg: <rect x="3" y="5" width="16" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"roundedRect", label:"Rounded Rect",   svg: <rect x="3" y="5" width="16" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"circle",      label:"Ellipse",        svg: <ellipse cx="11" cy="11" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"diamond",     label:"Diamond",        svg: <polygon points="11,3 20,11 11,19 2,11" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"triangle",    label:"Triangle",       svg: <polygon points="11,3 20,20 2,20" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"parallelogram",label:"Parallelogram", svg: <polygon points="5,18 8,4 18,4 15,18" fill="none" stroke="currentColor" strokeWidth="2"/> },
      ]
    },
    {
      label: "Flowchart",
      shapes: [
        { id:"process",     label:"Process",        svg: <rect x="2" y="6" width="18" height="10" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"decision",    label:"Decision ◇",     svg: <polygon points="11,3 20,11 11,19 2,11" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"terminator",  label:"Start/End",      svg: <rect x="2" y="6" width="18" height="10" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/> },
        { id:"cylinder",    label:"Database",       svg: <><ellipse cx="11" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="6" x2="3" y2="16" stroke="currentColor" strokeWidth="2"/><line x1="19" y1="6" x2="19" y2="16" stroke="currentColor" strokeWidth="2"/><ellipse cx="11" cy="16" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="2"/></> },
        { id:"arrowBlock",  label:"Block Arrow",    svg: <polygon points="2,8 14,8 14,5 20,11 14,17 14,14 2,14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/> },
        { id:"cloud",       label:"Cloud",          svg: <path d="M6.5 18H4a3 3 0 0 1 0-6 3 3 0 0 1 5.5-2A3 3 0 0 1 18 12a3 3 0 0 1 0 6H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
      ]
    },
    {
      label: "Callouts",
      shapes: [
        { id:"calloutRect",  label:"Callout Box",   svg: <><rect x="2" y="2" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><polyline points="7,15 5,20 11,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></> },
        { id:"calloutOval",  label:"Callout Oval",  svg: <><ellipse cx="11" cy="9" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="2"/><polyline points="8,15 6,20 13,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></> },
        { id:"star",         label:"Star",          svg: <polygon points="11,2 13.4,8.5 20.5,8.5 14.6,12.7 16.9,19.2 11,15.1 5.1,19.2 7.4,12.7 1.5,8.5 8.6,8.5" fill="none" stroke="currentColor" strokeWidth="1.5"/> },
        { id:"hexagon",      label:"Hexagon",       svg: <polygon points="5.5,4 16.5,4 21,11 16.5,18 5.5,18 1,11" fill="none" stroke="currentColor" strokeWidth="2"/> },
      ]
    },
  ]

  const allShapes = SHAPE_GROUPS.flatMap(g => g.shapes)
  const activeShape = allShapes.find(s => s.id === tool)

  const B   = "p-1.5 rounded-lg transition flex-shrink-0"
  const on  = "bg-primary/12 text-primary"
  const off = "text-muted-foreground/60 hover:text-foreground hover:bg-secondary"

  return (
    <div
      className="border-t border-border/40 bg-secondary/10 flex-shrink-0"
      onMouseDown={e => e.preventDefault()}
      onTouchStart={e => e.stopPropagation()}
    >
      {/* Active tool label on mobile */}
      {tool && (
        <div className="sm:hidden px-3 py-1 flex items-center gap-2 border-b border-border/20">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active:</span>
          <span className="text-[11px] font-semibold text-primary capitalize">{tool}</span>
          <button onMouseDown={e=>{ e.preventDefault(); setTool(null) }}
            className="ml-auto text-[10px] text-muted-foreground/60 hover:text-red-400 transition px-2 py-0.5 rounded-lg hover:bg-red-50">
            × Clear
          </button>
        </div>
      )}

      {/* Scrollable toolbar */}
      <div className="flex items-center gap-0.5 px-2 sm:px-2.5 py-1.5 overflow-x-auto scrollbar-none">
      {/* Undo / Redo */}
      <button onMouseDown={e=>{ e.preventDefault(); onUndo?.() }} disabled={!canUndo} title="Undo"
        className={`${B} ${canUndo ? off : "text-muted-foreground/20 cursor-not-allowed"} flex-shrink-0`}><Undo2 size={13}/></button>
      <button onMouseDown={e=>{ e.preventDefault(); onRedo?.() }} disabled={!canRedo} title="Redo"
        className={`${B} ${canRedo ? off : "text-muted-foreground/20 cursor-not-allowed"} flex-shrink-0`}><Redo2 size={13}/></button>

      <div className="w-px h-4 bg-border/50 mx-0.5 flex-shrink-0"/>

      {/* Pen */}
      <button onMouseDown={e=>{ e.preventDefault(); setTool(tool==="pen"?null:"pen") }}
        title="Pen" className={`${B} flex-shrink-0 ${tool==="pen" ? on : off}`}><PenLine size={14}/></button>

      {/* Eraser */}
      <button onMouseDown={e=>{ e.preventDefault(); setTool(tool==="eraser"?null:"eraser") }}
        title="Eraser" className={`${B} flex-shrink-0 ${tool==="eraser" ? on : off}`}><Eraser size={14}/></button>

      {/* Text tool */}
      <button onMouseDown={e=>{ e.preventDefault(); setTool(tool==="text"?null:"text") }}
        title="Add text"
        className={`${B} flex-shrink-0 ${tool==="text" ? on : off} flex items-center gap-0.5 text-[12px] font-bold px-2`}>
        T
      </button>

      <div className="w-px h-4 bg-border/50 mx-0.5 flex-shrink-0"/>

      {/* Shapes dropdown */}
      <div ref={shapesRef} className="relative flex-shrink-0">
        <button
          onMouseDown={e=>{ e.preventDefault(); setShowShapes(p=>!p) }}
          title="Shapes"
          className={`${B} ${activeShape ? on : off} flex items-center gap-1 px-1.5`}
        >
          {activeShape
            ? <svg width="14" height="14" viewBox="0 0 22 22" fill="none">{activeShape.svg}</svg>
            : <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="14" r="4" stroke="currentColor" strokeWidth="2"/><line x1="2" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          }
          <span className="text-[10px] hidden sm:inline">Shapes</span>
          <ChevronDown size={8}/>
        </button>

        {showShapes && (() => {
          const btnRect = shapesRef.current?.getBoundingClientRect()
          return (
          <div className="fixed z-[9999] bg-white border border-border rounded-2xl shadow-2xl shadow-black/12 overflow-hidden"
            style={{ width: "min(280px, calc(100vw - 1rem))", maxHeight: "55vh", overflowY: "auto",
              bottom: btnRect ? window.innerHeight - btnRect.top + 6 : undefined,
              left:   btnRect ? Math.min(btnRect.left, window.innerWidth - 290) : undefined }}>
            <div className="px-3 py-2.5 border-b border-border/40">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Shapes</p>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {SHAPE_GROUPS.map(group => (
                <div key={group.label} className="mb-3">
                  <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest px-1.5 mb-1.5">{group.label}</p>
                  <div className="grid grid-cols-6 gap-1">
                    {group.shapes.map(shape => (
                      <button
                        key={shape.id}
                        onMouseDown={e=>{ e.preventDefault(); setTool(tool===shape.id?null:shape.id); setShowShapes(false) }}
                        title={shape.label}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition hover:scale-110 border ${
                          tool===shape.id ? "bg-primary/10 border-primary/40 text-primary" : "border-transparent hover:bg-secondary text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">{shape.svg}</svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )
        })()}
      </div>

      <div className="w-px h-4 bg-border/50 mx-0.5 flex-shrink-0"/>

      {/* Color */}
      <div ref={colorsRef} className="relative flex-shrink-0">
        <button onMouseDown={e=>{ e.preventDefault(); setShowColors(p=>!p); setShowSizes(false) }}
          title="Color" className={`${B} ${off} flex items-center gap-1`}>
          <span className="w-4 h-4 rounded-full border-2 border-border/60 flex-shrink-0" style={{ backgroundColor: color }}/>
          <ChevronDown size={8}/>
        </button>
        {showColors && (() => {
          const btnRect = colorsRef.current?.getBoundingClientRect()
          return (
          <div className="fixed z-[9999] bg-white border border-border rounded-xl shadow-xl p-2.5"
            style={{ minWidth: 148,
              bottom: btnRect ? window.innerHeight - btnRect.top + 6 : undefined,
              left:   btnRect ? Math.min(btnRect.left, window.innerWidth - 160) : undefined }}>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {DRAW_COLORS.map(c => (
                <button key={c} onMouseDown={e=>{ e.preventDefault(); setColor(c); setShowColors(false) }}
                  className={`w-6 h-6 rounded-lg border-2 transition hover:scale-110 ${color===c?"border-primary":"border-transparent"}`}
                  style={{ backgroundColor:c, boxShadow:c==="#ffffff"?"inset 0 0 0 1px #e2e8f0":undefined }}/>
              ))}
            </div>
          </div>
          )
        })()}
      </div>

      {/* Size (thickness or font size) */}
      <div ref={sizesRef} className="relative flex-shrink-0">
        <button onMouseDown={e=>{ e.preventDefault(); setShowSizes(p=>!p); setShowColors(false) }}
          title={tool==="text" ? "Font size" : "Stroke width"}
          className={`${B} ${off} flex items-center gap-1`}>
          {tool === "text"
            ? <span className="text-[10px] font-bold w-4 text-center">{fontSize}</span>
            : <span className="rounded-full bg-foreground/50 flex-shrink-0 inline-block"
                style={{ width: Math.min(thickness*2+2,10), height: Math.min(thickness*2+2,10) }}/>}
          <ChevronDown size={8}/>
        </button>
        {showSizes && (() => {
          const btnRect = sizesRef.current?.getBoundingClientRect()
          return (
          <div className="fixed z-[9999] bg-white border border-border rounded-xl shadow-xl p-3"
            style={{ minWidth: 130,
              bottom: btnRect ? window.innerHeight - btnRect.top + 6 : undefined,
              left:   btnRect ? Math.min(btnRect.left, window.innerWidth - 145) : undefined }}>
            {tool === "text" ? (
              <>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Font Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {FONT_SIZES_DRAW.map(s => (
                    <button key={s} onMouseDown={e=>{ e.preventDefault(); setFontSize(s); setShowSizes(false) }}
                      className={`px-2 py-1 rounded-lg text-[11px] transition ${fontSize===s?"bg-primary/10 text-primary font-bold":"text-foreground/60 hover:bg-secondary"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Stroke Width</p>
                <div className="flex items-center gap-2.5">
                  {SIZES.map(s => (
                    <button key={s} onMouseDown={e=>{ e.preventDefault(); setThickness(s); setShowSizes(false) }}
                      title={`${s}px`}
                      className={`rounded-full bg-foreground/60 flex-shrink-0 transition ${thickness===s?"ring-2 ring-primary ring-offset-1":"opacity-50 hover:opacity-100 hover:ring-1 hover:ring-border"}`}
                      style={{ width:s*2+6, height:s*2+6 }}/>
                  ))}
                </div>
              </>
            )}
          </div>
          )
        })()}
      </div>


      </div>{/* end scrollable toolbar */}
    </div>
  )
}


// ─── Shape tools that go to SVG layer (not burned onto canvas bitmap) ─────────
const SHAPE_TOOLS = [
  "line","arrow","arrowLeft","arrowDouble","arrowUp","arrowDiag",
  "rect","roundedRect","circle","diamond","triangle","parallelogram",
  "process","decision","terminator","cylinder","arrowBlock",
  "calloutRect","calloutOval","star","hexagon","cloud"
]

function _newSid() {
  return `sh-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
}

// Build an SVG path string for the given shape type.
// x,y = top-left, w,h = dimensions (always positive after normalisation)
function _shapePath(type, x, y, w, h) {
  // x,y,w,h are always normalised (top-left, positive size) — safe to use directly
  const ex=x+w, ey=y+h, cx=x+w/2, cy=y+h/2
  const l=12  // arrow head size
  switch (type) {
    case "line":        return `M${x},${y} L${ex},${ey}`
    case "arrow": { const a=Math.atan2(ey-y,ex-x); return `M${x},${y} L${ex},${ey} M${ex},${ey} L${ex-l*Math.cos(a-0.4)},${ey-l*Math.sin(a-0.4)} M${ex},${ey} L${ex-l*Math.cos(a+0.4)},${ey-l*Math.sin(a+0.4)}` }
    case "arrowLeft": { const a=Math.atan2(y-ey,x-ex); return `M${ex},${ey} L${x},${y} M${x},${y} L${x-l*Math.cos(a-0.4)},${y-l*Math.sin(a-0.4)} M${x},${y} L${x-l*Math.cos(a+0.4)},${y-l*Math.sin(a+0.4)}` }
    case "arrowDouble": { const a1=Math.atan2(ey-y,ex-x),a2=Math.atan2(y-ey,x-ex); return `M${x},${y} L${ex},${ey} M${ex},${ey} L${ex-l*Math.cos(a1-0.4)},${ey-l*Math.sin(a1-0.4)} M${ex},${ey} L${ex-l*Math.cos(a1+0.4)},${ey-l*Math.sin(a1+0.4)} M${x},${y} L${x-l*Math.cos(a2-0.4)},${y-l*Math.sin(a2-0.4)} M${x},${y} L${x-l*Math.cos(a2+0.4)},${y-l*Math.sin(a2+0.4)}` }
    case "arrowUp":
    case "arrowDiag": { const a=Math.atan2(ey-y,ex-x); return `M${x},${y} L${ex},${ey} M${ex},${ey} L${ex-l*Math.cos(a-0.4)},${ey-l*Math.sin(a-0.4)} M${ex},${ey} L${ex-l*Math.cos(a+0.4)},${ey-l*Math.sin(a+0.4)}` }
    case "rect":
    case "process":     return `M${x},${y} L${ex},${y} L${ex},${ey} L${x},${ey} Z`
    case "roundedRect": { const r=Math.min(16,w/3,h/3); return `M${x+r},${y} L${ex-r},${y} Q${ex},${y} ${ex},${y+r} L${ex},${ey-r} Q${ex},${ey} ${ex-r},${ey} L${x+r},${ey} Q${x},${ey} ${x},${ey-r} L${x},${y+r} Q${x},${y} ${x+r},${y} Z` }
    case "circle":      return `M${cx},${y} A${w/2},${h/2} 0 1,1 ${cx-0.001},${y} Z`
    case "diamond":
    case "decision":    return `M${cx},${y} L${ex},${cy} L${cx},${ey} L${x},${cy} Z`
    case "triangle":    return `M${cx},${y} L${ex},${ey} L${x},${ey} Z`
    case "parallelogram": { const o=w*0.2; return `M${x+o},${y} L${ex},${y} L${ex-o},${ey} L${x},${ey} Z` }
    case "star": { const oR=Math.min(w,h)/2,iR=oR*0.4,pts=[]; for(let i=0;i<10;i++){const r=i%2===0?oR:iR,a=(i*Math.PI/5)-Math.PI/2;pts.push(`${i===0?"M":"L"}${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`)} return pts.join(" ")+"Z" }
    case "hexagon": { const r=Math.min(w,h)/2,pts=[]; for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;pts.push(`${i===0?"M":"L"}${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`)} return pts.join(" ")+"Z" }
    case "terminator": { const rt=Math.min(h/2,w/3); return `M${x+rt},${y} L${ex-rt},${y} Q${ex},${y} ${ex},${cy} Q${ex},${ey} ${ex-rt},${ey} L${x+rt},${ey} Q${x},${ey} ${x},${cy} Q${x},${y} ${x+rt},${y} Z` }
    case "arrowBlock": { const hW=w*0.35,tY=y+h*0.28,bY=ey-h*0.28; return `M${x},${tY} L${ex-hW},${tY} L${ex-hW},${y} L${ex},${cy} L${ex-hW},${ey} L${ex-hW},${bY} L${x},${bY} Z` }
    case "calloutRect": { const tH=h*0.72; return `M${x},${y} L${ex},${y} L${ex},${y+tH} L${x+w*0.45},${y+tH} L${x+w*0.35},${ey} L${x+w*0.25},${y+tH} L${x},${y+tH} Z` }
    case "calloutOval": { const ry=h*0.38; return `M${cx},${y} A${w/2},${ry} 0 1,1 ${cx-0.001},${y} Z M${cx-w*0.1},${y+ry*1.7} L${cx-w*0.2},${ey} L${cx+w*0.1},${y+ry*1.7}` }
    case "cylinder": { const ry2=h*0.15; return `M${x},${y+ry2} A${w/2},${ry2} 0 1,1 ${ex},${y+ry2} L${ex},${ey-ry2} A${w/2},${ry2} 0 1,1 ${x},${ey-ry2} Z M${cx},${y} A${w/2},${ry2} 0 1,0 ${cx-0.001},${y} Z` }
    case "cloud": { const r1=h*0.26,r2=w*0.17,r3=w*0.2; return `M${x+w*0.22},${ey} A${r1},${r1} 0 0,1 ${x+w*0.04},${y+h*0.68} A${r2},${r2} 0 0,1 ${x+w*0.2},${y+h*0.38} A${r3},${r3} 0 0,1 ${cx},${y+h*0.18} A${r3},${r3} 0 0,1 ${x+w*0.8},${y+h*0.38} A${r2},${r2} 0 0,1 ${x+w*0.96},${y+h*0.68} A${r1},${r1} 0 0,1 ${x+w*0.78},${ey} Z` }
    default: return `M${x},${y} L${ex},${y} L${ex},${ey} L${x},${ey} Z`
  }
}

// ── Single interactive shape ──────────────────────────────────────────────────
// Behaviour:
//   • First click-drag = draw (size grows while mouse held, no selection chrome shown)
//   • After mouseup    = auto-selected, chrome appears
//   • Click again      = select + can immediately drag to move
//   • Corner handles   = proportional resize (Shift locks aspect)
//   • Side handles     = stretch one axis independently
//   • ✕ button        = delete
function _ShapeItem({ shape, isSelected, isBeingDrawn, onSelect, onDelete, onChange, onMoveAll }) {
  const { x, y, w, h, color, thickness, type } = shape
  const sw  = thickness || 2
  // Normalise top-left for rendering
  const x1  = w >= 0 ? x : x + w
  const y1  = h >= 0 ? y : y + h
  const aw  = Math.abs(w)
  const ah  = Math.abs(h)
  const path = _shapePath(type, x1, y1, aw, ah)

  // ── 4 corner handles only — premium Figma-style ──────────────────
  const corners = [
    { id:"nw", hx:x1,    hy:y1    },
    { id:"ne", hx:x1+aw, hy:y1    },
    { id:"se", hx:x1+aw, hy:y1+ah },
    { id:"sw", hx:x1,    hy:y1+ah },
  ]
  const cornerCursors = { nw:"nw-resize", ne:"ne-resize", se:"se-resize", sw:"sw-resize" }

  // Resize from a corner handle — Shift locks aspect ratio
  function startCornerResize(e, corner) {
    e.preventDefault(); e.stopPropagation()
    const mx0=e.clientX, my0=e.clientY
    const ox=shape.x, oy=shape.y, ow=shape.w, oh=shape.h
    const asp = ow / oh
    function move(ev) {
      const dx=ev.clientX-mx0, dy=ev.clientY-my0
      let nx=ox,ny=oy,nw=ow,nh=oh
      if (corner==="se") { nw=Math.max(10,ow+dx); nh=ev.shiftKey?nw/asp:Math.max(10,oh+dy) }
      else if (corner==="sw") { nw=Math.max(10,ow-dx); nx=ox+ow-nw; nh=ev.shiftKey?nw/asp:Math.max(10,oh+dy) }
      else if (corner==="ne") { nw=Math.max(10,ow+dx); nh=ev.shiftKey?nw/asp:Math.max(10,oh-dy); ny=oy+oh-nh }
      else if (corner==="nw") { nw=Math.max(10,ow-dx); nx=ox+ow-nw; nh=ev.shiftKey?nw/asp:Math.max(10,oh-dy); ny=oy+oh-nh }
      // Clamp to viewBox
      nx=Math.max(0,nx); ny=Math.max(0,ny)
      nw=Math.min(nw, 600-nx); nh=Math.min(nh, 220-ny)
      onChange({ x:nx, y:ny, w:nw, h:nh })
    }
    function up() { window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up) }
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up)
  }

  // Move all selected shapes together
  function startMove(e) {
    e.preventDefault(); e.stopPropagation()
    const mx0=e.clientX, my0=e.clientY
    onMoveAll("start")
    function move(ev) { onMoveAll("move", ev.clientX - mx0, ev.clientY - my0) }
    function up() { window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up) }
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up)
  }

  return (
    <g>
      {/* Wide invisible hit-area so clicking/dragging the shape is easy */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(24, sw + 16)}
        style={{ cursor: isSelected ? "move" : "pointer", pointerEvents: "all" }}
        onMouseDown={e => {
          e.stopPropagation()
          if (!isSelected) { onSelect(e); return }
          startMove(e)
        }}
      />
      {/* Visible shape */}
      <path
        d={path}
        fill="none"
        stroke={color || "#1e293b"}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: "none" }}
      />

      {/* Selection chrome — only visible after drawing is complete */}
      {isSelected && !isBeingDrawn && (
        <>
          {/* Dashed bounding box */}
          <rect
            x={x1-5} y={y1-5} width={aw+10} height={ah+10}
            fill="none"
            stroke="#7c3aed"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            rx={3}
            style={{ pointerEvents:"none" }}
          />

          {/* 4 corner handles — premium Figma-style: white circle with purple ring */}
          {corners.map(h => (
            <g key={h.id} style={{ cursor: cornerCursors[h.id], pointerEvents: "all" }}
               onMouseDown={e => { e.stopPropagation(); startCornerResize(e, h.id) }}>
              {/* Invisible larger hit area */}
              <circle cx={h.hx} cy={h.hy} r={10} fill="transparent"/>
              {/* Outer ring */}
              <circle cx={h.hx} cy={h.hy} r={6}
                fill="white" stroke="#7c3aed" strokeWidth={2}
                style={{ filter:"drop-shadow(0 1px 4px rgba(124,58,237,0.35))" }}/>
              {/* Inner dot */}
              <circle cx={h.hx} cy={h.hy} r={2.5} fill="#7c3aed"/>
            </g>
          ))}

          {/* ✕ delete button — premium top-right */}
          <g
            transform={`translate(${x1+aw+10},${y1-10})`}
            style={{ cursor:"pointer", pointerEvents: "all" }}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={e => { e.stopPropagation(); onDelete() }}
          >
            <circle r={10} fill="#1e293b" stroke="white" strokeWidth={2}
              style={{ filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}/>
            <line x1={-4} y1={-4} x2={4} y2={4} stroke="white" strokeWidth={2} strokeLinecap="round"/>
            <line x1={4} y1={-4} x2={-4} y2={4} stroke="white" strokeWidth={2} strokeLinecap="round"/>
          </g>
        </>
      )}
    </g>
  )
}

// ── ShapeLayer — SVG overlay that manages all interactive shapes ──────────────
// Lives inside DrawingCanvas, layered above the bitmap canvas.
// Handles: draw (first interaction), select, multi-select (Shift+click),
//          selection-box drag, move, corner-resize, side-resize, delete.
function ShapeLayer({ tool, color, thickness, shapes, onShapesChange, onSelectTexts, texts, onSelectedChange, onMoveTexts }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [drawingId,   setDrawingId]   = useState(null)   // shape being drawn rn
  const [selBox,      setSelBox]      = useState(null)   // {sx,sy,x,y,w,h}
  const svgRef         = useRef(null)
  const drawState      = useRef(null) // { id, sx, sy } while mouse held during draw
  const dragOriginsRef = useRef({})

  function handleMoveAll(action, dx, dy) {
    if (action === "start") {
      const origins = {}
      shapes.forEach(s => { if (selectedIds.has(s.id)) origins[s.id] = { x: s.x, y: s.y } })
      dragOriginsRef.current = origins
      // Also snapshot text origins
      onMoveTexts?.("start")
      return
    }
    const origins = dragOriginsRef.current
    onShapesChange(prev => prev.map(s => {
      if (!selectedIds.has(s.id) || !origins[s.id]) return s
      return {
        ...s,
        x: Math.max(0, Math.min(origins[s.id].x + dx, 600 - Math.abs(s.w))),
        y: Math.max(0, Math.min(origins[s.id].y + dy, 220 - Math.abs(s.h))),
      }
    }))
    // Move selected texts by same pixel delta (SVG dx/dy converted via scale)
    const svg = svgRef.current
    if (svg && onMoveTexts) {
      const r = svg.getBoundingClientRect()
      const pxDx = dx * (r.width  / 600)
      const pxDy = dy * (r.height / 220)
      onMoveTexts("move", pxDx, pxDy)
    }
  }

  const isShapeTool = SHAPE_TOOLS.includes(tool)

  // Click outside → deselect all
  useEffect(() => {
    function onDown(e) {
      if (svgRef.current && !svgRef.current.contains(e.target)) setSelectedIds(new Set())
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  // Keyboard: Delete removes selected, Escape deselects, arrows nudge
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { setSelectedIds(new Set()); return }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        const ae = document.activeElement
        if (!ae?.isContentEditable && ae?.tagName !== "INPUT" && ae?.tagName !== "TEXTAREA") {
          e.preventDefault()
          onShapesChange(prev => prev.filter(s => !selectedIds.has(s.id)))
          setSelectedIds(new Set())
        }
      }
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key) && selectedIds.size > 0) {
        const ae = document.activeElement
        if (!ae?.isContentEditable && ae?.tagName !== "INPUT" && ae?.tagName !== "TEXTAREA") {
          e.preventDefault()
          const d = e.shiftKey ? 10 : 1
          const dx = e.key==="ArrowLeft"?-d:e.key==="ArrowRight"?d:0
          const dy = e.key==="ArrowUp"?-d:e.key==="ArrowDown"?d:0
          onShapesChange(prev => prev.map(s =>
            selectedIds.has(s.id) ? { ...s, x:s.x+dx, y:s.y+dy } : s
          ))
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [selectedIds]) // eslint-disable-line react-hooks/exhaustive-deps

  // Convert a MouseEvent to SVG coordinate space (600×220 viewBox)
  // Notify parent of selection changes for copy/paste
  useEffect(() => {
    onSelectedChange?.(selectedIds)
  }, [selectedIds]) // eslint-disable-line react-hooks/exhaustive-deps

  function toSVG(e) {
    const svg = svgRef.current
    if (!svg) return { x:0, y:0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (600 / rect.width),
      y: (e.clientY - rect.top)  * (220 / rect.height),
    }
  }

  // ── Mousedown on blank SVG area ────────────────────────────────────────────
  function handleSVGMouseDown(e) {
    if (isShapeTool) {
      // Draw a new shape
      e.preventDefault(); e.stopPropagation()
      const { x, y } = toSVG(e)
      const id = _newSid()
      onShapesChange(prev => [
        ...prev,
        { id, type:tool, x, y, w:1, h:1, color:color||"#1e293b", thickness:thickness||2 }
      ])
      setSelectedIds(new Set())  // no selection while drawing
      setDrawingId(id)
      drawState.current = { id, sx:x, sy:y }

      function move(ev) {
        if (!drawState.current) return
        const { x:ex, y:ey } = toSVG(ev)
        const { id:did, sx, sy } = drawState.current
        // Clamp end point to viewBox so shape can't extend outside note card
        const cex = Math.max(0, Math.min(ex, 600))
        const cey = Math.max(0, Math.min(ey, 220))
        onShapesChange(prev => prev.map(s =>
          s.id === did ? { ...s, w:cex-sx, h:cey-sy } : s
        ))
      }
      function up() {
        if (!drawState.current) return
        const fid = drawState.current.id
        drawState.current = null
        setDrawingId(null)
        // Enforce minimum shape size — if user just clicked without dragging,
        // give it a default 80x60 size so it's never an invisible dot
        onShapesChange(prev => prev.map(s => {
          if (s.id !== fid) return s
          const minW = Math.abs(s.w) < 20 ? 80 : s.w
          const minH = Math.abs(s.h) < 20 ? 60 : s.h
          return { ...s, w: minW, h: minH }
        }))
        setSelectedIds(new Set([fid]))  // auto-select on release
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
      return
    }

    if (tool === null || tool === "select") {
      // Start selection box
      e.preventDefault()
      const { x, y } = toSVG(e)
      setSelectedIds(new Set())
      onSelectTexts?.(new Set())
      setSelBox({ sx:x, sy:y, x, y, w:0, h:0 })

      function move(ev) {
        const { x:ex, y:ey } = toSVG(ev)
        const bx = Math.min(x, ex), by = Math.min(y, ey)
        const bw = Math.abs(ex-x), bh = Math.abs(ey-y)
        setSelBox({ sx:x, sy:y, x:bx, y:by, w:bw, h:bh })

        // Convert SVG box (600x220) to layer-relative pixel box for text hit-testing
        const svg = svgRef.current
        let pxBx=bx, pxBy=by, pxBw=bw, pxBh=bh
        if (svg) {
          const r = svg.getBoundingClientRect()
          const sx2px = r.width / 600, sy2px = r.height / 220
          pxBx = bx * sx2px; pxBy = by * sy2px
          pxBw = bw * sx2px; pxBh = bh * sy2px
        }

        // Select shapes that INTERSECT the box (touch any border)
        const shapeIds = new Set()
        onShapesChange(prev => {
          prev.forEach(s => {
            const x1=Math.min(s.x,s.x+s.w), y1=Math.min(s.y,s.y+s.h)
            const x2=x1+Math.abs(s.w),       y2=y1+Math.abs(s.h)
            // intersects = NOT (completely outside on any side)
            if (x2>bx && x1<bx+bw && y2>by && y1<by+bh) shapeIds.add(s.id)
          })
          setSelectedIds(shapeIds)
          return prev
        })

        // Select text boxes that INTERSECT the box (pixel space)
        if (onSelectTexts && texts) {
          const textIds = new Set()
          texts.forEach(t => {
            const tw = t.width || 100, th = (t.fontSize || 16) + 8
            const tx2 = t.x + tw, ty2 = t.y + th
            if (tx2>pxBx && t.x<pxBx+pxBw && ty2>pxBy && t.y<pxBy+pxBh) {
              textIds.add(String(t.id))
            }
          })
          onSelectTexts(textIds)
        }
      }
      function up() {
        setSelBox(null)
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 220"
      preserveAspectRatio="none"
      style={{
        position:   "absolute",
        inset:      0,
        width:      "100%",
        height:     "100%",
        overflow:   "visible",
        zIndex:     isShapeTool ? 10 : 2,
        pointerEvents: "none",
        cursor:     isShapeTool ? "crosshair" : "default",
      }}
      onClick={e => { if (e.target === svgRef.current && !isShapeTool) setSelectedIds(new Set()) }}
    >
      {/* Background — only captures clicks when shape tool active, otherwise passes through to text layer */}
      <rect
        x="0" y="0" width="600" height="220"
        fill="transparent"
        style={{ pointerEvents: (isShapeTool || tool === null) ? "all" : "none" }}
        onMouseDown={handleSVGMouseDown}
      />

      {/* Selection box drag rectangle */}
      {selBox && (
        <rect
          x={selBox.x} y={selBox.y} width={selBox.w} height={selBox.h}
          fill="rgba(26,115,232,0.08)"
          stroke="#7c3aed"
          strokeWidth={1}
          strokeDasharray="4 3"
          style={{ pointerEvents:"none" }}
        />
      )}

      {(shapes || []).map(shape => (
        <_ShapeItem
          key={shape.id}
          shape={shape}
          isSelected={selectedIds.has(shape.id)}
          isBeingDrawn={drawingId === shape.id}
          onSelect={e => {
            if (e?.shiftKey) {
              setSelectedIds(prev => { const n=new Set(prev); n.has(shape.id)?n.delete(shape.id):n.add(shape.id); return n })
            } else {
              setSelectedIds(new Set([shape.id]))
            }
          }}
          onDelete={() => {
            onShapesChange(prev => prev.filter(s => s.id !== shape.id))
            setSelectedIds(prev => { const n=new Set(prev); n.delete(shape.id); return n })
          }}
          onChange={patch => onShapesChange(prev =>
            prev.map(s => s.id === shape.id ? { ...s, ...patch } : s)
          )}
          onMoveAll={handleMoveAll}
        />
      ))}
    </svg>
  )
}

// ── Canvas overlay for drawing on top of a note card ─────────────────────────
const MAX_HISTORY = 40

// ── CanvasTextLayer — exact Canva text tool ─────────────────────────────────
function newTid() { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}` }
const PLACEHOLDER = "Type something"

// Each TextBox is its own component so the contentEditable node
// NEVER unmounts between selected/editing/idle state changes.
// Content is synced via ref only on first mount — never via dangerouslySetInnerHTML.
// ── ColorPicker — swatch button + popover color table ────────────────────────
function ColorPicker({ color, colors, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative" onMouseDown={e => e.stopPropagation()}>
      {/* Current color swatch button */}
      <button
        onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
        onClick={e => { e.stopPropagation(); setOpen(p => !p) }}
        className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-secondary transition"
        title="Text color"
      >
        <div className="w-3.5 h-3.5 rounded-sm border border-border/60 flex-shrink-0" style={{ backgroundColor: color }}/>
        <span style={{ fontSize: 8 }} className="text-muted-foreground/60">▾</span>
      </button>

      {/* Color table popover */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-border/60 rounded-xl shadow-xl p-2"
          style={{ width: 120 }}
          onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
        >
          <div className="grid grid-cols-5 gap-1">
            {colors.map(c => (
              <button
                key={c}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
                onClick={e => { e.stopPropagation(); onChange(c); setOpen(false) }}
                className="w-5 h-5 rounded-md border-2 transition hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === color ? "#7c3aed" : "transparent",
                  boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e2e8f0" : "none",
                }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TextBox({ el, isSel, isEdit, onSelect, onEnterEdit, onUpdate, onDelete, onDragStart }) {
  const nodeRef     = useRef(null)
  const didMount    = useRef(false)

  // Sync HTML into DOM once on mount (never use dangerouslySetInnerHTML on a contentEditable)
  useEffect(() => {
    if (didMount.current) return
    didMount.current = true
    if (nodeRef.current && el.html) nodeRef.current.innerHTML = el.html
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus when entering edit mode — place cursor at end, no select-all
  useEffect(() => {
    if (!isEdit || !nodeRef.current) return
    const node = nodeRef.current
    node.focus()
    // Place cursor at end of content
    const s = window.getSelection()
    if (s) {
      const r = document.createRange()
      r.selectNodeContents(node)
      r.collapse(false) // collapse to end
      s.removeAllRanges()
      s.addRange(r)
    }
  }, [isEdit])

  const COLORS = ["#1e293b","#ef4444","#f97316","#eab308","#16a34a","#2563eb","#7c3aed","#ec4899"]
  const SIZES  = [12, 14, 16, 20, 24, 32]
  const showCtrl = isSel || isEdit

  // Single mousedown = select + start drag immediately (no double-click needed)
  function handleBodyMouseDown(e) {
    e.stopPropagation()
    if (isEdit) return  // text editing mode — let browser handle it
    onSelect()          // select (idempotent if already selected)
    onDragStart(e)      // always start drag tracking from this press
  }

  return (
    <div
      style={{
        position: "absolute",
        left:     el.x,
        top:      el.y,
        width:    el.width,           // hard width, not minWidth
        zIndex:   showCtrl ? 20 : 10, // selected boxes float above others
        pointerEvents: "all",  // always interactive even when parent has none
      }}
    >
      {/* ── Controls bar ── */}
      <div
        style={{
          position:    "absolute",
          bottom:      "calc(100% + 6px)",
          left:        0,
          zIndex:      30,
          whiteSpace:  "nowrap",
          opacity:     showCtrl ? 1 : 0,
          pointerEvents: showCtrl ? "auto" : "none",
          transition:  "opacity 0.12s",
          backdropFilter: "blur(8px)",
        }}
        className="flex items-center gap-1 bg-white/95 border border-border/70 rounded-xl shadow-lg px-2 py-1"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
      >
        {/* Drag grip */}
        <div
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-secondary"
          onMouseDown={e => { e.stopPropagation(); onDragStart(e) }}
        >
          <GripVertical size={12} className="text-muted-foreground/60"/>
        </div>
        <div className="w-px h-3 bg-border/50"/>

        {/* Size — compact select */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <select
            value={el.fontSize}
            onChange={e => { e.stopPropagation(); onUpdate({ fontSize: Number(e.target.value) }) }}
            className="text-[10px] font-mono border border-border/50 rounded px-1 py-0.5 bg-white focus:outline-none cursor-pointer"
            style={{ fontSize: 10 }}
          >
            {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
        </div>

        <div className="w-px h-3 bg-border/50"/>

        {/* Color — swatch button that toggles a color table popover */}
        <ColorPicker color={el.color} colors={COLORS} onChange={c => onUpdate({ color: c })} />

        <div className="w-px h-3 bg-border/50"/>

        {/* Delete */}
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-0.5 rounded text-red-400 hover:text-red-500 hover:bg-red-50 transition"
        ><Trash2 size={10}/></button>
      </div>

      {/* ── Text body ── */}
      <div
        ref={nodeRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={onEnterEdit}
        onBlur={e => onUpdate({ html: e.currentTarget.innerHTML })}
        onInput={e => onUpdate({ html: e.currentTarget.innerHTML })}
        onKeyDown={e => { if (e.key === "Escape") e.currentTarget.blur(); e.stopPropagation() }}
        onMouseDown={handleBodyMouseDown}
        onDoubleClick={e => { e.stopPropagation(); onEnterEdit() }}
        className="outline-none break-words leading-snug w-full"
        style={{
          fontSize:     el.fontSize,
          color:        el.color,
          fontFamily:   "sans-serif",
          padding:      "4px 8px",
          minHeight:    el.fontSize + 14,
          wordBreak:    "break-word",
          whiteSpace:   "pre-wrap",
          cursor:       isEdit ? "text" : isSel ? "move" : "default",
          border:       isEdit ? "1.5px dashed #7c3aed"
                      : isSel  ? "1.5px solid #c4b5fd"
                      :          "1.5px dashed transparent",
          borderRadius: 6,
          background:   isEdit ? "rgba(255,255,255,0.92)"
                      : isSel  ? "rgba(237,233,254,0.25)"
                      :          "transparent",
          boxShadow:    isEdit ? "0 2px 12px rgba(124,58,237,0.15)" : "none",
          userSelect:   isEdit ? "text" : "none",
        }}
      />

      {/* ── Resize handle (right edge + bottom-right corner) ── */}
      {isSel && (
        <>
          {/* Bottom-right corner */}
          <div
            style={{
              position: "absolute", right: -6, bottom: -6,
              width: 14, height: 14, zIndex: 25,
              background: "white", border: "2px solid #7c3aed",
              borderRadius: "50%", cursor: "se-resize",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
            onMouseDown={e => {
              e.stopPropagation(); e.preventDefault()
              const x0 = e.clientX, w0 = el.width
              function move(ev) { onUpdate({ width: Math.max(60, w0 + ev.clientX - x0) }) }
              function up() { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
              window.addEventListener("mousemove", move); window.addEventListener("mouseup", up)
            }}
          />
          {/* Right edge drag (also resizes width) */}
          <div
            style={{
              position: "absolute", right: -4, top: "20%", bottom: "20%",
              width: 8, cursor: "ew-resize", zIndex: 24,
            }}
            onMouseDown={e => {
              e.stopPropagation(); e.preventDefault()
              const x0 = e.clientX, w0 = el.width
              function move(ev) { onUpdate({ width: Math.max(60, w0 + ev.clientX - x0) }) }
              function up() { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
              window.addEventListener("mousemove", move); window.addEventListener("mouseup", up)
            }}
          />
        </>
      )}
    </div>
  )
}

function CanvasTextLayer({ tool, setTool, color, fontSize, texts, onTextsChange, externalSelectedIds, onExternalSelectClear, onMoveShapes }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [editingId,   setEditingId]   = useState(null)
  const layerRef = useRef(null)

  // Expose selected ids upward for copy/paste
  const selectedIdsRef = useRef(new Set())
  selectedIdsRef.current = selectedIds

  // Sync external multi-selection from drag-select
  useEffect(() => {
    if (externalSelectedIds && externalSelectedIds.size > 0) {
      setSelectedIds(externalSelectedIds)
      setEditingId(null)
    }
  }, [externalSelectedIds])

  // Click outside the layer → deselect all text boxes
  useEffect(() => {
    function onDown(e) {
      if (!layerRef.current) return
      // If click is outside the drawing area entirely, deselect
      if (!layerRef.current.contains(e.target)) {
        setSelectedIds(new Set())
        setEditingId(null)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  // Escape = deselect, Delete = delete selected box
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        document.activeElement?.blur?.()
        setSelectedIds(new Set()); setEditingId(null)
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0 && !editingId) {
        const ae = document.activeElement
        if (!ae?.isContentEditable && ae?.tagName !== "INPUT" && ae?.tagName !== "TEXTAREA") {
          e.preventDefault()
          selectedIds.forEach(id => del(id))
          setSelectedIds(new Set())
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [selectedIds, editingId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Click outside → deselect ───────────────────────────────────────────────
  useEffect(() => {
    function onDown(e) {
      if (layerRef.current && !layerRef.current.contains(e.target)) {
        setSelectedIds(new Set()); setEditingId(null)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  function upd(id, patch) {
    onTextsChange(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }
  function del(id) {
    onTextsChange(prev => prev.filter(t => t.id !== id))
    setSelectedIds(new Set()); setEditingId(null)
  }

  // ── Place new text box ─────────────────────────────────────────────────────
  function handleLayerClick(e) {
    if (tool !== "text") return
    if (e.target !== layerRef.current) return
    const rect = layerRef.current.getBoundingClientRect()
    const id = newTid()
    onTextsChange(prev => [...prev, {
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      html:     PLACEHOLDER,
      fontSize: fontSize || 16,
      color:    color || "#1e293b",
      width:    200,
    }])
    setTool(null)                        // T deactivates immediately
    setSelectedIds(new Set([id])); setEditingId(id)  // enter edit right away
    // selectAll happens inside TextBox's useEffect when isEdit becomes true
  }

  // ── Deselect on empty-area click ───────────────────────────────────────────
  function handleLayerMouseDown(e) {
    if (e.target === layerRef.current) { setSelectedIds(new Set()); setEditingId(null); onExternalSelectClear?.() }
  }

  // ── Drag — moves ALL selected texts + selected shapes together ─────────────
  function startDrag(e, el) {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const x0 = e.clientX, y0 = e.clientY

    // Snapshot origins of ALL selected texts at drag start
    const textOrigins = {}
    texts.forEach(t => {
      if (selectedIds.has(String(t.id))) textOrigins[String(t.id)] = { x: t.x, y: t.y }
    })
    // If the dragged text is not in selection, add it alone
    if (Object.keys(textOrigins).length === 0) textOrigins[String(el.id)] = { x: el.x, y: el.y }

    // Snapshot shapes too
    onMoveShapes?.("start")

    function getBounds() {
      if (!layerRef.current) return { w: 9999, h: 9999 }
      const r = layerRef.current.getBoundingClientRect()
      return { w: r.width, h: r.height }
    }

    let dragged = false
    function move(ev) {
      const dx = ev.clientX - x0, dy = ev.clientY - y0
      if (!dragged && Math.sqrt(dx*dx + dy*dy) < 4) return
      dragged = true
      const { w, h } = getBounds()
      // Move all selected texts
      onTextsChange(prev => prev.map(t => {
        const tid = String(t.id)
        if (!textOrigins[tid]) return t
        return {
          ...t,
          x: Math.max(0, Math.min(textOrigins[tid].x + dx, w - (t.width || 100))),
          y: Math.max(0, Math.min(textOrigins[tid].y + dy, h - (t.fontSize || 16) - 8)),
        }
      }))
      // Move selected shapes with pixel→SVG conversion
      onMoveShapes?.("move", dx, dy)
    }
    function up() {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }

  // When a shape tool is active the whole div must be transparent so clicks
  // reach the SVG ShapeLayer below. Individual TextBox nodes keep pointer-events:all.
  const SHAPE_TOOL_IDS = ["line","arrow","arrowLeft","arrowDouble","arrowUp","arrowDiag",
    "rect","roundedRect","circle","diamond","triangle","parallelogram",
    "process","decision","terminator","cylinder","arrowBlock",
    "calloutRect","calloutOval","star","hexagon","cloud"]
  const isShapeTool = SHAPE_TOOL_IDS.includes(tool)
  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ pointerEvents: tool === "text" ? "auto" : "none", cursor: tool === "text" ? "crosshair" : "default", position: "absolute", inset: 0, zIndex: tool === "text" ? 10 : 3 }}
      onClick={handleLayerClick}
      onMouseDown={handleLayerMouseDown}
    >
      {(texts || []).map((el, idx) => (
        <TextBox
          key={`tb-${String(el.id)}-${idx}`}
          el={el}
          isSel={selectedIds.has(String(el.id))}
          isEdit={editingId === el.id}
          onSelect={()      => { setSelectedIds(new Set([String(el.id)])); setEditingId(null); onExternalSelectClear?.() }}
          onEnterEdit={()   => { setSelectedIds(new Set([String(el.id)])); setEditingId(el.id) }}
          onUpdate={patch   => upd(el.id, patch)}
          onDelete={()      => del(el.id)}
          onDragStart={e    => startDrag(e, el)}
        />
      ))}
    </div>
  )
}


function DrawingCanvas({ tool, setTool, color, thickness, fontSize, canvasData, canvasTexts, canvasShapes, onSave, onTextsChange, onShapesChange, onHistoryChange, registerUndo, registerRedo, visible }) {
  const canvasRef         = useRef(null)
  const containerRef      = useRef(null)
  const [selectedTextIds, setSelectedTextIds] = useState(new Set())
  const selectedTextIdsRef   = useRef(new Set())
  selectedTextIdsRef.current = selectedTextIds  // always fresh for keydown closure
  const clipboardRef         = useRef(null)  // { shapes:[], texts:[] }
  const textDragOriginsRef   = useRef({})
  const shapeSelectedIds  = useRef(new Set())
  const [ctxMenu, setCtxMenu] = useState(null) // { x, y } in px relative to container
  const drawing        = useRef(false)
  const startPos       = useRef({ x: 0, y: 0 })
  const snapshotRef    = useRef(null)
  const historyRef     = useRef([])
  const redoRef        = useRef([])

  function notifyHistory() {
    onHistoryChange?.({
      canUndo: historyRef.current.length > 0,
      canRedo: redoRef.current.length > 0,
    })
  }

  function pushHistory() {
    const url = canvasRef.current.toDataURL()
    historyRef.current.push(url)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    redoRef.current = []
    notifyHistory()
  }

  function restoreDataUrl(url) {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d", { willReadFrequently: true })
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

  // ── Context menu actions ───────────────────────────────────────────────────
  function doCopy() {
    const selectedShapes = (canvasShapes || []).filter(s => shapeSelectedIds.current.has(s.id))
    const selectedTexts  = (canvasTexts  || []).filter(t => selectedTextIds.has(String(t.id)))
    if (selectedShapes.length > 0 || selectedTexts.length > 0)
      clipboardRef.current = { shapes: selectedShapes.map(s=>({...s})), texts: selectedTexts.map(t=>({...t})) }
    setCtxMenu(null)
  }
  function doPaste() {
    if (!clipboardRef.current) return
    const OFFSET = 20
    const newShapes = clipboardRef.current.shapes.map(s => ({ ...s, id:`sh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, x:s.x+OFFSET, y:s.y+OFFSET }))
    const newTexts  = clipboardRef.current.texts.map(t  => ({ ...t, id:`txt-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, x:t.x+OFFSET, y:t.y+OFFSET }))
    if (newShapes.length > 0) onShapesChange(prev => [...prev, ...newShapes])
    if (newTexts.length  > 0) onTextsChange(prev  => [...prev, ...newTexts])
    setCtxMenu(null)
  }
  function doDelete() {
    const shapeIds = shapeSelectedIds.current
    const textIds  = selectedTextIds
    if (shapeIds.size > 0) onShapesChange(prev => prev.filter(s => !shapeIds.has(s.id)))
    if (textIds.size  > 0) onTextsChange(prev  => prev.filter(t => !textIds.has(String(t.id))))
    shapeSelectedIds.current = new Set()
    setSelectedTextIds(new Set())
    setCtxMenu(null)
  }
  const hasSelection = shapeSelectedIds.current.size > 0 || selectedTextIds.size > 0

  // ── Copy / Paste (Ctrl+C / Ctrl+V) ────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      const ae = document.activeElement
      if (ae?.isContentEditable || ae?.tagName === "INPUT" || ae?.tagName === "TEXTAREA") return
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        // Copy selected shapes + texts
        const selectedShapes = (canvasShapes || []).filter(s => shapeSelectedIds.current.has(s.id))
        const selectedTexts  = (canvasTexts  || []).filter(t => selectedTextIdsRef.current.has(String(t.id ?? t.id)))
        if (selectedShapes.length > 0 || selectedTexts.length > 0) {
          clipboardRef.current = {
            shapes: selectedShapes.map(s => ({ ...s })),
            texts:  selectedTexts.map(t => ({ ...t })),
          }
          e.preventDefault()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (!clipboardRef.current) return
        e.preventDefault()
        const OFFSET = 20
        const newShapes = clipboardRef.current.shapes.map(s => ({
          ...s, id: `sh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          x: s.x + OFFSET, y: s.y + OFFSET,
        }))
        const newTexts = clipboardRef.current.texts.map(t => ({
          ...t, id: `txt-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          x: t.x + OFFSET, y: t.y + OFFSET,
        }))
        if (newShapes.length > 0) onShapesChange(prev => [...prev, ...newShapes])
        if (newTexts.length  > 0) onTextsChange(prev  => [...prev, ...newTexts])
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }) // runs every render so closures are fresh

  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current || !canvasData || !canvasRef.current) return
    restoredRef.current = true
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true })
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

  function drawShape(ctx, t, sx, sy, ex, ey) {
    ctx.strokeStyle = color
    ctx.lineWidth   = thickness
    ctx.lineCap     = "round"
    ctx.lineJoin    = "round"

    function arrowHead(x1, y1, x2, y2) {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const len   = Math.max(10, thickness * 4)
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - len*Math.cos(angle-0.4), y2 - len*Math.sin(angle-0.4))
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - len*Math.cos(angle+0.4), y2 - len*Math.sin(angle+0.4))
      ctx.stroke()
    }

    const w = ex - sx, h = ey - sy
    ctx.beginPath()

    switch (t) {
      case "line": ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); break
      case "arrow": ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); arrowHead(sx,sy,ex,ey); break
      case "arrowLeft": ctx.moveTo(ex,ey); ctx.lineTo(sx,sy); ctx.stroke(); arrowHead(ex,ey,sx,sy); break
      case "arrowDouble": ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); arrowHead(sx,sy,ex,ey); arrowHead(ex,ey,sx,sy); break
      case "arrowUp": ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); arrowHead(sx,sy,ex,ey); break
      case "arrowDiag": ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); arrowHead(sx,sy,ex,ey); break
      case "rect": ctx.rect(sx,sy,w,h); ctx.stroke(); break
      case "roundedRect": { const r=Math.min(12,Math.abs(w)/4,Math.abs(h)/4); ctx.moveTo(sx+r,sy); ctx.lineTo(sx+w-r,sy); ctx.arcTo(sx+w,sy,sx+w,sy+r,r); ctx.lineTo(sx+w,sy+h-r); ctx.arcTo(sx+w,sy+h,sx+w-r,sy+h,r); ctx.lineTo(sx+r,sy+h); ctx.arcTo(sx,sy+h,sx,sy+h-r,r); ctx.lineTo(sx,sy+r); ctx.arcTo(sx,sy,sx+r,sy,r); ctx.closePath(); ctx.stroke(); break }
      case "circle": { const rx=w/2,ry=h/2; ctx.ellipse(sx+rx,sy+ry,Math.abs(rx),Math.abs(ry),0,0,2*Math.PI); ctx.stroke(); break }
      case "diamond": { const cx=sx+w/2,cy=sy+h/2; ctx.moveTo(cx,sy); ctx.lineTo(sx+w,cy); ctx.lineTo(cx,sy+h); ctx.lineTo(sx,cy); ctx.closePath(); ctx.stroke(); break }
      case "triangle": { ctx.moveTo(sx+w/2,sy); ctx.lineTo(sx+w,sy+h); ctx.lineTo(sx,sy+h); ctx.closePath(); ctx.stroke(); break }
      case "parallelogram": { const o=Math.abs(w)*0.2; ctx.moveTo(sx+o,sy); ctx.lineTo(sx+w,sy); ctx.lineTo(sx+w-o,sy+h); ctx.lineTo(sx,sy+h); ctx.closePath(); ctx.stroke(); break }
      case "process": ctx.rect(sx,sy,w,h); ctx.stroke(); break
      case "decision": { const cx=sx+w/2,cy=sy+h/2; ctx.moveTo(cx,sy); ctx.lineTo(sx+w,cy); ctx.lineTo(cx,sy+h); ctx.lineTo(sx,cy); ctx.closePath(); ctx.stroke(); break }
      case "terminator": { const r2=Math.abs(h)/2; ctx.moveTo(sx+r2,sy); ctx.arcTo(sx+w,sy,sx+w,sy+h,r2); ctx.arcTo(sx+w,sy+h,sx,sy+h,r2); ctx.arcTo(sx,sy+h,sx,sy,r2); ctx.arcTo(sx,sy,sx+w,sy,r2); ctx.closePath(); ctx.stroke(); break }
      case "cylinder": { const ry2=Math.abs(h)*0.15; ctx.ellipse(sx+w/2,sy+ry2,Math.abs(w/2),ry2,0,0,2*Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx,sy+ry2); ctx.lineTo(sx,sy+h-ry2); ctx.moveTo(sx+w,sy+ry2); ctx.lineTo(sx+w,sy+h-ry2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(sx+w/2,sy+h-ry2,Math.abs(w/2),ry2,0,0,Math.PI); ctx.stroke(); break }
      case "arrowBlock": { const hW=Math.abs(w)*0.35,tY=sy+Math.abs(h)*0.28,bY=sy+h-Math.abs(h)*0.28; ctx.moveTo(sx,tY); ctx.lineTo(sx+w-hW,tY); ctx.lineTo(sx+w-hW,sy); ctx.lineTo(sx+w,sy+h/2); ctx.lineTo(sx+w-hW,sy+h); ctx.lineTo(sx+w-hW,bY); ctx.lineTo(sx,bY); ctx.closePath(); ctx.stroke(); break }
      case "star": { const cx3=sx+w/2,cy3=sy+h/2,oR=Math.min(Math.abs(w),Math.abs(h))/2,iR=oR*0.4; for(let i=0;i<10;i++){const r=i%2===0?oR:iR,a=(i*Math.PI/5)-Math.PI/2; if(i===0)ctx.moveTo(cx3+r*Math.cos(a),cy3+r*Math.sin(a)); else ctx.lineTo(cx3+r*Math.cos(a),cy3+r*Math.sin(a))} ctx.closePath(); ctx.stroke(); break }
      case "hexagon": { const cx4=sx+w/2,cy4=sy+h/2,r4=Math.min(Math.abs(w),Math.abs(h))/2; for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6; if(i===0)ctx.moveTo(cx4+r4*Math.cos(a),cy4+r4*Math.sin(a)); else ctx.lineTo(cx4+r4*Math.cos(a),cy4+r4*Math.sin(a))} ctx.closePath(); ctx.stroke(); break }
      case "calloutRect": { ctx.rect(sx,sy,w,Math.abs(h)*0.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx+w*0.25,sy+Math.abs(h)*0.7); ctx.lineTo(sx+w*0.12,sy+h); ctx.lineTo(sx+w*0.43,sy+Math.abs(h)*0.7); ctx.stroke(); break }
      case "calloutOval": { const ry3=Math.abs(h)*0.35; ctx.ellipse(sx+w/2,sy+ry3,Math.abs(w/2),ry3,0,0,2*Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx+w*0.3,sy+ry3*1.8); ctx.lineTo(sx+w*0.15,sy+h); ctx.lineTo(sx+w*0.5,sy+ry3*1.8); ctx.stroke(); break }
      case "cloud": {
        const aw=Math.abs(w), ah=Math.abs(h)
        const bx=w<0?sx+w:sx, by=h<0?sy+h:sy
        ctx.moveTo(bx+aw*0.25, by+ah)
        ctx.arc(bx+aw*0.12, by+ah*0.72, ah*0.28, Math.PI*0.5, Math.PI*1.5, false)
        ctx.arc(bx+aw*0.35, by+ah*0.35, aw*0.18, Math.PI*1.1, Math.PI*0, false)
        ctx.arc(bx+aw*0.6,  by+ah*0.2,  aw*0.22, Math.PI*1.0, Math.PI*0, false)
        ctx.arc(bx+aw*0.85, by+ah*0.55, aw*0.18, Math.PI*1.5, Math.PI*0.5, false)
        ctx.arc(bx+aw*0.65, by+ah*0.88, ah*0.18, Math.PI*0, Math.PI, false)
        ctx.closePath()
        ctx.stroke()
        break
      }
      default: break
    }
  }

  function onDown(e) {
    if (!tool || tool === "text" || SHAPE_TOOLS.includes(tool)) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d", { willReadFrequently: true })
    const pos    = getPos(e, canvas)
    drawing.current  = true
    startPos.current = pos
    pushHistory()
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    if (tool === "pen" || tool === "eraser") { ctx.beginPath(); ctx.moveTo(pos.x, pos.y) }
  }

  function onMove(e) {
    if (!drawing.current || !tool || tool === "text" || SHAPE_TOOLS.includes(tool)) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d", { willReadFrequently: true })
    const pos    = getPos(e, canvas)

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = thickness * 6; ctx.lineCap = "round"; ctx.lineJoin = "round"
      ctx.lineTo(pos.x, pos.y); ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
    } else if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.lineCap = "round"; ctx.lineJoin = "round"
      ctx.lineTo(pos.x, pos.y); ctx.stroke()
    } else {
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.globalCompositeOperation = "source-over"
      drawShape(ctx, tool, startPos.current.x, startPos.current.y, pos.x, pos.y)
    }
  }

  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    onSave(canvasRef.current.toDataURL())
  }

  const _isShTool = SHAPE_TOOLS.includes(tool)
  const cursor = (tool === "text" || _isShTool) ? "default" : tool === "eraser" ? "cell" : tool ? "crosshair" : "default"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener("touchstart", onDown, { passive: false })
    canvas.addEventListener("touchmove",  onMove, { passive: false })
    canvas.addEventListener("touchend",   onUp,   { passive: false })
    return () => {
      canvas.removeEventListener("touchstart", onDown)
      canvas.removeEventListener("touchmove",  onMove)
      canvas.removeEventListener("touchend",   onUp)
    }
  })

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        borderTop: "1px dashed rgba(0,0,0,0.08)",
        display: visible ? "block" : "none",
      }}
      onContextMenu={e => {
        e.preventDefault()
        const r = containerRef.current.getBoundingClientRect()
        setCtxMenu({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
      onClick={() => ctxMenu && setCtxMenu(null)}
    >
      {/* ── Right-click context menu ── */}
      {ctxMenu && (
        <div
          style={{
            position: "absolute", left: ctxMenu.x, top: ctxMenu.y,
            zIndex: 9999, minWidth: 148,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="bg-white border border-border/60 rounded-xl shadow-2xl py-1 overflow-hidden"
            style={{ backdropFilter: "blur(8px)" }}>
            <button onClick={doCopy} disabled={!hasSelection}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-secondary transition disabled:opacity-30 disabled:cursor-not-allowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span className="font-medium text-foreground">Copy</span>
              <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+C</span>
            </button>
            <button onClick={doPaste} disabled={!clipboardRef.current}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-secondary transition disabled:opacity-30 disabled:cursor-not-allowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              <span className="font-medium text-foreground">Paste</span>
              <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+V</span>
            </button>
            <div className="h-px bg-border/50 my-1"/>
            <button onClick={doDelete} disabled={!hasSelection}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              <span className="font-medium text-red-500">Delete</span>
              <span className="ml-auto text-[10px] text-muted-foreground">Del</span>
            </button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={600} height={220}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        className="w-full block"
        style={{
          cursor,
          touchAction: (tool === "pen" || tool === "eraser") ? "none" : "auto",
          background: "transparent",
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          pointerEvents: (tool === "pen" || tool === "eraser") ? "all" : "none",
          zIndex: (tool === "pen" || tool === "eraser") ? 10 : 1,
        }}
      />
      {/* Spacer div so the container has height matching the canvas */}
      <div style={{ width: "100%", paddingBottom: `${(220/600)*100}%` }}/>
      <CanvasTextLayer
        tool={tool}
        setTool={setTool}
        color={color}
        fontSize={fontSize}
        texts={(canvasTexts || []).map((el, i) => ({
          ...el,
          id: String(el.id ?? `legacy-${i}-${Date.now()}`),
        }))}
        onTextsChange={onTextsChange}
        containerRef={containerRef}
        externalSelectedIds={selectedTextIds}
        onExternalSelectClear={() => setSelectedTextIds(new Set())}
        onMoveShapes={(action, pxDx, pxDy) => {
          if (action === "start") {
            // Snapshot selected shape origins
            const origins = {}
            ;(canvasShapes || []).forEach(s => {
              if (shapeSelectedIds.current.has(s.id)) origins[s.id] = { x: s.x, y: s.y }
            })
            textDragOriginsRef.current = origins
            return
          }
          if (Object.keys(textDragOriginsRef.current).length === 0) return
          // Convert pixel delta to SVG viewBox units
          const container = containerRef.current
          if (!container) return
          const r = container.getBoundingClientRect()
          const svgDx = pxDx * (600 / r.width)
          const svgDy = pxDy * (220 / r.height)
          const origins = textDragOriginsRef.current
          onShapesChange(prev => prev.map(s => {
            if (!origins[s.id]) return s
            return {
              ...s,
              x: Math.max(0, Math.min(origins[s.id].x + svgDx, 600 - Math.abs(s.w))),
              y: Math.max(0, Math.min(origins[s.id].y + svgDy, 220 - Math.abs(s.h))),
            }
          }))
        }}
      />
      <ShapeLayer
        tool={tool}
        color={color}
        thickness={thickness}
        shapes={canvasShapes || []}
        onShapesChange={onShapesChange}
        texts={(canvasTexts || []).map((el, i) => ({ ...el, id: String(el.id ?? `legacy-${i}`) }))}
        onSelectTexts={ids => setSelectedTextIds(ids)}
        onSelectedChange={ids => { shapeSelectedIds.current = ids }}
        onMoveTexts={(action, pxDx, pxDy) => {
          if (action === "start") {
            // Snapshot text origins in a ref accessible here
            const origins = {}
            ;(canvasTexts || []).forEach(t => {
              if (selectedTextIds.has(String(t.id))) origins[String(t.id)] = { x: t.x, y: t.y }
            })
            textDragOriginsRef.current = origins
            return
          }
          const origins = textDragOriginsRef.current
          onTextsChange(prev => prev.map(t => {
            const tid = String(t.id)
            if (!selectedTextIds.has(tid) || !origins[tid]) return t
            return {
              ...t,
              x: Math.max(0, origins[tid].x + pxDx),
              y: Math.max(0, origins[tid].y + pxDy),
            }
          }))
        }}
      />
    </div>
  )
}

// ── Single Note Card ──────────────────────────────────────────────────────────
function NoteCard({ note, index, onUpdate, onRemove, activeTool, toolColor, toolThickness, gripHandlers, draggingIdx }) {
  const editorRef        = useRef(null)
  const undoRef          = useRef(null)
  const redoRef          = useRef(null)
  const latestShapesRef  = useRef([])  // always holds latest canvasShapes — fixes stale closure in drag
  const [tool,           setTool]           = useState(null)
  const [color,          setColor]          = useState(toolColor  || "#1e293b")
  const [thickness,      setThickness]      = useState(toolThickness || 2)
  const [fontSize,       setFontSize]       = useState(16)
  const [showCardColors, setShowCardColors] = useState(false)
  const [canUndo,        setCanUndo]        = useState(false)
  const [canRedo,        setCanRedo]        = useState(false)
  const [activeMarker,   setActiveMarker]   = useState(null)
  const markerCounterRef = useRef(1)
  const colorBtnRef = useRef(null)

  const drawingTools = ["pen","eraser","line","arrow","arrowLeft","arrowDouble","arrowUp","arrowDiag","rect","roundedRect","circle","diamond","triangle","parallelogram","process","decision","terminator","cylinder","arrowBlock","cloud","calloutRect","calloutOval","star","hexagon"]
  const isDrawing    = drawingTools.includes(tool)
  // Canvas visible when: any draw tool active, text tool active, or saved content exists
  const canvasVisible = isDrawing || tool === "text" || SHAPE_TOOLS.includes(tool) || !!(note.canvasData || (note.canvasTexts && note.canvasTexts.length > 0) || (note.canvasShapes && note.canvasShapes.length > 0))

  useEffect(() => { if (activeTool) setTool(activeTool) }, [activeTool])
  useEffect(() => { if (toolColor) setColor(toolColor) }, [toolColor])

  const syncedIdRef = useRef(null)
  // Keep latestShapesRef in sync with note.canvasShapes
  // This runs every render so the ref is always fresh
  latestShapesRef.current = note.canvasShapes || []

  useEffect(() => {
    if (editorRef.current && syncedIdRef.current !== (note._id ?? index)) {
      syncedIdRef.current = note._id ?? index
      editorRef.current.innerHTML = note.html || ""
    }
  })

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
          <GripVertical size={16} className="text-muted-foreground/40 flex-shrink-0" onPointerDown={e => gripHandlers?.onGripDown(e, index)} onPointerMove={e => gripHandlers?.onGripMove(e)} onPointerUp={e => gripHandlers?.onGripUp(e)} onPointerCancel={e => gripHandlers?.onGripUp(e)} style={{ cursor: draggingIdx === index ? "grabbing" : "grab", touchAction: "none", userSelect: "none", flexShrink: 0, padding: "2px" }} />
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
            className="p-2 rounded hover:bg-red-100 text-muted-foreground/30 hover:text-red-400 transition sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Floating selection bar — appears on text select via portal */}
      <FloatingSelectionBar
        editorRef={editorRef}
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

      {/* Draw mini-bar */}
      <DrawMiniBar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        thickness={thickness} setThickness={setThickness}
        fontSize={fontSize} setFontSize={setFontSize}
        onUndo={() => undoRef.current?.()}
        onRedo={() => redoRef.current?.()}
        canUndo={canUndo} canRedo={canRedo}
      />

      {/* DrawingCanvas is ALWAYS mounted so the canvas bitmap and text elements
          are never lost when switching tools. Hidden via CSS when no tool active. */}
      <DrawingCanvas
        tool={tool}
        setTool={setTool}
        color={color}
        thickness={thickness}
        fontSize={fontSize}
        canvasData={note.canvasData}
        canvasTexts={note.canvasTexts || []}
        canvasShapes={note.canvasShapes || []}
        onSave={data => onUpdate(index, "canvasData", data)}
        onTextsChange={updater => {
          const current = note.canvasTexts || []
          const next = typeof updater === "function" ? updater(current) : updater
          onUpdate(index, "canvasTexts", next)
        }}
        onShapesChange={updater => {
          // Use latestShapesRef to avoid stale closure during shape drag
          const current = latestShapesRef.current
          const next = typeof updater === "function" ? updater(current) : updater
          latestShapesRef.current = next
          onUpdate(index, "canvasShapes", next)
        }}
        onHistoryChange={({ canUndo: u, canRedo: r }) => { setCanUndo(u); setCanRedo(r) }}
        registerUndo={fn => { undoRef.current = fn }}
        registerRedo={fn => { redoRef.current = fn }}
        visible={canvasVisible}
      />
    </div>
  )
}

// ── Vocabulary Card ───────────────────────────────────────────────────────────
function VocabCard({ v, ri, updateVocab, removeVocab, sectionColor, sectionAccent, gripHandlers, draggingIdx }) {
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
    document.execCommand("insertText", false, marker + "\u00A0")
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
        <GripVertical size={14} className="text-muted-foreground/30 mt-2 flex-shrink-0" onPointerDown={e => gripHandlers?.onGripDown(e, ri)} onPointerMove={e => gripHandlers?.onGripMove(e)} onPointerUp={e => gripHandlers?.onGripUp(e)} onPointerCancel={e => gripHandlers?.onGripUp(e)} style={{ cursor: draggingIdx === ri ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }} />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <input
            value={v.word || ""}
            onChange={e => updateVocab(ri, "word", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Word or phrase"
            className="w-full text-sm font-semibold bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
          <input
            value={v.meaning || ""}
            onChange={e => updateVocab(ri, "meaning", e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Meaning / definition"
            className="w-full text-sm bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": sectionColor + "40" }}
          />
        </div>
        <button
          onClick={() => removeVocab(ri)}
          onMouseDown={e => e.stopPropagation()}
          className="p-2 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-50 transition sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 size={14} />
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
function MistakeCard({ m, ri, updateMistake, removeMistake, sectionColor, sectionAccent, gripHandlers, draggingIdx }) {
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
    document.execCommand("insertText", false, marker + "\u00A0")
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
        <GripVertical size={14} className="text-muted-foreground/30 mt-2 flex-shrink-0" onPointerDown={e => gripHandlers?.onGripDown(e, ri)} onPointerMove={e => gripHandlers?.onGripMove(e)} onPointerUp={e => gripHandlers?.onGripUp(e)} onPointerCancel={e => gripHandlers?.onGripUp(e)} style={{ cursor: draggingIdx === ri ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }} />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
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
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 sm:py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 transition text-sm font-medium touch-manipulation"
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
// Pointer-capture drag on GripVertical only — works on desktop + mobile touch.
// Shows a floating ghost card that lifts and follows the finger/cursor.
function DraggableList({ items, onReorder, renderItem, className = "space-y-2" }) {
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [overIdx,     setOverIdx]     = useState(null)
  const [ghost,       setGhost]       = useState(null)  // {top,left,width}
  const containerRef = useRef(null)
  const stateRef     = useRef(null)  // {fromIdx,currentOver,offsetY}

  function getIndexFromY(clientY) {
    if (!containerRef.current) return 0
    const kids = Array.from(containerRef.current.children).filter(k => !k.dataset.ghost)
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect()
      if (clientY < r.top + r.height / 2) return i
    }
    return kids.length - 1
  }

  function onGripDown(e, idx) {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const cardEl   = containerRef.current?.children[idx]
    const rect     = cardEl ? cardEl.getBoundingClientRect() : { top: e.clientY, left: 0, width: 300 }
    const contRect = containerRef.current?.getBoundingClientRect()
    stateRef.current = { fromIdx: idx, currentOver: idx, offsetY: e.clientY - rect.top }
    setDraggingIdx(idx)
    setOverIdx(idx)
    setGhost({ top: e.clientY - (e.clientY - rect.top), left: contRect?.left ?? rect.left, width: contRect?.width ?? rect.width })
  }

  function onGripMove(e) {
    if (!stateRef.current) return
    e.preventDefault()
    const { offsetY } = stateRef.current
    const contRect = containerRef.current?.getBoundingClientRect()
    setGhost(g => ({ ...g, top: e.clientY - offsetY, left: contRect?.left ?? g.left, width: contRect?.width ?? g.width }))
    const to = getIndexFromY(e.clientY)
    if (to !== stateRef.current.currentOver) {
      stateRef.current.currentOver = to
      setOverIdx(to)
    }
  }

  function onGripUp() {
    if (!stateRef.current) return
    const { fromIdx, currentOver } = stateRef.current
    stateRef.current = null
    setDraggingIdx(null)
    setOverIdx(null)
    setGhost(null)
    if (fromIdx !== currentOver) onReorder(fromIdx, currentOver)
  }

  const gripHandlers = { onGripDown, onGripMove, onGripUp }

  return (
    <div ref={containerRef} className={className} style={{ position: "relative" }}>
      {items.map((item, i) => {
        const isDragging = draggingIdx === i
        const isOver     = overIdx === i && draggingIdx !== null && draggingIdx !== i
        return (
          <div
            key={item._id || i}
            style={{
              opacity:      isDragging ? 0 : 1,
              transform:    isOver ? "translateY(6px)" : "none",
              boxShadow:    isOver ? "0 0 0 2px #7c3aed, 0 4px 16px rgba(124,58,237,0.18)" : "none",
              borderRadius: 12,
              transition:   "transform 0.12s, box-shadow 0.12s, opacity 0.06s",
            }}
          >
            {renderItem(item, i, gripHandlers, draggingIdx)}
          </div>
        )
      })}

      {/* Floating ghost follows finger/cursor while dragging */}
      {ghost && draggingIdx !== null && items[draggingIdx] && (
        <div
          data-ghost="1"
          style={{
            position:      "fixed",
            top:           ghost.top,
            left:          ghost.left,
            width:         ghost.width,
            zIndex:        9999,
            pointerEvents: "none",
            transform:     "rotate(1.5deg) scale(1.03)",
            boxShadow:     "0 16px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12)",
            borderRadius:  12,
            opacity:       0.96,
          }}
        >
          {renderItem(items[draggingIdx], draggingIdx, null, null)}
        </div>
      )}
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

  // Recursively unwrap JSON strings until we get a plain object/array or give up
  function deepParse(val) {
    if (typeof val !== "string") return val
    try {
      const parsed = JSON.parse(val)
      // Only keep recursing if we got an object/array (not a primitive)
      if (parsed !== null && typeof parsed === "object") return deepParse(parsed)
      return parsed
    } catch {
      return val
    }
  }

  // Return true if a string looks like it contains JSON data rather than user text
  function looksLikeJSON(s) {
    if (typeof s !== "string") return false
    const t = s.trim()
    return (t.startsWith("{") || t.startsWith("[")) && (t.endsWith("}") || t.endsWith("]"))
  }

  // Scrub a note item — if its html field is corrupted JSON, clear it
  function scrubNote(n) {
    if (!n || typeof n !== "object") return null
    const html = n.html || ""
    if (looksLikeJSON(html)) return { ...n, html: "" }
    return n
  }

  function normalizeSectioned(raw, empty) {
    const val = deepParse(raw)
    if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(empty).some(k => k in val)) {
      return { ...empty, ...Object.fromEntries(Object.keys(empty).map(k => [k, Array.isArray(val[k]) ? val[k] : []])) }
    }
    const arr = Array.isArray(val) ? val : []
    return { ...empty, general: arr }
  }

  function normalizeNotes(raw) {
    const val = deepParse(raw)
    if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(EMPTY_NOTES).some(k => k in val)) {
      return {
        ...EMPTY_NOTES,
        ...Object.fromEntries(NOTE_SECTIONS.map(s => [
          s.id,
          Array.isArray(val[s.id]) ? val[s.id].map(scrubNote).filter(Boolean) : []
        ]))
      }
    }
    // Legacy flat array
    const arr = Array.isArray(val) ? val.map(scrubNote).filter(Boolean) : []
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
        const normalized = {
          vocabulary: normalizeSectioned(cached.vocabulary, EMPTY_VOCAB),
          mistakes:   normalizeSectioned(cached.mistakes,   EMPTY_MISTAKES),
          notes:      normalizeNotes(cached.notes),
        }
        setData(normalized)
        loaded.current = true
        setLoading(false)
      }
    } catch {
      // Corrupted cache — wipe it so we fall through to Supabase
      try { localStorage.removeItem("ielts-notebook") } catch {}
    }

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
    const item = { _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...template }
    setData(d => ({ ...d, [tab]: { ...d[tab], [section]: [item, ...d[tab][section]] } }))
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

  const addNote      = () => addItem("notes", noteSection, { title: "", html: "", cardColor: "#ffffff", canvasData: null, canvasTexts: [], canvasShapes: [] })
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
            style={{ maxHeight: "100dvh", height: "100dvh", maxHeight: "92dvh" }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-0 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">📓</span>
                <h2 className="text-sm sm:text-base font-bold">Study Notebook</h2>
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
            <div className="flex border-b border-border flex-shrink-0 px-3 sm:px-5">
              {TABS.map(tab => {
                const Icon  = tab.icon
                const count = tab.id === "vocabulary" ? totalVocab : tab.id === "mistakes" ? totalMistakes : totalNotes
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch("") }}
                    className="relative flex items-center gap-1.5 px-3 sm:px-3 py-3 sm:py-3 text-xs sm:text-sm font-medium transition flex-1 sm:flex-none justify-center sm:justify-start sm:mr-1"
                    style={{ color: activeTab === tab.id ? tab.color : undefined }}>
                    <Icon size={14} />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                    {count > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full text-white"
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
            <div className="px-3 sm:px-5 pt-3 pb-2 flex-shrink-0 flex items-center gap-2">
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
                    className="w-full text-sm bg-secondary/60 border border-border rounded-xl pl-8 pr-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3">
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
                        className="mb-3 w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition touch-manipulation"
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
                        renderItem={(v, i, gripHandlers, draggingIdx) => {
                          const ri = (data.vocabulary[vocabSection] || []).indexOf(v)
                          return (
                            <VocabCard
                              key={v._id || ri}
                              v={v}
                              ri={ri}
                              updateVocab={updateVocab}
                              removeVocab={removeVocab}
                              sectionColor={currentVocabSection.color}
                              sectionAccent={currentVocabSection.accent}
                              gripHandlers={gripHandlers}
                              draggingIdx={draggingIdx}
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
                        className="mb-3 w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition touch-manipulation"
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
                        renderItem={(m, i, gripHandlers, draggingIdx) => {
                          const ri = (data.mistakes[mistakeSection] || []).indexOf(m)
                          return (
                            <MistakeCard
                              key={m._id || ri}
                              m={m}
                              ri={ri}
                              updateMistake={updateMistake}
                              removeMistake={removeMistake}
                              sectionColor={currentMistakeSection.color}
                              sectionAccent={currentMistakeSection.accent}
                              gripHandlers={gripHandlers}
                              draggingIdx={draggingIdx}
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
                        className="mb-3 w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition touch-manipulation"
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
                        renderItem={(note, i, gripHandlers, draggingIdx) => (
                          <NoteCard
                            key={note._id || i}
                            note={note}
                            index={i}
                            onUpdate={updateNote}
                            onRemove={removeNote}
                            activeTool={null}
                            toolColor="#1e293b"
                            toolThickness={2}
                            gripHandlers={gripHandlers}
                            draggingIdx={draggingIdx}
                          />
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-secondary/20 flex-shrink-0">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="text-[11px] sm:text-xs">📚 {totalVocab}</span>
                <span className="text-[11px] sm:text-xs">❌ {totalMistakes}</span>
                <span className="text-[11px] sm:text-xs">📝 {totalNotes}</span>
              </div>
              <span className="text-xs text-muted-foreground">Synced to your account</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
