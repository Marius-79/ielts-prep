import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { Sun, Moon, CheckCircle2, Circle, ChevronDown, Check, RotateCcw, Eye } from "lucide-react"
import { weeklyPlans } from "../_lib/study-plan-data"
import { supabase } from "../_lib/supabase"
import { saveTaskProgress, loadUserProgress } from "../../lib/progress"

function TaskBlock({ task, period, icon: Icon, refreshProgress, dayId, weekId }) {

const storageKey = `week-${weekId}-day-${dayId}-${task.title}`

const [checkedItems, setCheckedItems] = useState(() => {
const saved = localStorage.getItem(storageKey)
return saved ? new Set(JSON.parse(saved)) : new Set()
})

const toggleItem = (index) => {

setCheckedItems(prev => {

const next = new Set(prev)

if (next.has(index)) next.delete(index)
else next.add(index)

localStorage.setItem(storageKey, JSON.stringify([...next]))

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

return (

<div className="p-4 sm:p-5 rounded-lg border border-border bg-card/50">

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

</div>

<ul className="space-y-2">

{task.subtasks.map((subtask, i) => {

const checked = checkedItems.has(i)

return (

<li
key={i}
onClick={() => toggleItem(i)}
className="flex items-start sm:items-center gap-2 cursor-pointer"
>

{checked
? <CheckCircle2 className="w-4 h-4 text-primary"/>
: <Circle className="w-4 h-4 text-muted-foreground/40"/>
}

<span
className={
checked
? "text-muted-foreground line-through text-sm"
: "text-foreground/80 text-sm"
}
>

{subtask}

</span>

</li>

)

})}

</ul>

</div>

)
}

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
className="w-full flex items-center justify-between p-3 sm:p-4"
>

<div className="flex items-center gap-3 sm:gap-4">

<div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">

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

<div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
className="px-3 sm:px-4 pb-4 sm:pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
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

<section id="study-plan" className="py-20 sm:py-32 px-4 sm:px-6">

<div className="max-w-5xl mx-auto">

<div className="text-center mb-12 sm:mb-16">

<span className="text-xs font-mono text-primary uppercase tracking-[0.3em] block mb-4">
Study Plan
</span>

<h2 className="text-3xl sm:text-5xl font-bold">
25-Day <span className="text-primary">Preparation</span>
</h2>

</div>

<div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">

{weeklyPlans.map((week, i) => (

<button
key={`week-${week.week}`}
onClick={() => setActiveWeek(i)}
className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition ${
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
className="p-6 sm:p-10 rounded-xl border border-green-300 bg-green-50 text-center"
>

<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: "spring", stiffness: 260 }}
className="flex justify-center mb-4"
>

<CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"/>

</motion.div>

<h3 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
Congrats! You finished Week {currentPlan.week}
</h3>

<p className="text-green-700/80 mb-6">
Great consistency. Head to the next week and keep the momentum.
</p>

<div className="flex flex-wrap justify-center gap-3">

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

<div className="mt-10 sm:mt-14">

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