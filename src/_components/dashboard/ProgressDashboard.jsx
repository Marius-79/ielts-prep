/**
 * ProgressDashboard.jsx
 *
 * Reads REAL data from:
 *  - localStorage  (same keys as StudyPlanSection)
 *  - Supabase      score_history, user_preferences, study_progress
 *  - PLAN_META / PLANS from study-plan-data (same source of truth)
 *
 * Props: { user, username, avatarUrl }
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  TrendingUp, Flame, CheckSquare, Target, CalendarClock,
  ChevronRight, ExternalLink, Loader2,
} from "lucide-react"
import { supabase } from "../_lib/supabase"
import { PLAN_META, PLANS } from "../_lib/study-plan-data"
import { loadUserProgress, loadSelectedPlan } from "../../lib/progress"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const PURPLE = "#7c3aed"

const SKILL_COLORS = {
  Listening: "#7c3aed",
  Reading:   "#0ea5e9",
  Writing:   "#f59e0b",
  Speaking:  "#10b981",
}

/** Round a band score to nearest 0.5 (IELTS rounding) */
function calcOverall(L, R, W, S) {
  const avg = (L + R + W + S) / 4
  return Math.round(avg * 2) / 2
}

/**
 * Compute overall task progress across ALL weeks of a plan.
 * Returns { totalSubtasks, completedSubtasks, weeklyBreakdown[] }
 */
function computePlanProgress(planId, weeklyPlans, userId) {
  let totalSubtasks = 0
  let completedSubtasks = 0
  const weeklyBreakdown = []

  weeklyPlans.forEach(weekPlan => {
    let wTotal = 0, wCompleted = 0
    weekPlan.days.forEach(day => {
      const gd = (weekPlan.week - 1) * 5 + day.day
      ;[day.morning, day.afternoon].forEach(task => {
        const count = task.subtasks.length
        wTotal += count
        totalSubtasks += count
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
        const saved = localStorage.getItem(key)
        const done = saved ? JSON.parse(saved).length : 0
        wCompleted += done
        completedSubtasks += done
      })
    })
    weeklyBreakdown.push({
      week: weekPlan.week,
      label: weekPlan.label || `Week ${weekPlan.week}`,
      pct: wTotal === 0 ? 0 : Math.round((wCompleted / wTotal) * 100),
      total: wTotal,
      completed: wCompleted,
    })
  })

  return { totalSubtasks, completedSubtasks, weeklyBreakdown }
}

/**
 * Compute day streak: how many consecutive FULL days (100%) ending today.
 * A "full day" means every subtask in morning + afternoon is checked.
 */
function computeStreak(planId, weeklyPlans, userId) {
  // Flatten all days in order
  const allDays = []
  weeklyPlans.forEach(weekPlan => {
    weekPlan.days.forEach(day => {
      const gd = (weekPlan.week - 1) * 5 + day.day
      let total = 0, completed = 0
      ;[day.morning, day.afternoon].forEach(task => {
        total += task.subtasks.length
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
        const saved = localStorage.getItem(key)
        completed += saved ? JSON.parse(saved).length : 0
      })
      allDays.push({ globalDay: gd, total, completed, done: total > 0 && completed === total })
    })
  })

  // Count streak from the last completed day backwards
  const doneDays = allDays.filter(d => d.done)
  if (doneDays.length === 0) return 0

  // Find the highest consecutive block ending at the last done day
  let streak = 0
  // Walk backwards through allDays from the last done day
  const lastDoneIdx = allDays.findLastIndex(d => d.done)
  for (let i = lastDoneIdx; i >= 0; i--) {
    if (allDays[i].done) streak++
    else break
  }
  return streak
}

/**
 * Determine current active week index (first week that isn't 100% done).
 */
function findActiveWeekIdx(weeklyBreakdown) {
  const idx = weeklyBreakdown.findIndex(w => w.pct < 100)
  return idx === -1 ? weeklyBreakdown.length - 1 : idx
}

/**
 * Get the next 3 incomplete tasks across all days.
 */
