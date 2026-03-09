import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Sun, Moon, CheckCircle2, Circle, ChevronDown, Check, RotateCcw, Eye, BookOpen, X, Lightbulb } from "lucide-react"
import { weeklyPlans } from "../_lib/study-plan-data"
import { supabase } from "../_lib/supabase"
import { saveTaskProgress, loadUserProgress } from "../../lib/progress"

// ── NEW: Floating Hint Modal ───────────────────────────────────────────────────
function HintModal({ subtask, taskTitle, period, onClose }) {
  const label     = typeof subtask === "string" ? subtask : subtask.label
  const detail    = typeof subtask === "string" ? null    : subtask.detail
  const isMorning = period.toLowerCase() === "morning"

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: "rgba(255,255,255,0.80)", backdropFilter: "blur(8px)" }}
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
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" aria-label="Close">
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
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary/30">
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ── MODIFIED: TaskBlock — original logic + How button + group completion effect ─
function TaskBlock({ task, period, icon: Icon, refreshProgress, dayId, weekId }) {

const storageKey = `week-${weekId}-day-${dayId}-${task.title}`

const [checkedItems, setCheckedItems] = useState(() => {
const saved = localStorage.getItem(storageKey)
return saved ? new Set(JSON.parse(saved)) : new Set()
})

// NEW: track just-completed for the burst effect
const [justCompleted, setJustCompleted] = useState(false)

const toggleItem = (index) => {

setCheckedItems(prev => {

const next = new Set(prev)

if (next.has(index)) next.delete(index)
else next.add(index)

localStorage.setItem(storageKey, JSON.stringify([...next]))

// NEW: trigger burst if this completes the group
if (next.size === task.subtasks.length) {
  setJustCompleted(true)
  setTimeout(() => setJustCompleted(false), 1400)
}

refreshProgress()
if (window.supabaseUser) {
  saveTaskProgress(
    window.supabaseUser.id,
    weekId,
    dayId,
    task.title,
    true
  )
}

return next

})

}

// NEW: derived
const allDone = checkedItems.size === task.subtasks.length

return (

// NEW: relative for burst overlay, ring when allDone
<div className={`relative p-5 rounded-lg border bg-card/50 transition-all duration-300 ${allDone ? "border-primary/40 bg-primary/5" : "border-border"}`}>

{/* NEW: soft completion glow — no check, pure background shimmer */}
<AnimatePresence>
{justCompleted && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className="absolute inset-0 rounded-lg pointer-events-none z-10 overflow-hidden"
  >
    {/* base radial glow */}
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute inset-0 rounded-lg"
      style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.11) 0%, rgba(167,139,250,0.06) 45%, transparent 75%)" }}
    />
    {/* sweep shimmer left→right */}
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "160%" }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="absolute inset-y-0 w-1/2 rounded-lg"
      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.10) 40%, rgba(196,181,253,0.15) 50%, rgba(167,139,250,0.10) 60%, transparent 100%)" }}
    />
  </motion.div>
)}
</AnimatePresence>

<div className="flex items-center gap-3 mb-3">

<div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
<Icon className="w-4 h-4 text-muted-foreground"/>
</div>

<div>
<span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
{period}
</span>

<h4 className="text-sm font-semibold text-foreground">
{task.title}
</h4>
</div>

{/* NEW: done badge */}
{allDone && (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
  >
    <Check size={9} /> Done
  </motion.div>
)}

</div>

<ul className="space-y-2">

{task.subtasks.map((subtask, i) => {

// support both string (legacy) and {label, detail} objects
const label  = typeof subtask === "string" ? subtask : subtask.label
const detail = typeof subtask === "string" ? null    : subtask.detail
const checked = checkedItems.has(i)

return (

// NEW: group class for How button hover
<li
key={i}
className="flex items-center gap-2 cursor-pointer group"
>

{/* original check icon — onClick preserved */}
<span onClick={() => toggleItem(i)} className="flex-shrink-0">
{checked
? <CheckCircle2 className="w-4 h-4 text-primary"/>
: <Circle className="w-4 h-4 text-muted-foreground/40"/>
}
</span>

{/* original label — onClick preserved */}
<span
onClick={() => toggleItem(i)}
className={
checked
? "text-muted-foreground line-through text-sm flex-1 select-none"
: "text-foreground/80 text-sm flex-1 select-none"
}
>
{label}
</span>

{/* NEW: How button */}
{detail && <HowButton subtask={subtask} taskTitle={task.title} period={period} checked={checked} />}

</li>

)

})}

