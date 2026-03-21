import { motion, AnimatePresence } from "motion/react"
import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Sun, Moon, CheckCircle2, Circle, ChevronDown, Check,
  RotateCcw, Eye, BookOpen, X, Lightbulb, ExternalLink,
  TrendingUp, Plus, Trash2, ChevronUp, Target, Clock,
  Award, ArrowRight, Zap, ChevronRight, AlertTriangle
} from "lucide-react"
import { PLAN_META, PLANS } from "../_lib/study-plan-data"
import { supabase } from "../_lib/supabase"
import { saveTaskProgress, loadUserProgress, saveSelectedPlan, loadSelectedPlan } from "../../lib/progress"

// ── Constants ──────────────────────────────────────────────────────────────────
const R_SIZE = 32
const R_STROKE = 3
const R_RADIUS = (R_SIZE - R_STROKE) / 2
const R_CIRC = 2 * Math.PI * R_RADIUS

// ── Resource links ─────────────────────────────────────────────────────────────
function getResources(taskTitle) {
  const t = taskTitle.toLowerCase()
  const resources = []
  if (t.includes("listening")) resources.push({ label: "Simon's Listening Lessons", url: "https://t.me/Simon_Listening_Lessons", color: "#0088cc" })
  if (t.includes("reading"))   resources.push({ label: "Simon's Reading Practice",  url: "https://t.me/IELTS_with_Simon_reading", color: "#0088cc" })
  if (t.includes("writing") || t.includes("task 1") || t.includes("task 2") || t.includes("essay"))
    resources.push({ label: "Simon's Writing Lessons", url: "https://t.me/IELTS_with_Simon_writing", color: "#0088cc" })
  if (t.includes("speaking"))  resources.push({ label: "Practice Speaking on JumpInto", url: "https://jumpinto.com/ielts/practice", color: "#7c3aed" })
  if (t.includes("mock") || t.includes("full test") || t.includes("simulation"))
    resources.push(
      { label: "Full Mock on JumpInto", url: "https://jumpinto.com/ielts/practice", color: "#7c3aed" },
      { label: "Practice on Engnovate", url: "https://engnovate.com", color: "#059669" }
    )
  return resources
}