function getNextTasks(planId, weeklyPlans, userId, activeWeekIdx) {
  const tasks = []
  // Start from active week
  for (let wi = activeWeekIdx; wi < weeklyPlans.length && tasks.length < 3; wi++) {
    const weekPlan = weeklyPlans[wi]
    for (let di = 0; di < weekPlan.days.length && tasks.length < 3; di++) {
      const day = weekPlan.days[di]
      const gd  = (weekPlan.week - 1) * 5 + day.day
      ;[
        { task: day.morning,   period: "Morning",   icon: "☀️" },
        { task: day.afternoon, period: "Afternoon",  icon: "🌙" },
      ].forEach(({ task, period, icon }) => {
        if (tasks.length >= 3) return
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${gd}-${task.title}`
        const saved = localStorage.getItem(key)
        const done  = saved ? JSON.parse(saved).length : 0
        if (done < task.subtasks.length) {
          // Choose icon from task title
          const t = task.title.toLowerCase()
          const taskIcon = t.includes("listening") ? "🎧"
            : t.includes("reading")   ? "📖"
            : t.includes("writing") || t.includes("task") ? "✍️"
            : t.includes("speaking")  ? "🎙️"
            : t.includes("mock")      ? "📝"
            : icon
          tasks.push({
            icon: taskIcon,
            title: task.title,
            sub: `Week ${weekPlan.week} · Day ${day.day} · ${period}`,
            pct: task.subtasks.length === 0 ? 100 : Math.round((done / task.subtasks.length) * 100),
          })
        }
      })
    }
  }
  return tasks
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Donut
// ─────────────────────────────────────────────────────────────────────────────
function Donut({ pct, size = 140 }) {
  const r    = (size - 18) / 2
  const circ = 2 * Math.PI * r
  const fill = Math.max(0, Math.min(1, pct / 100)) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={16}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={PURPLE} strokeWidth={16}
        strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
        style={{ transition:"stroke-dasharray 0.55s ease" }}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Line Chart — real score data
// ─────────────────────────────────────────────────────────────────────────────
function LineChart({ scores }) {
  const W=440, H=180, pL=32, pT=10, pB=28
  const iH = H - pT - pB

  const yOf = v => pT + iH - ((v - 4) / 5) * iH

  // Build up to 6 data points from most recent scores (reversed = oldest first)
  const entries = [...scores].reverse().slice(0, 6)
  const n = Math.max(entries.length, 2)
  const xOf = i => pL + (i / (n - 1)) * (W - pL - 12)

  const yTicks = [9, 8, 7, 6, 5, 4]
  const labels = entries.map((s, i) => s.label || `#${i + 1}`)

  function buildLine(field, color) {
    const pts = entries
      .map((s, i) => s[field] != null ? { x: xOf(i), y: yOf(s[field]) } : null)
      .filter(Boolean)
    if (pts.length < 1) return null
    const line = pts.length === 1
      ? null
      : "M " + pts.map(p => `${p.x},${p.y}`).join(" L ")
    const areaBase = pT + iH
    const area = pts.length >= 2
      ? `M ${pts[0].x},${pts[0].y} L ${pts.map(p=>`${p.x},${p.y}`).join(" L ")} L ${pts[pts.length-1].x},${areaBase} L ${pts[0].x},${areaBase} Z`
      : null
    return { line, area, pts, color }
  }

  const series = [
    buildLine("listening", SKILL_COLORS.Listening),
    buildLine("reading",   SKILL_COLORS.Reading),
    buildLine("writing",   SKILL_COLORS.Writing),
    buildLine("speaking",  SKILL_COLORS.Speaking),
  ].filter(Boolean)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm font-medium text-foreground">No scores logged yet</p>
        <p className="text-xs text-muted-foreground mt-1">Log a mock test in the Study Plan section</p>
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} overflow="visible">
      {yTicks.map(t => (
        <g key={t}>
          <line x1={pL} y1={yOf(t)} x2={W-12} y2={yOf(t)}
            stroke="var(--border)" strokeWidth={0.8} strokeDasharray="3 3"/>
          <text x={pL-5} y={yOf(t)+4} textAnchor="end" fontSize={9}
            fill="var(--muted-foreground)">B{t}</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={xOf(i)} y={H-4} textAnchor="middle" fontSize={9}
          fill="var(--muted-foreground)"
          style={{ maxWidth: 40, overflow: "hidden", textOverflow: "ellipsis" }}>
          {l.length > 5 ? l.slice(0, 5) + "…" : l}
        </text>
      ))}
      {series.map(({ line, area, pts, color }, si) => (
        <g key={si}>
          {area && <path d={area} fill={color} fillOpacity={0.07}/>}
          {line && <path d={line} fill="none" stroke={color} strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"/>}
          {pts.map((p, pi) => (
            <circle key={pi} cx={p.x} cy={p.y} r={3.5}
              fill={color} stroke="var(--card)" strokeWidth={1.5}/>
          ))}
        </g>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ avatarUrl, username, size = 56 }) {
  const initials = (username || "?").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", overflow:"hidden",
      border:"2.5px solid var(--primary)",
      boxShadow:"0 0 0 4px rgba(124,58,237,0.12)",
      flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--card)",
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={username}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : <span style={{ fontSize:size*0.35, fontWeight:700, color:PURPLE }}>{initials}</span>
      }
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconColor, label, value, sub, subColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4, delay }}
      className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconColor + "18" }}>
          <Icon size={14} style={{ color: iconColor }}/>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.12em]">{label}</span>
      </div>
      <div className="text-[2rem] font-bold text-foreground leading-none tracking-tight">{value}</div>
      <div className="text-xs" style={{ color: subColor || "var(--muted-foreground)" }}>{sub}</div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Period tab