</ul>

</div>

)
}

// NEW: isolated How button with its own modal state
function HowButton({ subtask, taskTitle, period, checked }) {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          flex-shrink-0 flex items-center gap-1
          px-2 py-1 rounded-lg
          text-[10px] font-semibold uppercase tracking-wide
          border transition-all duration-150
          opacity-0 group-hover:opacity-100 sm:opacity-60 sm:group-hover:opacity-100
          ${checked
            ? "border-border/30 text-muted-foreground/40 pointer-events-none"
            : "border-primary/25 text-primary bg-primary/5 hover:bg-primary/12 hover:border-primary/50 active:scale-95"
          }
        `}
      >
        <BookOpen size={10} />
        <span>How</span>
      </button>
      <AnimatePresence>
        {showModal && (
          <HintModal
            subtask={subtask}
            taskTitle={taskTitle}
            period={period}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ── ORIGINAL: DayCard — zero changes ──────────────────────────────────────────
function DayCard({ dayPlan, weekNum, refreshProgress }) {

const [open, setOpen] = useState(false)

const globalDay = (weekNum - 1) * 5 + dayPlan.day

const tasks = [dayPlan.morning, dayPlan.afternoon]

let totalTasks = 0
let completedTasks = 0

tasks.forEach(task => {

totalTasks += task.subtasks.length

const saved = localStorage.getItem(`week-${weekNum}-day-${globalDay}-${task.title}`)

if (saved) {
completedTasks += JSON.parse(saved).length
}

})

const dayProgress = totalTasks === 0
? 0
: Math.round((completedTasks / totalTasks) * 100)

const dayCompleted = dayProgress === 100

return (

<motion.div
className={`border rounded-xl overflow-hidden transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-lg ${
dayCompleted
? "border-green-300 bg-green-50"
: "border-border bg-card/30"
}`}
animate={dayCompleted ? { scale: [1, 1.01, 1] } : {}}
transition={{ duration: 0.6 }}
>

<div className="h-1 w-full bg-secondary">

<motion.div
className="h-full bg-purple-300"
animate={{ width: `${dayProgress}%` }}
transition={{ duration: 0.4 }}
/>

</div>

<button
onClick={() => setOpen(!open)}
className="w-full flex items-center justify-between p-4"
>

<div className="flex items-center gap-4">

<div className="relative w-10 h-10 flex items-center justify-center">

<AnimatePresence>

{dayCompleted && (

<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
exit={{ scale: 0 }}
transition={{ type: "spring", stiffness: 300 }}
className="absolute inset-0 rounded-full bg-primary flex items-center justify-center"
>

<Check className="w-5 h-5 text-white"/>

</motion.div>

)}

</AnimatePresence>

{!dayCompleted && (

<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
<span className="text-sm font-bold text-primary">
{globalDay}
</span>
</div>

)}

</div>

<div>

<h3 className="text-sm font-semibold text-foreground">
Day {dayPlan.day}
</h3>

<p className="text-xs text-muted-foreground">
{dayPlan.morning.title} / {dayPlan.afternoon.title}
</p>

</div>

</div>

<ChevronDown
className={`w-4 h-4 text-muted-foreground transition ${
open ? "rotate-180" : ""
}`}
/>

</button>

<AnimatePresence>

{open && (

<motion.div
initial={{ height: 0, opacity: 0 }}
animate={{ height: "auto", opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
className="px-4 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
>

<TaskBlock
task={dayPlan.morning}
period="Morning"
icon={Sun}
refreshProgress={refreshProgress}
dayId={globalDay}
weekId={weekNum}
/>

<TaskBlock
task={dayPlan.afternoon}
period="Afternoon"
icon={Moon}
refreshProgress={refreshProgress}
dayId={globalDay}
weekId={weekNum}
/>

</motion.div>

)}

</AnimatePresence>

</motion.div>

)
}

// ── ORIGINAL: StudyPlanSection — zero changes ─────────────────────────────────
export default function StudyPlanSection() {

const [user,setUser] = useState(null)
const [dbProgress,setDbProgress] = useState([])

useEffect(()=>{

async function initUser(){

const { data } = await supabase.auth.getUser()

const currentUser = data.user

setUser(currentUser)
window.supabaseUser = currentUser

if(currentUser){

const progress = await loadUserProgress(currentUser.id)
setDbProgress(progress)

}

}

initUser()

},[])

useEffect(()=>{

if(!dbProgress.length) return

dbProgress.forEach(item=>{

const storageKey = `week-${item.week}-day-${item.day}-${item.task}`

const saved = localStorage.getItem(storageKey)

if(!saved){
localStorage.setItem(storageKey, JSON.stringify([0]))
}

})

setProgressTrigger(p=>p+1)

},[dbProgress])

const [activeWeek, setActiveWeek] = useState(0)
const [progressTrigger, setProgressTrigger] = useState(0)
const [showDays, setShowDays] = useState(true)

const currentPlan = weeklyPlans[activeWeek]

const refreshProgress = () => {
setProgressTrigger(p => p + 1)
}

const calculateWeekProgress = () => {

let totalTasks = 0
let completedTasks = 0

currentPlan.days.forEach(day => {

const globalDay = (currentPlan.week - 1) * 5 + day.day

const tasks = [day.morning, day.afternoon]

tasks.forEach(task => {

totalTasks += task.subtasks.length

const saved = localStorage.getItem(`week-${currentPlan.week}-day-${globalDay}-${task.title}`)

if (saved) {
completedTasks += JSON.parse(saved).length
}

})

})

if (totalTasks === 0) return 0

return Math.round((completedTasks / totalTasks) * 100)

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

const tasks = [day.morning, day.afternoon]

tasks.forEach(task => {
localStorage.removeItem(`week-${currentPlan.week}-day-${globalDay}-${task.title}`)
})

})

setShowDays(true)
refreshProgress()

}

return (

<section id="study-plan" className="py-32 px-6">

<div className="max-w-5xl mx-auto">

<div className="text-center mb-16">

<span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-4">
Study Plan
</span>

<h2 className="text-4xl sm:text-5xl font-bold">
25-Day <span className="text-primary">Preparation</span>
</h2>

{/* NEW: hint legend */}
<p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
Hover any task and click
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/8 text-primary text-[11px] font-semibold border border-primary/15">
  <BookOpen size={10} /> How
</span>
to see exactly how to do it
</p>

</div>

<div className="flex justify-center gap-3 mb-12">

{weeklyPlans.map((week, i) => (

<button
key={`week-${week.week}`}
onClick={() => setActiveWeek(i)}
className={`px-6 py-3 rounded-xl font-medium transition ${
activeWeek === i
? "bg-primary text-white shadow-md"
: "bg-secondary text-muted-foreground hover:bg-secondary/80"
}`}
>

Week {week.week}

</button>

))}

</div>

<AnimatePresence mode="wait">

{weekCompleted && !showDays ? (

<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0 }}
className="p-10 rounded-xl border border-green-300 bg-green-50 text-center"
>

<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: "spring", stiffness: 260 }}
className="flex justify-center mb-4"
>

<CheckCircle2 className="w-12 h-12 text-green-600"/>

</motion.div>

<h3 className="text-2xl font-bold text-green-700 mb-2">
Congrats! You finished Week {currentPlan.week}
</h3>

<p className="text-green-700/80 mb-6">
Great consistency. Head to the next week and keep the momentum.
</p>

<div className="flex justify-center gap-3">

<button
onClick={() => setShowDays(true)}
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10"
>

<Eye size={16}/>
View Days

</button>

<button
onClick={restartWeek}
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-400 text-green-700 hover:bg-green-100"
>

<RotateCcw size={16}/>
Restart Week

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
/>

))}

</div>

)}

</AnimatePresence>

<div className="mt-14">

<div className="flex justify-between text-sm mb-2">

<span className="text-muted-foreground">
Week {currentPlan.week} completion
</span>

<span className="font-semibold text-primary">
{weekProgress}%
</span>

</div>

<div className="w-full h-2 bg-secondary rounded-full overflow-hidden">

<motion.div
className="h-full bg-primary"
animate={{ width: `${weekProgress}%` }}
transition={{ duration: 0.5 }}
/>

</div>

</div>

</div>

</section>

)
}