// ── HintModal ──────────────────────────────────────────────────────────────────
function HintModal({ label, detail, period, taskTitle, onClose }) {
  const isMorning = period.toLowerCase() === "morning"
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", fn)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = "" }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-[430px] bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 to-purple-600" />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isMorning ? "bg-amber-50" : "bg-violet-50"}`}>
            {isMorning ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-violet-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-violet-400 uppercase tracking-[0.15em] mb-0.5">{period} · How to do this</p>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">{taskTitle}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Task</p>
          <p className="text-sm font-medium text-gray-900 mb-4">{label}</p>
          {detail && (
            <div className="rounded-xl p-4 bg-violet-50 border border-violet-100 mb-1">
              <div className="flex gap-2.5">
                <Lightbulb size={14} className="flex-shrink-0 mt-0.5 text-violet-500" />
                <p className="text-[13px] leading-[1.75] text-gray-700">{detail}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          {getResources(taskTitle).length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-1.5">Resources</p>
              {getResources(taskTitle).map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: r.color }}>
                  <ExternalLink size={12} className="flex-shrink-0" />
                  {r.label}
                </a>
              ))}
            </div>
          )}
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 transition">
            Got it ✓
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ── TaskBlock ──────────────────────────────────────────────────────────────────
function TaskBlock({ task, period, icon: Icon, refreshProgress, dayId, weekId, planId, userId, openAuth, progressTrigger }) {
  const storageKey = userId
    ? `${userId}-${planId}-week-${weekId}-day-${dayId}-${task.title}`
    : `${planId}-week-${weekId}-day-${dayId}-${task.title}`

  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [activeHint, setActiveHint] = useState(null)
  const arcRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set())
  }, [storageKey, progressTrigger])

  const toggleItem = (index) => {
    if (!userId) { openAuth(); return }
    setCheckedItems(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      if (window.supabaseUser)
        saveTaskProgress(window.supabaseUser.id, planId, weekId, dayId, task.title, [...next])
      return next
    })
    setTimeout(() => refreshProgress(), 0)
  }

  const total = task.subtasks.length
  const pct = total === 0 ? 0 : checkedItems.size / total
  const allDone = checkedItems.size === total && total > 0

  useEffect(() => {
    const arc = arcRef.current
    if (!arc) return
    arc.setAttribute("stroke-dashoffset", R_CIRC * (1 - pct))
    arc.setAttribute("stroke", allDone ? "#7c3aed" : "rgb(196,181,253)")
  })

  return (
    <>
      <AnimatePresence>
        {activeHint && (
          <HintModal label={activeHint.label} detail={activeHint.detail}
            period={period} taskTitle={task.title} onClose={() => setActiveHint(null)} />
        )}
      </AnimatePresence>

      <div className={`relative p-3.5 sm:p-4 rounded-xl border transition-all duration-300 ${allDone ? "border-violet-200 bg-violet-50/40" : "border-gray-100 bg-white"}`}>
        {allDone && (
          <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(139,92,246,0.04)" }} />
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0" style={{ width: R_SIZE, height: R_SIZE }}>
            <svg width={R_SIZE} height={R_SIZE} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={R_SIZE/2} cy={R_SIZE/2} r={R_RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={R_STROKE} />
              <circle ref={arcRef} cx={R_SIZE/2} cy={R_SIZE/2} r={R_RADIUS} fill="none" strokeWidth={R_STROKE}
                strokeLinecap="round" strokeDasharray={R_CIRC} strokeDashoffset={R_CIRC}
                stroke="rgb(196,181,253)" style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{period}</span>
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">{task.title}</h4>
          </div>
          {allDone && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
              <Check size={9} /> Done
            </motion.div>
          )}
        </div>

        <ul className="space-y-2.5">
          {task.subtasks.map((subtask, i) => {
            const label = typeof subtask === "string" ? subtask : subtask.label
            const detail = typeof subtask === "string" ? null : subtask.detail
            const checked = checkedItems.has(i)
            return (
              <li key={i} className="flex items-start gap-2.5">
                <button onClick={() => toggleItem(i)} className="flex-shrink-0 mt-0.5 p-0.5 -m-0.5 touch-manipulation">
                  {checked
                    ? <CheckCircle2 className="w-5 h-5 text-violet-500" />
                    : <Circle className="w-5 h-5 text-gray-300" />}
                </button>
                <span onClick={() => toggleItem(i)}
                  className={`flex-1 cursor-pointer text-sm leading-snug ${checked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {label}
                </span>
                {detail && (
                  <button
                    onClick={() => { if (!userId) { openAuth(); return } setActiveHint({ label, detail }) }}
                    className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition touch-manipulation ${
                      checked ? "border-gray-200 text-gray-400" : "border-violet-200 text-violet-600 bg-violet-50 active:bg-violet-100"
                    }`}>
                    <BookOpen size={9} />HOW
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

// ── DayCard ────────────────────────────────────────────────────────────────────
function DayCard({ dayPlan, weekNum, planId, refreshProgress, userId, openAuth, progressTrigger }) {
  const [open, setOpen] = useState(false)
  const globalDay = (weekNum - 1) * 5 + dayPlan.day

  let totalTasks = 0, completedTasks = 0
  ;[dayPlan.morning, dayPlan.afternoon].forEach(task => {
    totalTasks += task.subtasks.length
    const key = userId
      ? `${userId}-${planId}-week-${weekNum}-day-${globalDay}-${task.title}`
      : `${planId}-week-${weekNum}-day-${globalDay}-${task.title}`
    const saved = localStorage.getItem(key)
    if (saved) completedTasks += JSON.parse(saved).length
  })

  const dayProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const dayDone = dayProgress === 100

  return (
    <motion.div
      className={`border rounded-2xl overflow-hidden transition-all ${dayDone ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}
      animate={dayDone ? { scale: [1, 1.005, 1] } : {}} transition={{ duration: 0.5 }}
    >
      <div className="h-1 w-full bg-gray-100">
        <motion.div className="h-full bg-violet-400 rounded-full"
          animate={{ width: `${dayProgress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50/60 active:bg-gray-100 transition touch-manipulation">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <AnimatePresence>
              {dayDone && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute inset-0 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            {!dayDone && (
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-600">{globalDay}</span>
              </div>
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900">Day {dayPlan.day}</p>
            <p className="text-xs text-gray-400 truncate">
              {dayPlan.morning.title} · {dayPlan.afternoon.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {dayProgress > 0 && dayProgress < 100 && (
            <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{dayProgress}%</span>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 sm:px-4 sm:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TaskBlock task={dayPlan.morning} period="Morning" icon={Sun}
              refreshProgress={refreshProgress} dayId={globalDay} weekId={weekNum}
              planId={planId} userId={userId} openAuth={openAuth} progressTrigger={progressTrigger} />
            <TaskBlock task={dayPlan.afternoon} period="Afternoon" icon={Moon}
              refreshProgress={refreshProgress} dayId={globalDay} weekId={weekNum}
              planId={planId} userId={userId} openAuth={openAuth} progressTrigger={progressTrigger} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Week Progress Circle ───────────────────────────────────────────────────────
function WeekProgressCircle({ pct, size = 28, color = "#7c3aed" }) {
  const stroke = 2.5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const done = pct >= 100

  if (done) {
    return (
      <div className="flex items-center justify-center flex-shrink-0 rounded-full bg-green-100"
        style={{ width: size, height: size }}>
        <Check size={size * 0.45} className="text-green-600" />
      </div>
    )
  }

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  )
}

// ── Week Dropdown ──────────────────────────────────────────────────────────────
function WeekDropdown({ weeklyPlans, activeWeek, setActiveWeek, userId, user, openAuth, progressTrigger, planColor, planUnit, planId }) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function getWeekProgress(weekPlan) {
    if (!weekPlan) return 0
    let total = 0, completed = 0
    weekPlan.days.forEach(day => {
      const gd = (weekPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        total += task.subtasks.length
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
        const saved = localStorage.getItem(key)
        if (saved) completed += JSON.parse(saved).length
      })
    })
    return total === 0 ? 0 : Math.round((completed / total) * 100)
  }

  const current = weeklyPlans[activeWeek]
  const currentPct = getWeekProgress(current)

  return (
    <div ref={dropRef} className="relative w-full sm:w-56">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-2.5 px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition text-sm font-medium text-gray-800 shadow-sm touch-manipulation"
      >
        <WeekProgressCircle pct={currentPct} size={22} color={planColor} />
        <span className="flex-1 text-left">{current?.label || `${planUnit} ${activeWeek + 1}`}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-1.5 max-h-80 overflow-y-auto">
              {weeklyPlans.map((week, i) => {
                const pct = getWeekProgress(week)
                const done = pct >= 100
                const isActive = activeWeek === i
                const locked = !user && i !== 0

                return (
                  <button key={i}
                    onClick={() => {
                      if (locked) { setOpen(false); openAuth(); return }
                      setActiveWeek(i); setOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      isActive ? "bg-violet-50" : "hover:bg-gray-50"
                    } ${locked ? "opacity-50" : ""}`}
                  >
                    <WeekProgressCircle pct={pct} size={24} color={planColor} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-violet-700" : done ? "text-green-700" : "text-gray-800"}`}>
                        {week.label || `${planUnit} ${i + 1}`}
                      </p>
                      {done && <p className="text-[10px] text-green-600 font-semibold">Completed ✓</p>}
                      {!done && pct > 0 && <p className="text-[10px] text-gray-400">{pct}% done</p>}
                      {!done && pct === 0 && <p className="text-[10px] text-gray-400">{locked ? "🔒 Sign in to unlock" : "Not started"}</p>}
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: planColor }} />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Plan Picker Illustrations ──────────────────────────────────────────────────
function SprintIllustration() {
  return (
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="sp_bg" x1="0" y1="0" x2="220" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ede9fe"/><stop offset="1" stopColor="#faf5ff"/>
        </linearGradient>
      </defs>
      <rect width="220" height="130" rx="14" fill="url(#sp_bg)"/>
      {/* Lightning bolt */}
      <path d="M120 18 L96 72 H114 L102 112 L138 58 H120 L132 18Z" fill="#7c3aed" opacity="0.85"/>
      {/* Progress bars */}
      <rect x="22" y="82" width="68" height="9" rx="4.5" fill="#ddd6fe"/>
      <rect x="22" y="82" width="58" height="9" rx="4.5" fill="#7c3aed"/>
      <rect x="22" y="97" width="68" height="9" rx="4.5" fill="#ddd6fe"/>
      <rect x="22" y="97" width="42" height="9" rx="4.5" fill="#7c3aed"/>
      {/* Mock badge */}
      <circle cx="178" cy="95" r="22" fill="#7c3aed" opacity="0.15"/>
      <circle cx="178" cy="95" r="16" fill="#7c3aed"/>
      <text x="178" y="92" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">10</text>
      <text x="178" y="104" textAnchor="middle" fill="white" fontSize="7">mocks</text>
      {/* Stars */}
      <circle cx="36" cy="36" r="5" fill="#a78bfa" opacity="0.5"/>
      <circle cx="55" cy="26" r="3" fill="#7c3aed" opacity="0.3"/>
    </svg>
  )
}

function StandardIllustration() {
  return (
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="st_bg" x1="0" y1="0" x2="220" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe"/><stop offset="1" stopColor="#f0f9ff"/>
        </linearGradient>
      </defs>
      <rect width="220" height="130" rx="14" fill="url(#st_bg)"/>
      {/* Calendar grid */}
      <rect x="18" y="28" width="84" height="84" rx="10" fill="white" opacity="0.8" stroke="#bae6fd" strokeWidth="1"/>
      <text x="60" y="48" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="bold">Month 1</text>
      <text x="60" y="60" textAnchor="middle" fill="#0ea5e9" fontSize="9" fontWeight="bold">+ Month 2</text>
      {/* Grid lines */}
      {[68,76,84,92,100].map(y => (
        <line key={y} x1="26" y1={y} x2="94" y2={y} stroke="#e0f2fe" strokeWidth="1"/>
      ))}
      {[34,46,58,70,82,94].map(x => (
        <line key={x} x1={x} y1="66" x2={x} y2="104" stroke="#e0f2fe" strokeWidth="1"/>
      ))}
      {/* Dots for done weeks */}
      {[[34,68],[46,68],[58,68],[70,68],[82,68],[34,76],[46,76],[58,76]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#0ea5e9" opacity={i < 5 ? 0.9 : 0.4}/>
      ))}
      {/* Mock counter */}
      <circle cx="170" cy="55" r="32" fill="#0ea5e9" opacity="0.12"/>
      <circle cx="170" cy="55" r="24" fill="#0ea5e9"/>
      <text x="170" y="51" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">25</text>
      <text x="170" y="64" textAnchor="middle" fill="white" fontSize="8">mock tests</text>
      {/* Band label */}
      <rect x="128" y="90" width="64" height="18" rx="9" fill="#0ea5e9" opacity="0.15"/>
      <text x="160" y="103" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="bold">Band 7.0+</text>
    </svg>
  )
}

function ComprehensiveIllustration() {
  return (
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="co_bg" x1="0" y1="0" x2="220" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ed"/><stop offset="1" stopColor="#fffbf5"/>
        </linearGradient>
      </defs>
      <rect width="220" height="130" rx="14" fill="url(#co_bg)"/>
      {/* Trophy cup */}
      <path d="M90 22 L130 22 L127 60 Q110 72 93 60 Z" fill="#f97316" opacity="0.9"/>
      <rect x="104" y="60" width="12" height="18" rx="2" fill="#fb923c"/>
      <rect x="92" y="78" width="36" height="9" rx="4.5" fill="#f97316"/>
      {/* Trophy handles */}
      <path d="M90 32 Q77 32 77 46 Q77 60 90 60" stroke="#fdba74" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M130 32 Q143 32 143 46 Q143 60 130 60" stroke="#fdba74" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Stars */}
      <text x="24" y="46" fontSize="18">⭐</text>
      <text x="172" y="110" fontSize="12">⭐</text>
      {/* Mock counter */}
      <circle cx="176" cy="50" r="26" fill="#f97316" opacity="0.15"/>
      <circle cx="176" cy="50" r="20" fill="#f97316"/>
      <text x="176" y="46" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">32</text>
      <text x="176" y="59" textAnchor="middle" fill="white" fontSize="8">mocks</text>
      {/* 3 months label */}
      <rect x="16" y="95" width="90" height="22" rx="11" fill="#f97316" opacity="0.12"/>
      <text x="61" y="110" textAnchor="middle" fill="#c2410c" fontSize="10" fontWeight="bold">3 months · Band 7.5+</text>
    </svg>
  )
}

const ILLUS = { sprint: SprintIllustration, standard: StandardIllustration, comprehensive: ComprehensiveIllustration }

// ── Plan Picker ────────────────────────────────────────────────────────────────
function PlanPicker({ selectedPlan, onSelect }) {
  return (
    <div className="mb-10 sm:mb-14">
      <div className="text-center mb-8">
        <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-3">Choose Your Plan</span>
        <h2 className="text-2xl sm:text-4xl font-bold mb-3">
          Three paths to <span className="text-primary">Band 7+</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          All plans cover every IELTS skill with clear tasks and full mock tests. Choose the one that fits your timeline.
        </p>
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className="flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none mb-4">
        {PLAN_META.map(plan => {
          const selected = selectedPlan === plan.id
          return (
            <button
              key={plan.id + "-mobile"}
              onClick={() => onSelect(plan.id)}
              className="flex-shrink-0 snap-start flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all touch-manipulation"
              style={{
                borderColor: selected ? plan.color : "#e5e7eb",
                background: selected ? `linear-gradient(135deg, ${plan.accent}, #ffffff)` : "white",
                minWidth: 160,
              }}
            >
              {selected && <Check size={13} style={{ color: plan.color }} className="flex-shrink-0" />}
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{plan.label}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: plan.color }}>{plan.targetBand}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Desktop: full grid */}
      <div className="hidden sm:grid grid-cols-3 gap-5">
        {PLAN_META.map(plan => {
          const Illus = ILLUS[plan.id]
          const selected = selectedPlan === plan.id
          return (
            <motion.button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                selected ? "shadow-xl shadow-black/8" : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
              }`}
              style={{
                borderColor: selected ? plan.color : undefined,
                background: selected ? `linear-gradient(135deg, ${plan.accent} 0%, #ffffff 55%)` : undefined,
              }}
            >
              {plan.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: plan.color }}>
                    {plan.badge}
                  </span>
                </div>
              )}
              {selected && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: plan.color }}>
                    <Check size={10} className="text-white" />
                  </div>
                </div>
              )}

              {/* Illustration */}
              <div className="h-28 px-4 pt-4">
                <Illus />
              </div>

              {/* Content */}
              <div className="p-4 pt-3">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div>
                    <p className="text-base font-bold text-gray-900">{plan.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.days} days</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: plan.color }}>
                    {plan.targetBand}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 mb-3 py-2.5 px-3 rounded-xl" style={{ backgroundColor: plan.accent }}>
                  {[
                    { value: plan.weeks, label: "weeks" },
                    { value: plan.mocks, label: "mocks" },
                    { value: plan.dailyHours, label: "daily", small: true },
                  ].map((s, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="text-center flex-1">
                        <p className={`font-bold leading-none ${s.small ? "text-[11px]" : "text-base"}`}
                          style={{ color: plan.color }}>{s.value}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                      {i < arr.length - 1 && <div className="w-px h-8 bg-black/8 flex-shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-3">{plan.description}</p>

                <ul className="space-y-1 mb-3">
                  {plan.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Check size={10} style={{ color: plan.color }} className="flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  selected ? "text-white" : "text-gray-500 border border-gray-200"
                }`} style={selected ? { backgroundColor: plan.color } : {}}>
                  {selected
                    ? <span className="flex items-center justify-center gap-1.5"><Check size={11}/> Selected</span>
                    : <span className="flex items-center justify-center gap-1.5">Choose Plan <ArrowRight size={10}/></span>}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>{/* end desktop grid */}

      {/* Active plan summary bar */}
      <AnimatePresence>
        {selectedPlan && (() => {
          const meta = PLAN_META.find(p => p.id === selectedPlan)
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="mt-4 rounded-2xl border overflow-hidden"
              style={{ borderColor: meta.color + "25" }}
            >
              {/* Top accent strip */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }} />

              <div className="p-4 sm:p-5" style={{ backgroundColor: meta.accent }}>
                {/* Header row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: meta.color }}>
                    <Target size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight" style={{ color: meta.color }}>{meta.label}</p>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{meta.forWho}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: meta.color }}>
                    <Check size={9} /> Selected
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Clock, label: "Duration", v: `${meta.days} days` },
                    { icon: Zap,   label: "Mock tests", v: `${meta.mocks}` },
                    { icon: Award, label: "Target", v: `Band ${meta.targetBand}` },
                  ].map(({ icon: Icon, label, v }) => (
                    <div key={label} className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-white/60 border border-white/80">
                      <Icon size={13} style={{ color: meta.color }} className="mb-1" />
                      <p className="text-xs font-bold text-gray-900 leading-none">{v}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

// ── Score Helpers ──────────────────────────────────────────────────────────────
function calcOverall(l, r, w, s) {
  const avg = (Number(l) + Number(r) + Number(w) + Number(s)) / 4
  return Math.round(avg * 2) / 2
}
function bandColor(b) {
  if (b >= 8) return "#059669"; if (b >= 7) return "#7c3aed"
  if (b >= 6) return "#d97706"; return "#ef4444"
}

// ── ScoreTracker ───────────────────────────────────────────────────────────────
function ScoreTracker({ openAuth, supabase, onScoresChange }) {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ielts-scores") || "null") ?? [] } catch { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [listening, setListening] = useState("")
  const [reading,   setReading]   = useState("")
  const [writing,   setWriting]   = useState("")
  const [speaking,  setSpeaking]  = useState("")

  useEffect(() => { onScoresChange?.(scores) }, [scores])

  useEffect(() => {
    async function fetchFresh() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      setUser(session.user)
      const { data } = await supabase.from("score_history").select("*")
        .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20)
      if (data) { setScores(data); localStorage.setItem("ielts-scores", JSON.stringify(data)) }
    }
    fetchFresh().catch(() => {})
    const { data: l } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") { setUser(null); setScores([]); localStorage.removeItem("ielts-scores"); return }
      if (event === "SIGNED_IN") {
        setUser(session.user)
        const { data } = await supabase.from("score_history").select("*")
          .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20)
        if (data) { setScores(data); localStorage.setItem("ielts-scores", JSON.stringify(data)) }
      }
    })
    return () => l.subscription.unsubscribe()
  }, [])

  async function saveScore() {
    if (!user) { openAuth(); return }
    if (listening === "" && reading === "" && writing === "" && speaking === "") return
    setSaving(true)
    const payload = { user_id: user.id }
    if (listening !== "") payload.listening = Number(listening)
    if (reading !== "")   payload.reading   = Number(reading)
    if (writing !== "")   payload.writing   = Number(writing)
    if (speaking !== "")  payload.speaking  = Number(speaking)
    const { data } = await supabase.from("score_history").insert(payload).select()
    if (data) {
      setScores(prev => { const u = [data[0], ...prev]; localStorage.setItem("ielts-scores", JSON.stringify(u)); return u })
      setListening(""); setReading(""); setWriting(""); setSpeaking(""); setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteScore(id) {
    await supabase.from("score_history").delete().eq("id", id)
    setScores(prev => { const u = prev.filter(s => s.id !== id); localStorage.setItem("ielts-scores", JSON.stringify(u)); return u })
  }

  const bandOpts = [4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9]
  const latestFull = scores.find(s => s.listening != null && s.reading != null && s.writing != null && s.speaking != null)
  const overall = latestFull ? calcOverall(latestFull.listening, latestFull.reading, latestFull.writing, latestFull.speaking) : null
  const anyFilled = listening !== "" || reading !== "" || writing !== "" || speaking !== ""
  const previewBand = (listening !== "" && reading !== "" && writing !== "" && speaking !== "")
    ? calcOverall(Number(listening), Number(reading), Number(writing), Number(speaking)) : null
  const fields = [
    { label: "Listening", val: listening, set: setListening },
    { label: "Reading",   val: reading,   set: setReading   },
    { label: "Writing",   val: writing,   set: setWriting   },
    { label: "Speaking",  val: speaking,  set: setSpeaking  },
  ]

  return (
    <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => { if (!user) { openAuth(); return } setOpen(o => !o) }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={15} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Score Tracker</p>
            <p className="text-xs text-gray-400">
              {!user ? "Sign in to track your scores" : overall ? `Latest band: ${overall}` : "Log your mock test scores"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overall && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: bandColor(overall) }}>
              Band {overall}
            </span>
          )}
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100">
            <div className="p-5">
              {!showForm && (
                <button onClick={() => setShowForm(true)}
                  className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition">
                  <Plus size={14} /> Log New Score
                </button>
              )}

              <AnimatePresence>
                {showForm && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Log a Score</p>
                    <p className="text-xs text-gray-500 mb-3">Leave any blank if you did not test that skill.</p>
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      {fields.map(f => (
                        <div key={f.label}>
                          <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                          <select value={f.val} onChange={e => f.set(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">— skip —</option>
                            {bandOpts.map(v => <option key={v} value={v}>Band {v}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    {previewBand && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Estimated Overall Band</span>
                        <span className="text-lg font-bold" style={{ color: bandColor(previewBand) }}>{previewBand}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={saveScore} disabled={!anyFilled || saving}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 disabled:opacity-40 transition">
                        {saving ? "Saving..." : "Save Score"}
                      </button>
                      <button onClick={() => { setShowForm(false); setListening(""); setReading(""); setWriting(""); setSpeaking("") }}
                        className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {scores.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No scores yet. Log your first mock test result.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">Score History</p>
                  {scores.map((s, i) => {
                    const hasAll = s.listening != null && s.reading != null && s.writing != null && s.speaking != null
                    const ov = hasAll ? calcOverall(s.listening, s.reading, s.writing, s.speaking) : null
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                          style={{ backgroundColor: ov ? bandColor(ov) : "#94a3b8" }}>
                          {ov ?? "—"}
                        </div>
                        <div className="flex-1 grid grid-cols-4 gap-1">
                          {[{label:"L",val:s.listening},{label:"R",val:s.reading},{label:"W",val:s.writing},{label:"S",val:s.speaking}].map(item => (
                            <div key={item.label} className="text-center">
                              <div className="text-[9px] text-gray-400 font-mono">{item.label}</div>
                              <div className={`text-xs font-bold ${item.val != null ? "text-gray-800" : "text-gray-300"}`}>
                                {item.val ?? "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                        <button onClick={() => deleteScore(s.id)} className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition">
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── StudyPlanSection ───────────────────────────────────────────────────────────
export default function StudyPlanSection({ openAuth }) {
  const [user,            setUser]            = useState(null)
  const [activeWeek,      setActiveWeek]      = useState(0)
  const [progressTrigger, setProgressTrigger] = useState(0)
  const [showDays,        setShowDays]        = useState(true)
  const [selectedPlan,    setSelectedPlan]    = useState(() =>
    localStorage.getItem("ielts-selected-plan") || "sprint"
  )
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ielts-scores") || "null") ?? [] } catch { return [] }
  })

  const weeklyPlans = PLANS[selectedPlan] || PLANS.sprint
  const planMeta    = PLAN_META.find(p => p.id === selectedPlan) || PLAN_META[0]

  function handleSelectPlan(id) {
    setSelectedPlan(id)
    setActiveWeek(0)
    localStorage.setItem("ielts-selected-plan", id)
    if (user) saveSelectedPlan(user.id, id)
  }

  useEffect(() => {
    async function restoreUser(u) {
      setUser(u); window.supabaseUser = u
      if (u) {
        // Restore selected plan preference
        const savedPlan = await loadSelectedPlan(u.id)
        if (savedPlan) {
          setSelectedPlan(savedPlan)
          setActiveWeek(0)
          localStorage.setItem("ielts-selected-plan", savedPlan)
        }
        // Load progress for ALL plans at once — no plan filter
        const progress = await loadUserProgress(u.id)
        progress.forEach(row => {
          const key = `${u.id}-${row.plan}-week-${row.week}-day-${row.day}-${row.task}`
          localStorage.setItem(key, JSON.stringify(row.completed_indices ?? []))
        })
        setProgressTrigger(p => p + 1)
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => restoreUser(session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") { setUser(null); window.supabaseUser = null; setProgressTrigger(p => p + 1); return }
      if (["INITIAL_SESSION","SIGNED_IN","USER_UPDATED"].includes(event)) await restoreUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const currentPlan = weeklyPlans[activeWeek]
  const refreshProgress = () => setProgressTrigger(p => p + 1)

  function calculateWeekProgress() {
    if (!currentPlan) return 0
    let total = 0, completed = 0
    currentPlan.days.forEach(day => {
      const gd = (currentPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        total += task.subtasks.length
        const key = user?.id
          ? `${user.id}-${selectedPlan}-week-${currentPlan.week}-day-${gd}-${task.title}`
          : `${selectedPlan}-week-${currentPlan.week}-day-${gd}-${task.title}`
        const saved = localStorage.getItem(key)
        if (saved) completed += JSON.parse(saved).length
      })
    })
    return total === 0 ? 0 : Math.round((completed / total) * 100)
  }

  const weekProgress = calculateWeekProgress()
  const weekCompleted = weekProgress === 100

  useEffect(() => {
    if (weekCompleted) setShowDays(false)
    if (!weekCompleted) setShowDays(true)
  }, [weekCompleted])

  function restartWeek() {
    if (!currentPlan) return
    currentPlan.days.forEach(day => {
      const gd = (currentPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        const key = user?.id
          ? `${user.id}-${selectedPlan}-week-${currentPlan.week}-day-${gd}-${task.title}`
          : `${selectedPlan}-week-${currentPlan.week}-day-${gd}-${task.title}`
        localStorage.removeItem(key)
      })
    })
    setShowDays(true)
    refreshProgress()
  }

  return (
    <section id="study-plan" className="py-14 sm:py-32 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-3">Study Plan</span>
          <h2 className="text-2xl sm:text-5xl font-bold">IELTS <span className="text-primary">Preparation</span></h2>
        </div>

        {/* Plan picker */}
        <PlanPicker selectedPlan={selectedPlan} onSelect={handleSelectPlan} />

        {/* Plan header row */}
        <div className="mb-5">
          {/* Top: title + badges */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {planMeta.label}
              <span className="ml-2 text-sm font-normal text-gray-400">— {planMeta.weeks} weeks</span>
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full text-white font-semibold whitespace-nowrap" style={{ backgroundColor: planMeta.color }}>
                {planMeta.targetBand}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap"
                style={{ borderColor: planMeta.color + "50", color: planMeta.color }}>
                {planMeta.mocks} mocks
              </span>
            </div>
          </div>
          {/* Retake button if applicable */}
          {planMeta.retakeWeek && (
            <button
              onClick={() => { if (!user) { openAuth(); return } setActiveWeek(planMeta.retakeWeek - 1) }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition w-full sm:w-auto justify-center sm:justify-start touch-manipulation"
              style={{ borderColor: planMeta.color + "50", color: planMeta.color }}
            >
              <AlertTriangle size={11} />
              {planMeta.retakeLabel}
            </button>
          )}
        </div>

        {/* Week dropdown — full width on mobile */}
        <div className="mb-4 flex justify-end">
          <WeekDropdown
            weeklyPlans={weeklyPlans}
            activeWeek={activeWeek}
            setActiveWeek={setActiveWeek}
            userId={user?.id ?? null}
            user={user}
            openAuth={openAuth}
            progressTrigger={progressTrigger}
            planColor={planMeta?.color || "#7c3aed"}
            planUnit={planMeta?.unit || "Week"}
            planId={selectedPlan}
          />
        </div>

        {/* Days */}
        <AnimatePresence mode="wait">
          {weekCompleted && !showDays ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="p-8 sm:p-10 rounded-2xl border border-green-200 bg-green-50 text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.1 }} className="flex justify-center mb-4">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                {currentPlan?.label || `Week ${currentPlan?.week}`} Complete!
              </h3>
              <p className="text-green-600/80 text-sm mb-6">Great work. Head to the next week and keep going.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button onClick={() => setShowDays(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 text-sm font-medium transition">
                  <Eye size={15} /> View Days
                </button>
                <button onClick={restartWeek}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-100 text-sm font-medium transition">
                  <RotateCcw size={15} /> Restart Week
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={`week-${activeWeek}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {currentPlan?.days.map(day => (
                <DayCard
                  key={`w${currentPlan.week}-d${day.day}`}
                  dayPlan={day}
                  weekNum={currentPlan.week}
                  planId={selectedPlan}
                  refreshProgress={refreshProgress}
                  userId={user?.id ?? null}
                  openAuth={openAuth}
                  progressTrigger={progressTrigger}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week progress bar */}
        <div className="mt-6 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-medium text-gray-400">
              {currentPlan?.label || `${planMeta?.unit || "Week"} ${activeWeek + 1}`} progress
            </span>
            <span className="text-sm font-bold" style={{ color: planMeta.color }}>{weekProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 0.5 }} style={{ backgroundColor: planMeta.color }} />
          </div>
        </div>

        {/* Score tracker */}
        <ScoreTracker openAuth={openAuth} supabase={supabase} onScoresChange={setScores} />

      </div>
    </section>
  )
}