// ─────────────────────────────────────────────────────────────────────────────
function PTab({ label, period, active, onClick }) {
  return (
    <button onClick={() => onClick(period)}
      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
      style={{
        background: active ? "var(--primary)" : "transparent",
        color: active ? "#fff" : "var(--muted-foreground)",
      }}>
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion card — real data
// ─────────────────────────────────────────────────────────────────────────────
function CompletionCard({ dailyPct, weeklyPct, monthlyPct, weeklyDone, weeklyTotal, dailyDone, dailyTotal }) {
  const [period, setPeriod] = useState("weekly")

  const data = {
    daily:   { pct: dailyPct,   done: dailyDone,   total: dailyTotal,   label: "today"      },
    weekly:  { pct: weeklyPct,  done: weeklyDone,   total: weeklyTotal,  label: "this week"  },
    monthly: { pct: monthlyPct, done: Math.round(weeklyDone * 4), total: Math.round(weeklyTotal * 4), label: "this month" },
  }
  const p = data[period]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">Completion</span>
        <div className="flex gap-0.5 p-1 rounded-xl bg-secondary">
          <PTab label="Day"   period="daily"   active={period==="daily"}   onClick={setPeriod}/>
          <PTab label="Week"  period="weekly"  active={period==="weekly"}  onClick={setPeriod}/>
          <PTab label="Month" period="monthly" active={period==="monthly"} onClick={setPeriod}/>
        </div>
      </div>
      <div className="flex items-center gap-6 sm:flex-col sm:items-center sm:gap-4 lg:flex-col lg:items-center">
        <div className="relative flex-shrink-0" style={{ width:140, height:140 }}>
          <Donut pct={p.pct}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{p.pct}%</span>
            <span className="text-xs text-muted-foreground">{p.label}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1 sm:flex-row sm:justify-center lg:flex-col">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:PURPLE }}/>
            Completed <span className="font-semibold text-foreground ml-1">({p.done})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-border"/>
            Remaining <span className="font-semibold text-foreground ml-1">({Math.max(0, p.total - p.done)})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Score card — real scores
// ─────────────────────────────────────────────────────────────────────────────
function ScoreCard({ scores }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">Mock Score Trends</span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"rgba(16,185,129,0.12)", color:"#10b981" }}>
          Band 7+ goal
        </span>
      </div>
      <div className="w-full overflow-hidden">
        <LineChart scores={scores}/>
      </div>
      {scores.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
          {Object.entries(SKILL_COLORS).map(([s,c]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-1.5 rounded-full flex-shrink-0" style={{ background:c }}/>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill bars — derived from score history (best per skill)
// ─────────────────────────────────────────────────────────────────────────────
function SkillBarsCard({ scores, planMeta, activeWeekIdx, totalWeeks }) {
  // Best score per skill as percentage of band 9 (max)
  const best = { Listening: null, Reading: null, Writing: null, Speaking: null }
  scores.forEach(s => {
    if (s.listening != null && (best.Listening == null || s.listening > best.Listening)) best.Listening = s.listening
    if (s.reading   != null && (best.Reading   == null || s.reading   > best.Reading))   best.Reading   = s.reading
    if (s.writing   != null && (best.Writing   == null || s.writing   > best.Writing))   best.Writing   = s.writing
    if (s.speaking  != null && (best.Speaking  == null || s.speaking  > best.Speaking)) best.Speaking  = s.speaking
  })

  const bars = Object.entries(SKILL_COLORS).map(([label, color]) => {
    const val = best[label]
    // Convert band score (4–9) to percentage 0–100
    const pct = val == null ? 0 : Math.round(((val - 4) / 5) * 100)
    const display = val == null ? "—" : val
    return { label, color, pct, display }
  })

  const currentWeekLabel = planMeta
    ? `Week ${activeWeekIdx + 1} of ${totalWeeks}`
    : "—"

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">Best Scores</span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>
          {currentWeekLabel}
        </span>
      </div>

      {scores.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-xs text-muted-foreground">Log mock scores to see your progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bars.map(({ label, color, pct, display }, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
              <div className="flex-1 rounded-full overflow-hidden"
                style={{ height:5, background:"var(--border)" }}>
                <motion.div className="h-full rounded-full" style={{ background:color }}
                  initial={{ width:0 }} animate={{ width:`${pct}%` }}
                  transition={{ duration:0.7, ease:"easeOut", delay:0.1 + i * 0.07 }}/>
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-8 text-right"
                style={{ color: pct > 0 ? color : undefined }}>
                {display}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Next Tasks card — real upcoming tasks
// ─────────────────────────────────────────────────────────────────────────────
const TASK_BADGE_LABELS = ["Up next", "After that", "Then"]
const TASK_BADGE_STYLES = [
  { bg:"rgba(124,58,237,0.12)", color:PURPLE },
  { bg:"rgba(14,165,233,0.12)", color:"#0ea5e9" },
  { bg:"rgba(16,185,129,0.12)", color:"#10b981" },
]
const TASK_ICON_BG = [
  "rgba(124,58,237,0.12)",
  "rgba(14,165,233,0.12)",
  "rgba(16,185,129,0.12)",
]

function NextCard({ tasks, planMeta }) {
  const noTasks = tasks.length === 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">What's Next</span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"rgba(124,58,237,0.12)", color:PURPLE }}>
          {noTasks ? "All done 🎉" : `${tasks.length} task${tasks.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {noTasks ? (
        <div className="flex flex-col items-center py-8 text-center flex-1">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-sm font-medium text-foreground">Plan complete!</p>
          <p className="text-xs text-muted-foreground mt-1">All tasks are done</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.2 + i * 0.08 }}
              className="flex items-start gap-3 px-3 py-3 rounded-xl"
              style={{ background:"var(--secondary)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: TASK_ICON_BG[i] || TASK_ICON_BG[0] }}>
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</div>
                {t.pct > 0 && (
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background:"var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width:`${t.pct}%`, background:PURPLE }}/>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 whitespace-nowrap"
                style={TASK_BADGE_STYLES[i] || TASK_BADGE_STYLES[0]}>
                {TASK_BADGE_LABELS[i] || "Next"}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <a href="#study-plan"
        className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary
          hover:opacity-80 transition-opacity py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5">
        View full study plan <ChevronRight size={12}/>
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown card
// ─────────────────────────────────────────────────────────────────────────────
function CountdownCard() {
  const [examDate, setExamDate] = useState(() => localStorage.getItem("ielts_exam_date") || "")
  const [inputVal, setInputVal] = useState(() => localStorage.getItem("ielts_exam_date") || "")
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  const calcTime = useCallback((dateStr) => {
    const diff = new Date(dateStr + "T08:00:00").getTime() - Date.now()
    if (diff <= 0) return { d:0, h:0, m:0, s:0, expired:true }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    }
  }, [])

  useEffect(() => {
    if (!examDate) { setTimeLeft(null); return }
    setTimeLeft(calcTime(examDate))
    timerRef.current = setInterval(() => setTimeLeft(calcTime(examDate)), 1000)
    return () => clearInterval(timerRef.current)
  }, [examDate, calcTime])

  function handleSet() {
    if (!inputVal) return
    localStorage.setItem("ielts_exam_date", inputVal)
    setExamDate(inputVal)
  }
  function handleClear() {
    localStorage.removeItem("ielts_exam_date")
    clearInterval(timerRef.current)
    setExamDate(""); setInputVal(""); setTimeLeft(null)
  }

  const isUrgent = timeLeft && !timeLeft.expired && timeLeft.d <= 30
  const fmtDate  = examDate
    ? new Date(examDate).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
    : ""

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={14} className="text-primary"/>
          <span className="text-sm font-semibold text-foreground">IELTS Countdown</span>
        </div>
        {isUrgent && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background:"rgba(239,68,68,0.12)", color:"#ef4444" }}>
            Approaching
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {timeLeft ? (
          <motion.div key="timer"
            initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
            <div className="flex items-end justify-center gap-2 mb-3">
              {[
                { v: timeLeft.d,                         l:"days" },
                { v: String(timeLeft.h).padStart(2,"0"), l:"hrs"  },
                { v: String(timeLeft.m).padStart(2,"0"), l:"min"  },
                { v: String(timeLeft.s).padStart(2,"0"), l:"sec"  },
              ].map(({ v, l }, i) => (
                <div key={l} className="flex items-end gap-2">
                  {i > 0 && <span className="text-2xl font-bold text-muted-foreground mb-3.5 leading-none">:</span>}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-foreground tabular-nums leading-none
                      px-3 py-2 rounded-xl bg-secondary border border-border min-w-[3rem] text-center">
                      {v}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5">{l}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mb-1">
              {timeLeft.expired ? "🎉 Exam day — good luck!" : `Exam on ${fmtDate}`}
            </p>
          </motion.div>
        ) : (
          <motion.div key="empty"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="flex flex-col items-center py-5 mb-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background:"var(--secondary)", border:"1px solid var(--border)" }}>
              <CalendarClock size={22} className="text-muted-foreground"/>
            </div>
            <p className="text-sm font-medium text-foreground">Set your exam date</p>
            <p className="text-xs text-muted-foreground mt-1">We'll count down live to your test</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mt-2">
        <input type="date" value={inputVal} onChange={e => setInputVal(e.target.value)}
          className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary
            text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          style={{ fontFamily:"inherit", colorScheme:"light dark" }}/>
        <button onClick={handleSet}
          className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ background:PURPLE }}>
          Set
        </button>
        {examDate && (
          <button onClick={handleClear}
            className="text-xs font-medium px-3 py-2.5 rounded-xl border border-border
              text-muted-foreground hover:bg-secondary transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressDashboard({ user, username, avatarUrl }) {
  const displayName = username || user?.email?.split("@")[0] || "there"

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)   // plan id string
  const [scores,       setScores]       = useState([])     // score_history rows
  const [trigger,      setTrigger]      = useState(0)      // refreshes derived stats

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return }

    async function load() {
      try {
        // 1. Selected plan
        const savedPlanLocal = localStorage.getItem("ielts-selected-plan") || "sprint"
        const savedPlanDb    = await loadSelectedPlan(user.id)
        const planId         = savedPlanDb || savedPlanLocal
        setSelectedPlan(planId)

        // 2. Study progress — hydrate localStorage (same as StudyPlanSection)
        const progress = await loadUserProgress(user.id)
        progress.forEach(row => {
          const key = `${user.id}-${row.plan}-week-${row.week}-day-${row.day}-${row.task}`
          localStorage.setItem(key, JSON.stringify(row.completed_indices ?? []))
        })

        // 3. Scores
        const { data: scoreData } = await supabase
          .from("score_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50)
        if (scoreData) {
          setScores(scoreData)
          localStorage.setItem("ielts-scores", JSON.stringify(scoreData))
        } else {
          // Fall back to cache
          try {
            const cached = JSON.parse(localStorage.getItem("ielts-scores") || "null") ?? []
            setScores(cached)
          } catch {}
        }
      } catch (err) {
        console.error("Dashboard load error:", err)
        // Graceful fallback — use whatever is in localStorage
        const planId = localStorage.getItem("ielts-selected-plan") || "sprint"
        setSelectedPlan(planId)
        try {
          const cached = JSON.parse(localStorage.getItem("ielts-scores") || "null") ?? []
          setScores(cached)
        } catch {}
      } finally {
        setLoading(false)
        setTrigger(t => t + 1)
      }
    }

    load()

    // Re-sync when score_history changes (e.g. user logs a score in StudyPlanSection)
    const channel = supabase
      .channel("score_history_changes")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "score_history",
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        const { data } = await supabase
          .from("score_history").select("*")
          .eq("user_id", user.id).order("created_at", { ascending:false }).limit(50)
        if (data) { setScores(data); localStorage.setItem("ielts-scores", JSON.stringify(data)) }
      })
      .subscribe()

    // Also listen for storage events (when StudyPlanSection updates localStorage)
    function onStorage(e) {
      if (e.key && e.key.includes(user.id)) setTrigger(t => t + 1)
    }
    window.addEventListener("storage", onStorage)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener("storage", onStorage)
    }
  }, [user])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const planId      = selectedPlan || localStorage.getItem("ielts-selected-plan") || "sprint"
  const planMeta    = PLAN_META.find(p => p.id === planId) || PLAN_META[0]
  const weeklyPlans = PLANS[planId] || PLANS.sprint

  const { totalSubtasks, completedSubtasks, weeklyBreakdown } =
    computePlanProgress(planId, weeklyPlans, user?.id)

  const activeWeekIdx = findActiveWeekIdx(weeklyBreakdown)
  const activeWeek    = weeklyBreakdown[activeWeekIdx] || weeklyBreakdown[0] || { pct:0, total:0, completed:0 }

  const streak = computeStreak(planId, weeklyPlans, user?.id)

  const nextTasks = getNextTasks(planId, weeklyPlans, user?.id, activeWeekIdx)

  // Overall plan completion
  const planPct = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100)

  // Weekly
  const weeklyPct   = activeWeek.pct
  const weeklyDone  = activeWeek.completed
  const weeklyTotal = activeWeek.total

  // Daily = today's week day (approximate: use active week day 1)
  const todayWeek   = weeklyBreakdown[activeWeekIdx]
  const dailyDone   = Math.round((todayWeek?.completed || 0) / Math.max(weeklyPlans[activeWeekIdx]?.days?.length || 1, 1))
  const dailyTotal  = Math.round((todayWeek?.total || 0) / Math.max(weeklyPlans[activeWeekIdx]?.days?.length || 1, 1))
  const dailyPct    = dailyTotal === 0 ? 0 : Math.round((dailyDone / dailyTotal) * 100)

  // Latest full mock avg
  const latestFull = scores.find(s =>
    s.listening != null && s.reading != null && s.writing != null && s.speaking != null
  )
  const avgScore = latestFull
    ? calcOverall(latestFull.listening, latestFull.reading, latestFull.writing, latestFull.speaking)
    : null

  // Score trend vs previous full mock
  const fullMocks = scores.filter(s =>
    s.listening != null && s.reading != null && s.writing != null && s.speaking != null
  )
  let scoreTrend = null
  if (fullMocks.length >= 2) {
    const curr = calcOverall(fullMocks[0].listening, fullMocks[0].reading, fullMocks[0].writing, fullMocks[0].speaking)
    const prev = calcOverall(fullMocks[1].listening, fullMocks[1].reading, fullMocks[1].writing, fullMocks[1].speaking)
    scoreTrend = Math.round((curr - prev) * 10) / 10
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="relative bg-background" style={{ paddingTop:"clamp(6.5rem,10vw,9rem)", paddingBottom:"4rem" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary"/>
        </div>
      </section>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      id="dashboard"
      className="relative bg-background overflow-hidden"
      style={{ paddingTop:"clamp(6.5rem,10vw,9rem)", paddingBottom:"4rem" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 -translate-x-1/2" style={{
          top:"-180px", width:"800px", height:"500px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)",
          filter:"blur(60px)",
        }}/>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5 }}
          className="flex items-center justify-between gap-4 mb-8 flex-wrap"
        >
          <div className="flex items-center gap-4">
            <Avatar avatarUrl={avatarUrl} username={username || displayName} size={56}/>
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-[.28em] mb-1">✦ Dashboard</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Welcome back, <span className="text-primary capitalize">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {planMeta.label} · Week {activeWeekIdx + 1} of {weeklyPlans.length}
                {streak > 0 && ` · ${streak} day streak 🔥`}
              </p>
            </div>
          </div>

          <a href="https://www.jumpinto.com/ielts/practice"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
              hover:opacity-90 transition-opacity flex-shrink-0"
            style={{
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              boxShadow:"0 4px 14px rgba(124,58,237,0.3)",
            }}>
            <ExternalLink size={13}/>
            Open Jumpinto
          </a>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            icon={Flame} iconColor="#f97316" label="Day Streak"
            value={streak > 0 ? streak : "—"}
            sub={streak > 0 ? `day${streak > 1 ? "s" : ""} in a row` : "Complete a full day to start"}
            subColor={streak > 0 ? "#f97316" : undefined}
            delay={0.10}
          />
          <StatCard
            icon={CheckSquare} iconColor="#7c3aed" label="Tasks Done"
            value={completedSubtasks}
            sub={`of ${totalSubtasks} total subtasks`}
            delay={0.15}
          />
          <StatCard
            icon={TrendingUp} iconColor="#10b981" label="Avg Mock Score"
            value={avgScore != null ? avgScore : "—"}
            sub={
              scoreTrend != null
                ? `${scoreTrend >= 0 ? "↑" : "↓"} ${Math.abs(scoreTrend)} band vs last mock`
                : scores.length > 0 ? "Log a full mock to compare" : "No scores logged yet"
            }
            subColor={scoreTrend != null ? (scoreTrend >= 0 ? "#10b981" : "#ef4444") : undefined}
            delay={0.20}
          />
          <StatCard
            icon={Target} iconColor="#0ea5e9" label="Band Target"
            value={planMeta.targetBand || "7.0+"}
            sub={`${planMeta.label} goal · ${planPct}% complete`}
            delay={0.25}
          />
        </div>

        {/* ── CHARTS ROW ── */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.45, delay:0.2 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-4"
        >
          <CompletionCard
            dailyPct={dailyPct}   dailyDone={dailyDone}   dailyTotal={dailyTotal}
            weeklyPct={weeklyPct} weeklyDone={weeklyDone} weeklyTotal={weeklyTotal}
            monthlyPct={planPct}
          />
          <ScoreCard scores={scores}/>
        </motion.div>

        {/* ── BOTTOM ROW ── */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.45, delay:0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <SkillBarsCard
            scores={scores}
            planMeta={planMeta}
            activeWeekIdx={activeWeekIdx}
            totalWeeks={weeklyPlans.length}
          />
          <NextCard tasks={nextTasks} planMeta={planMeta}/>
          <CountdownCard/>
        </motion.div>

      </div>
    </section>
  )
}
