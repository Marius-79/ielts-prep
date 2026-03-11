import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Sun, Moon, CheckCircle2, Circle, ChevronDown, Check, RotateCcw, Eye, BookOpen, X, Lightbulb } from "lucide-react"
import { weeklyPlans } from "../_lib/study-plan-data"
import { supabase } from "../_lib/supabase"
import { saveTaskProgress, loadUserProgress } from "../../lib/progress"

const R_SIZE = 36
const R_STROKE = 3
const R_RADIUS = (R_SIZE - R_STROKE) / 2
const R_CIRC = 2 * Math.PI * R_RADIUS

// ── HintModal ─────────────────────────────────────────────────────────────────
function HintModal({ label, detail, period, taskTitle, onClose }) {
  const isMorning = period.toLowerCase() === "morning"
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full max-w-[420px] bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-2xl shadow-purple-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-purple-300" />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-purple-50">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMorning ? "bg-amber-50" : "bg-purple-50"}`}>
            {isMorning ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-purple-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.15em] leading-none mb-1">{period} · Study tip</p>
            <h3 className="text-sm font-bold text-gray-800 leading-tight truncate">{taskTitle}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
            <span className="text-[13px] font-semibold text-gray-800">{label}</span>
          </div>
          {detail && (
            <div className="rounded-xl p-4 bg-purple-50 border border-purple-100 mb-1">
              <div className="flex gap-2.5">
                <Lightbulb size={15} className="flex-shrink-0 mt-0.5 text-purple-400" />
                <p className="text-[13.5px] leading-[1.7] text-gray-700">{detail}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all duration-150">
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ── TaskBlock ──────────────────────────────────────────────────────────────────
function TaskBlock({ task, period, icon: Icon, refreshProgress, dayId, weekId, userId, openAuth, progressTrigger }) {

  const storageKey = userId
    ? `${userId}-week-${weekId}-day-${dayId}-${task.title}`
    : `week-${weekId}-day-${dayId}-${task.title}`

  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const [activeHint, setActiveHint] = useState(null)
  const arcRef = useRef(null)

  // Re-read localStorage when userId loads OR when progress is restored from Supabase
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set())
  }, [storageKey, progressTrigger])

  const toggleItem = (index) => {
    if (!userId) { openAuth(); return }
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      if (window.supabaseUser) {
        saveTaskProgress(window.supabaseUser.id, weekId, dayId, task.title, [...next])
      }
      return next
    })
    setTimeout(() => refreshProgress(), 0)
  }

  const total   = task.subtasks.length
  const pct     = total === 0 ? 0 : checkedItems.size / total
  const allDone = checkedItems.size === total && total > 0

  useEffect(() => {
    const arc = arcRef.current
    if (!arc) return
    arc.setAttribute("stroke-dashoffset", R_CIRC * (1 - pct))
    arc.setAttribute("stroke", allDone ? "hsl(var(--primary))" : "rgb(196,181,253)")
  })

  return (
    <>
      <AnimatePresence>
        {activeHint && (
          <HintModal
            label={activeHint.label}
            detail={activeHint.detail}
            period={period}
            taskTitle={task.title}
            onClose={() => setActiveHint(null)}
          />
        )}
      </AnimatePresence>

      <div
        className="relative p-4 sm:p-5 rounded-lg border bg-card/50 transition-colors duration-300"
        style={{ borderColor: allDone ? "rgba(139,92,246,0.35)" : "hsl(var(--border))" }}
      >
        <style>{`
          @keyframes fill-ltr { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          .task-fill-ltr { animation: fill-ltr 0.7s cubic-bezier(0.22,1,0.36,1) forwards; transform-origin: left; }
        `}</style>
        {allDone && (
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <div className="task-fill-ltr absolute inset-0 rounded-lg" style={{ background: "rgba(139,92,246,0.07)" }} />
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0" style={{ width: R_SIZE, height: R_SIZE }}>
            <svg width={R_SIZE} height={R_SIZE} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }} overflow="visible">
              <circle cx={R_SIZE/2} cy={R_SIZE/2} r={R_RADIUS} fill="none" stroke="hsl(var(--secondary))" strokeWidth={R_STROKE} />
              <circle ref={arcRef} cx={R_SIZE/2} cy={R_SIZE/2} r={R_RADIUS} fill="none" strokeWidth={R_STROKE} strokeLinecap="round"
                strokeDasharray={R_CIRC} strokeDashoffset={R_CIRC} stroke="rgb(196,181,253)"
                style={{ transition: "stroke-dashoffset 0.4s ease-out, stroke 0.5s ease" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{period}</span>
            <h4 className="text-sm font-semibold text-foreground">{task.title}</h4>
          </div>

          {allDone && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              <Check size={9} /> Done
            </motion.div>
          )}
        </div>

        <ul className="space-y-2">
          {task.subtasks.map((subtask, i) => {
            const label   = typeof subtask === "string" ? subtask : subtask.label
            const detail  = typeof subtask === "string" ? null    : subtask.detail
            const checked = checkedItems.has(i)
            return (
              <li key={i} className="flex items-start sm:items-center gap-2 select-none">
                <span onClick={() => toggleItem(i)} className="flex-shrink-0 mt-0.5 sm:mt-0 cursor-pointer">
                  {checked ? <CheckCircle2 className="w-4 h-4 text-primary"/> : <Circle className="w-4 h-4 text-muted-foreground/40"/>}
                </span>
                <span onClick={() => toggleItem(i)} className={`flex-1 cursor-pointer text-sm leading-snug ${checked ? "text-muted-foreground line-through" : "text-foreground/80"}`}>
                  {label}
                </span>
                {detail && (
                  <button
                    onClick={() => { if (!userId) { openAuth(); return } setActiveHint({ label, detail }) }}
                    className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide border transition-all duration-150 active:scale-95 ${
                      checked ? "border-border/40 text-muted-foreground/50" : "border-primary/25 text-primary bg-primary/5 hover:bg-primary/12 hover:border-primary/50"
                    }`}
                  >
                    <BookOpen size={10} /><span>How</span>
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
function DayCard({ dayPlan, weekNum, refreshProgress, userId, openAuth, progressTrigger }) {

  const [open, setOpen] = useState(false)
  const globalDay = (weekNum - 1) * 5 + dayPlan.day

  let totalTasks = 0
  let completedTasks = 0
  ;[dayPlan.morning, dayPlan.afternoon].forEach(task => {
    totalTasks += task.subtasks.length
    const key = userId
      ? `${userId}-week-${weekNum}-day-${globalDay}-${task.title}`
      : `week-${weekNum}-day-${globalDay}-${task.title}`
    const saved = localStorage.getItem(key)
    if (saved) completedTasks += JSON.parse(saved).length
  })

  const dayProgress  = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const dayCompleted = dayProgress === 100

  return (
    <motion.div
      className={`border rounded-xl overflow-hidden transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-lg ${dayCompleted ? "border-green-300 bg-green-50" : "border-border bg-card/30"}`}
      animate={dayCompleted ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="h-1 w-full bg-secondary">
        <motion.div className="h-full bg-purple-300" animate={{ width: `${dayProgress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
            <AnimatePresence>
              {dayCompleted && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute inset-0 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white"/>
                </motion.div>
              )}
            </AnimatePresence>
            {!dayCompleted && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{globalDay}</span>
              </div>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">Day {dayPlan.day}</h3>
            <p className="text-xs text-muted-foreground">{dayPlan.morning.title} / {dayPlan.afternoon.title}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-3 sm:px-4 pb-4 sm:pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <TaskBlock task={dayPlan.morning} period="Morning" icon={Sun}
              refreshProgress={refreshProgress} dayId={globalDay} weekId={weekNum}
              userId={userId} openAuth={openAuth} progressTrigger={progressTrigger} />
            <TaskBlock task={dayPlan.afternoon} period="Afternoon" icon={Moon}
              refreshProgress={refreshProgress} dayId={globalDay} weekId={weekNum}
              userId={userId} openAuth={openAuth} progressTrigger={progressTrigger} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── StudyPlanSection ───────────────────────────────────────────────────────────
export default function StudyPlanSection({ openAuth }) {

  const [user,            setUser]            = useState(null)
  const [activeWeek,      setActiveWeek]      = useState(0)
  const [progressTrigger, setProgressTrigger] = useState(0)
  const [showDays,        setShowDays]        = useState(true)

  useEffect(() => {

    async function restoreUser(currentUser) {
      setUser(currentUser)
      window.supabaseUser = currentUser
      if (currentUser) {
        const progress = await loadUserProgress(currentUser.id)
        // Write all rows to localStorage first
        progress.forEach(row => {
          const key = `${currentUser.id}-week-${row.week}-day-${row.day}-${row.task}`
          localStorage.setItem(key, JSON.stringify(row.completed_indices ?? []))
        })
        // Then bump trigger so all TaskBlocks re-read
        setProgressTrigger(p => p + 1)
      }
    }

    async function initUser() {
      const { data: { session } } = await supabase.auth.getSession()
      await restoreUser(session?.user ?? null)
    }

    initUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        window.supabaseUser = null
        setProgressTrigger(p => p + 1)
        return
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        await restoreUser(session?.user ?? null)
      }
    })

    return () => listener.subscription.unsubscribe()

  }, [])

  const currentPlan = weeklyPlans[activeWeek]

  const refreshProgress = () => setProgressTrigger(p => p + 1)

  const calculateWeekProgress = () => {
    let totalTasks = 0
    let completedTasks = 0
    currentPlan.days.forEach(day => {
      const globalDay = (currentPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        totalTasks += task.subtasks.length
        const key = user?.id
          ? `${user.id}-week-${currentPlan.week}-day-${globalDay}-${task.title}`
          : `week-${currentPlan.week}-day-${globalDay}-${task.title}`
        const saved = localStorage.getItem(key)
        if (saved) completedTasks += JSON.parse(saved).length
      })
    })
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  }

  const weekProgress = calculateWeekProgress()
  const weekCompleted = weekProgress === 100

  useEffect(() => {
    if (weekCompleted) setShowDays(false)
    if (!weekCompleted) setShowDays(true)
  }, [weekCompleted])

  const restartWeek = () => {
    currentPlan.days.forEach(day => {
      const globalDay = (currentPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        const key = user?.id
          ? `${user.id}-week-${currentPlan.week}-day-${globalDay}-${task.title}`
          : `week-${currentPlan.week}-day-${globalDay}-${task.title}`
        localStorage.removeItem(key)
      })
    })
    setShowDays(true)
    refreshProgress()
  }

  return (
    <section id="study-plan" className="py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-4">Study Plan</span>
          <h2 className="text-3xl sm:text-5xl font-bold">25-Day <span className="text-primary">Preparation</span></h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
          {weeklyPlans.map((week, i) => (
            <button
              key={`week-${week.week}`}
              onClick={() => { if (!user && i !== 0) { openAuth(); return } setActiveWeek(i) }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition ${
                activeWeek === i ? "bg-primary text-white shadow-md" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Week {week.week}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {weekCompleted && !showDays ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="p-10 rounded-xl border border-green-300 bg-green-50 text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260 }} className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600"/>
              </motion.div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Congrats! You finished Week {currentPlan.week}</h3>
              <p className="text-green-700/80 mb-6">Great consistency. Head to the next week and keep the momentum.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button onClick={() => setShowDays(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10">
                  <Eye size={16}/> View Days
                </button>
                <button onClick={restartWeek} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-400 text-green-700 hover:bg-green-100">
                  <RotateCcw size={16}/> Restart Week
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {currentPlan.days.map(day => (
                <DayCard
                  key={`week-${currentPlan.week}-day-${day.day}`}
                  dayPlan={day}
                  weekNum={currentPlan.week}
                  refreshProgress={refreshProgress}
                  userId={user?.id ?? null}
                  openAuth={openAuth}
                  progressTrigger={progressTrigger}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Week {currentPlan.week} completion</span>
            <span className="font-semibold text-primary">{weekProgress}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" animate={{ width: `${weekProgress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

      </div>
    </section>
  )
}
