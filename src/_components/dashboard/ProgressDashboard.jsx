/**
 * ProgressDashboard.jsx
 *
 * Data sources (all real, no hardcoded values):
 *  ─ localStorage  — exact same keys as StudyPlanSection
 *  ─ Supabase      — score_history, study_progress, user_preferences
 *  ─ PLAN_META / PLANS — same import as StudyPlanSection
 *
 * Real-time sync:
 *  ─ BroadcastChannel("ielts-progress") — fires on every task toggle, score
 *    save/delete, or plan change inside StudyPlanSection (same tab)
 *  ─ Supabase Realtime on score_history (cross-tab / cross-device)
 *
 * Props: { user, username, avatarUrl }
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  TrendingUp, Flame, CheckSquare, Target, CalendarClock,
  ChevronRight, ExternalLink, Loader2,
} from "lucide-react"
import { supabase }                                           from "../_lib/supabase"
import { PLAN_META, PLANS }                                   from "../_lib/study-plan-data"
import { loadUserProgress, loadSelectedPlan }                  from "../../lib/progress"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PURPLE = "#7c3aed"

const SKILL_COLORS = {
  Listening: "#7c3aed",
  Reading:   "#0ea5e9",
  Writing:   "#f59e0b",
  Speaking:  "#10b981",
}

// Today's date string for the date input min attribute (YYYY-MM-DD)
const todayStr = () => new Date().toISOString().split("T")[0]

// ─────────────────────────────────────────────────────────────────────────────
// IELTS band rounding (nearest 0.5)
// ─────────────────────────────────────────────────────────────────────────────
function calcOverall(L, R, W, S) {
  return Math.round(((L + R + W + S) / 4) * 2) / 2
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress calculation — EXACT KEY MATCH with StudyPlanSection
//
// StudyPlanSection key formula (from TaskBlock + calculateWeekProgress):
//   globalDay = (weekPlan.week - 1) * 5 + day.day
//   key = `${userId}-${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
//
// This function replicates that formula exactly.
// ─────────────────────────────────────────────────────────────────────────────
function readProgress(planId, weeklyPlans, userId) {
  let totalAll = 0, completedAll = 0
  const perWeek = []

  weeklyPlans.forEach(weekPlan => {
    let wTotal = 0, wCompleted = 0

    weekPlan.days.forEach(day => {
      // EXACT formula from StudyPlanSection
      const globalDay = (weekPlan.week - 1) * 5 + day.day

      ;[day.morning, day.afternoon].forEach(task => {
        const count = task.subtasks.length
        wTotal     += count
        totalAll   += count

        // EXACT key from TaskBlock
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`

        let done = 0
        try {
          const raw = localStorage.getItem(key)
          if (raw) done = JSON.parse(raw).length
        } catch {}

        wCompleted   += done
        completedAll += done
      })
    })

    perWeek.push({
      week:      weekPlan.week,
      label:     weekPlan.label || `Week ${weekPlan.week}`,
      total:     wTotal,
      completed: wCompleted,
      pct:       wTotal === 0 ? 0 : Math.round((wCompleted / wTotal) * 100),
    })
  })

  return {
    totalAll,
    completedAll,
    perWeek,
    planPct: totalAll === 0 ? 0 : Math.round((completedAll / totalAll) * 100),
  }
}

// Active week = first week not at 100%, or last week if all done
function findActiveWeek(perWeek) {
  const idx = perWeek.findIndex(w => w.pct < 100)
  return idx === -1 ? perWeek.length - 1 : idx
}

// Streak: consecutive fully-done days counted backwards from the last done day
function calcStreak(planId, weeklyPlans, userId) {
  const daysDone = []

  weeklyPlans.forEach(weekPlan => {
    weekPlan.days.forEach(day => {
      const globalDay = (weekPlan.week - 1) * 5 + day.day
      let total = 0, completed = 0

      ;[day.morning, day.afternoon].forEach(task => {
        total += task.subtasks.length
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
        try {
          const raw = localStorage.getItem(key)
          if (raw) completed += JSON.parse(raw).length
        } catch {}
      })

      daysDone.push(total > 0 && completed === total)
    })
  })

  // Walk backwards from last done day
  const lastDone = daysDone.lastIndexOf(true)
  if (lastDone === -1) return 0
  let streak = 0
  for (let i = lastDone; i >= 0; i--) {
    if (daysDone[i]) streak++
    else break
  }
  return streak
}

// Next 3 incomplete tasks from active week onwards
function getNextTasks(planId, weeklyPlans, userId, activeWeekIdx) {
  const results = []

  for (let wi = activeWeekIdx; wi < weeklyPlans.length && results.length < 3; wi++) {
    const weekPlan = weeklyPlans[wi]

    for (let di = 0; di < weekPlan.days.length && results.length < 3; di++) {
      const day       = weekPlan.days[di]
      const globalDay = (weekPlan.week - 1) * 5 + day.day

      for (const { task, period } of [
        { task: day.morning,   period: "Morning"   },
        { task: day.afternoon, period: "Afternoon" },
      ]) {
        if (results.length >= 3) break

        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`

        let done = 0
        try { const raw = localStorage.getItem(key); if (raw) done = JSON.parse(raw).length } catch {}

        if (done < task.subtasks.length) {
          const t = task.title.toLowerCase()
          const icon = t.includes("listening") ? "🎧"
            : t.includes("reading")                         ? "📖"
            : t.includes("writing") || t.includes("task")  ? "✍️"
            : t.includes("speaking")                        ? "🎙️"
            : t.includes("mock") || t.includes("test")      ? "📝"
            : "📌"

          results.push({
            icon,
            title: task.title,
            sub:   `Week ${weekPlan.week} · Day ${day.day} · ${period}`,
            pct:   task.subtasks.length === 0 ? 0 : Math.round((done / task.subtasks.length) * 100),
          })
        }
      }
    }
  }
  return results
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
        style={{ transition:"stroke-dasharray 0.45s ease" }}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Line Chart — real score_history data
// ─────────────────────────────────────────────────────────────────────────────
function LineChart({ scores }) {
  const W=440, H=180, pL=32, pT=10, pB=28
  const iH = H - pT - pB
  const yOf = v => pT + iH - ((v - 4) / 5) * iH

  // Oldest → newest, max 6
  const entries = [...scores].reverse().slice(-6)
  const n = Math.max(entries.length, 2)
  const xOf = i => pL + (i / (n - 1)) * (W - pL - 12)

  const yTicks = [9, 8, 7, 6, 5, 4]

  function series(field, color) {
    const pts = entries
      .map((s, i) => s[field] != null ? { x: xOf(i), y: yOf(s[field]) } : null)
      .filter(Boolean)
    if (!pts.length) return null
    const line = pts.length > 1
      ? "M " + pts.map(p => `${p.x},${p.y}`).join(" L ")
      : null
    const area = pts.length > 1
      ? `M ${pts[0].x},${pts[0].y} L ${pts.map(p=>`${p.x},${p.y}`).join(" L ")} L ${pts[pts.length-1].x},${pT+iH} L ${pts[0].x},${pT+iH} Z`
      : null
    return { line, area, pts, color }
  }

  const allSeries = [
    series("listening", SKILL_COLORS.Listening),
    series("reading",   SKILL_COLORS.Reading),
    series("writing",   SKILL_COLORS.Writing),
    series("speaking",  SKILL_COLORS.Speaking),
  ].filter(Boolean)

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm font-medium text-foreground">No scores logged yet</p>
        <p className="text-xs text-muted-foreground mt-1">Log a mock in the Study Plan section below</p>
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
      {entries.map((s, i) => {
        const lbl = s.label || `#${i+1}`
        return (
          <text key={i} x={xOf(i)} y={H-4} textAnchor="middle" fontSize={9}
            fill="var(--muted-foreground)">
            {lbl.length > 6 ? lbl.slice(0,6)+"…" : lbl}
          </text>
        )
      })}
      {allSeries.map(({ line, area, pts, color }, si) => (
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
        ? <img src={avatarUrl} alt={username} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
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
          style={{ backgroundColor:iconColor+"18" }}>
          <Icon size={14} style={{ color:iconColor }}/>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.12em]">{label}</span>
      </div>
      <div className="text-[2rem] font-bold text-foreground leading-none tracking-tight">{value}</div>
      <div className="text-xs" style={{ color:subColor || "var(--muted-foreground)" }}>{sub}</div>
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
// Shared navigator arrow used inside CompletionCard
// ─────────────────────────────────────────────────────────────────────────────
function NavArrow({ dir, enabled, onClick }) {
  const path = dir === "prev" ? "M7.5 2L4 6l3.5 4" : "M4.5 2L8 6l-3.5 4"
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
      style={{
        background: enabled ? "var(--secondary)" : "transparent",
        color:      enabled ? "var(--foreground)" : "var(--border)",
        cursor:     enabled ? "pointer" : "default",
      }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion card
// ─────────────────────────────────────────────────────────────────────────────
function CompletionCard({ perWeek, planPct, activeWeekIdx, weeklyPlans, planId, userId, planUnit }) {
  const [period, setPeriod] = useState("weekly")

  // ── Week navigator (all plans) ─────────────────────────────────────────────
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(activeWeekIdx)
  useEffect(() => { setSelectedWeekIdx(activeWeekIdx) }, [activeWeekIdx])
  const selectedWeek = perWeek[selectedWeekIdx] || { pct:0, completed:0, total:0 }

  // ── Day navigator (within the selected week) ───────────────────────────────
  // Build per-day data for the selected week by reading the same localStorage keys
  const perDay = (() => {
    const weekPlan = weeklyPlans[selectedWeekIdx]
    if (!weekPlan) return []
    return weekPlan.days.map(day => {
      const globalDay = (weekPlan.week - 1) * 5 + day.day
      let total = 0, completed = 0
      ;[day.morning, day.afternoon].forEach(task => {
        total += task.subtasks.length
        const key = userId
          ? `${userId}-${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
          : `${planId}-week-${weekPlan.week}-day-${globalDay}-${task.title}`
        try { const raw = localStorage.getItem(key); if (raw) completed += JSON.parse(raw).length } catch {}
      })
      const pct = total === 0 ? 0
        : completed === total ? 100
        : Math.round((completed / total) * 100)
      return { label: `Day ${day.day}`, total, completed, pct }
    })
  })()

  // Active day = first incomplete, or last if all done
  const activeDayIdx = (() => {
    const idx = perDay.findIndex(d => d.pct < 100)
    return idx === -1 ? Math.max(0, perDay.length - 1) : idx
  })()
  const [selectedDayIdx, setSelectedDayIdx] = useState(activeDayIdx)
  // Reset day when week changes
  useEffect(() => { setSelectedDayIdx(activeDayIdx) }, [selectedWeekIdx])

  const selectedDay = perDay[selectedDayIdx] || { pct:0, completed:0, total:0, label:"Day 1" }

  // ── Month navigator (plans B & C — unit === "Month") ───────────────────────
  // Each month = 4 weeks. Group perWeek into months.
  const isMonthPlan = planUnit === "Month"
  const perMonth = (() => {
    if (!isMonthPlan) return []
    const months = []
    for (let i = 0; i < perWeek.length; i += 4) {
      const slice = perWeek.slice(i, i + 4)
      const total     = slice.reduce((a, w) => a + w.total,     0)
      const completed = slice.reduce((a, w) => a + w.completed, 0)
      const pct = total === 0 ? 0
        : completed === total ? 100
        : Math.round((completed / total) * 100)
      months.push({ label: `Month ${months.length + 1}`, total, completed, pct })
    }
    return months
  })()

  const activeMonthIdx = (() => {
    const idx = perMonth.findIndex(m => m.pct < 100)
    return idx === -1 ? Math.max(0, perMonth.length - 1) : idx
  })()
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(activeMonthIdx)
  useEffect(() => { setSelectedMonthIdx(activeMonthIdx) }, [activeWeekIdx])

  const selectedMonth = perMonth[selectedMonthIdx] || { pct:0, completed:0, total:0, label:"Month 1" }

  // ── Data for the donut depending on active period ──────────────────────────
  const data = {
    daily:   { pct: selectedDay.pct,   done: selectedDay.completed,   total: selectedDay.total,
               label: selectedDay.label },
    weekly:  { pct: selectedWeek.pct,  done: selectedWeek.completed,  total: selectedWeek.total,
               label: selectedWeek.label || `Week ${selectedWeekIdx + 1}` },
    monthly: isMonthPlan
      ? { pct: selectedMonth.pct, done: selectedMonth.completed, total: selectedMonth.total,
          label: selectedMonth.label }
      : { pct: planPct,           done: perWeek.reduce((a,w)=>a+w.completed,0),
          total: perWeek.reduce((a,w)=>a+w.total,0),                            label: "overall" },
  }
  const p = data[period]

  // ── Badge helper ───────────────────────────────────────────────────────────
  function Badge({ isActive, isDone }) {
    if (isDone)    return <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background:"rgba(16,185,129,0.12)", color:"#10b981" }}>✓ done</span>
    if (isActive)  return <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background:"rgba(124,58,237,0.12)", color:PURPLE }}>current</span>
    return null
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">Completion</span>
        <div className="flex gap-0.5 p-1 rounded-xl bg-secondary">
          <PTab label="Day"     period="daily"   active={period==="daily"}   onClick={setPeriod}/>
          <PTab label="Week"    period="weekly"  active={period==="weekly"}  onClick={setPeriod}/>
          <PTab label={isMonthPlan ? "Month" : "Overall"} period="monthly" active={period==="monthly"} onClick={setPeriod}/>
        </div>
      </div>

      {/* Day navigator */}
      {period === "daily" && perDay.length > 1 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <NavArrow dir="prev" enabled={selectedDayIdx > 0}
            onClick={() => setSelectedDayIdx(i => Math.max(0, i - 1))}/>
          <span className="text-[11px] font-semibold text-foreground">
            {selectedDay.label}
            <Badge isActive={selectedDayIdx === activeDayIdx} isDone={selectedDay.pct === 100}/>
          </span>
          <NavArrow dir="next" enabled={selectedDayIdx < perDay.length - 1}
            onClick={() => setSelectedDayIdx(i => Math.min(perDay.length - 1, i + 1))}/>
        </div>
      )}

      {/* Week navigator */}
      {period === "weekly" && perWeek.length > 1 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <NavArrow dir="prev" enabled={selectedWeekIdx > 0}
            onClick={() => setSelectedWeekIdx(i => Math.max(0, i - 1))}/>
          <span className="text-[11px] font-semibold text-foreground">
            {selectedWeek.label || `Week ${selectedWeekIdx + 1}`}
            <Badge isActive={selectedWeekIdx === activeWeekIdx} isDone={selectedWeek.pct === 100}/>
          </span>
          <NavArrow dir="next" enabled={selectedWeekIdx < perWeek.length - 1}
            onClick={() => setSelectedWeekIdx(i => Math.min(perWeek.length - 1, i + 1))}/>
        </div>
      )}

      {/* Month navigator — only for plans B & C */}
      {period === "monthly" && isMonthPlan && perMonth.length > 1 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <NavArrow dir="prev" enabled={selectedMonthIdx > 0}
            onClick={() => setSelectedMonthIdx(i => Math.max(0, i - 1))}/>
          <span className="text-[11px] font-semibold text-foreground">
            {selectedMonth.label}
            <Badge isActive={selectedMonthIdx === activeMonthIdx} isDone={selectedMonth.pct === 100}/>
          </span>
          <NavArrow dir="next" enabled={selectedMonthIdx < perMonth.length - 1}
            onClick={() => setSelectedMonthIdx(i => Math.min(perMonth.length - 1, i + 1))}/>
        </div>
      )}

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
// Score card
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
// Skill bars — personal best per skill from score history
// ─────────────────────────────────────────────────────────────────────────────
function SkillBarsCard({ scores, activeWeekIdx, totalWeeks }) {
  const best = { Listening:null, Reading:null, Writing:null, Speaking:null }
  scores.forEach(s => {
    if (s.listening != null && (best.Listening == null || s.listening > best.Listening)) best.Listening = s.listening
    if (s.reading   != null && (best.Reading   == null || s.reading   > best.Reading))   best.Reading   = s.reading
    if (s.writing   != null && (best.Writing   == null || s.writing   > best.Writing))   best.Writing   = s.writing
    if (s.speaking  != null && (best.Speaking  == null || s.speaking  > best.Speaking))  best.Speaking  = s.speaking
  })

  const bars = Object.entries(SKILL_COLORS).map(([label, color]) => {
    const val = best[label]
    const pct = val == null ? 0 : Math.round(((val - 4) / 5) * 100)
    return { label, color, pct, display: val == null ? "—" : val }
  })

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">Best Scores</span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>
          Week {activeWeekIdx + 1} of {totalWeeks}
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
              <span className="text-xs font-semibold w-8 text-right"
                style={{ color: pct > 0 ? color : "var(--muted-foreground)" }}>
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
// Next tasks
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_STYLES = [
  { bg:"rgba(124,58,237,0.12)", color:PURPLE },
  { bg:"rgba(14,165,233,0.12)", color:"#0ea5e9" },
  { bg:"rgba(16,185,129,0.12)", color:"#10b981" },
]
const BADGE_LABELS = ["Up next", "After that", "Then"]
const ICON_BG = [
  "rgba(124,58,237,0.12)",
  "rgba(14,165,233,0.12)",
  "rgba(16,185,129,0.12)",
]

function NextCard({ tasks }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">What's Next</span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"rgba(124,58,237,0.12)", color:PURPLE }}>
          {tasks.length === 0 ? "All done 🎉" : `${tasks.length} task${tasks.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center flex-1">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-sm font-medium text-foreground">Plan complete!</p>
          <p className="text-xs text-muted-foreground mt-1">All tasks are finished</p>
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
                style={{ background:ICON_BG[i] || ICON_BG[0] }}>
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
                style={BADGE_STYLES[i] || BADGE_STYLES[0]}>
                {BADGE_LABELS[i] || "Next"}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <a href="#study-plan"
        className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary
          hover:opacity-80 transition-all py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5">
        View full study plan <ChevronRight size={12}/>
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown — future dates only
// ─────────────────────────────────────────────────────────────────────────────
function CountdownCard() {
  const [examDate, setExamDate] = useState(() => localStorage.getItem("ielts_exam_date") || "")
  const [inputVal, setInputVal] = useState(() => localStorage.getItem("ielts_exam_date") || "")
  const [timeLeft, setTimeLeft] = useState(null)
  const [dateError, setDateError] = useState("")
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
    setDateError("")
    if (!inputVal) { setDateError("Please pick a date first"); return }

    // Enforce future date
    const picked = new Date(inputVal + "T00:00:00")
    const today  = new Date(); today.setHours(0,0,0,0)
    if (picked <= today) {
      setDateError("Exam date must be in the future")
      return
    }

    localStorage.setItem("ielts_exam_date", inputVal)
    setExamDate(inputVal)
  }

  function handleClear() {
    localStorage.removeItem("ielts_exam_date")
    clearInterval(timerRef.current)
    setExamDate(""); setInputVal(""); setTimeLeft(null); setDateError("")
  }

  const isUrgent = timeLeft && !timeLeft.expired && timeLeft.d <= 30
  const fmtDate  = examDate
    ? new Date(examDate).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
    : ""

  // Minimum date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

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
        <input
          type="date"
          value={inputVal}
          min={minDate}
          onChange={e => { setInputVal(e.target.value); setDateError("") }}
          className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary
            text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          style={{ fontFamily:"inherit", colorScheme:"light dark" }}
        />
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

      {/* Validation error */}
      {dateError && (
        <p className="text-xs mt-2 text-red-400 flex items-center gap-1">
          <span>⚠</span> {dateError}
        </p>
      )}
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
  const [selectedPlan, setSelectedPlan] = useState("sprint")
  const [scores,       setScores]       = useState([])
  // trigger forces a re-derive of all localStorage-based stats
  const [trigger,      setTrigger]      = useState(0)
  const refresh = useCallback(() => setTrigger(t => t + 1), [])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return }

    async function load() {
      try {
        // 1. Plan
        const planLocal = localStorage.getItem("ielts-selected-plan") || "sprint"
        const planDb    = await loadSelectedPlan(user.id).catch(() => null)
        const planId    = planDb || planLocal
        setSelectedPlan(planId)

        // 2. Hydrate progress into localStorage (same as StudyPlanSection does on mount)
        const progress = await loadUserProgress(user.id).catch(() => [])
        progress.forEach(row => {
          const key = `${user.id}-${row.plan}-week-${row.week}-day-${row.day}-${row.task}`
          localStorage.setItem(key, JSON.stringify(row.completed_indices ?? []))
        })

        // 3. Scores
        const { data: sd } = await supabase
          .from("score_history").select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending:false })
          .limit(50)
        const freshScores = sd ?? []
        setScores(freshScores)
        localStorage.setItem("ielts-scores", JSON.stringify(freshScores))
      } catch (err) {
        console.error("Dashboard load:", err)
        // Graceful fallback from cache
        setSelectedPlan(localStorage.getItem("ielts-selected-plan") || "sprint")
        try { setScores(JSON.parse(localStorage.getItem("ielts-scores") || "[]")) } catch {}
      } finally {
        setLoading(false)
        refresh()
      }
    }

    load()

    // ── Real-time: BroadcastChannel (same tab) ─────────────────────────────
    // Fires when StudyPlanSection toggles a task, saves/deletes a score,
    // or the user switches plan.
    let bc
    try {
      bc = new BroadcastChannel("ielts-progress")
      bc.onmessage = (e) => {
        if (e.data?.type === "task") {
          // Re-derive all localStorage stats immediately
          refresh()
        }
        if (e.data?.type === "scores") {
          // Pull fresh scores from cache then refresh
          try { setScores(JSON.parse(localStorage.getItem("ielts-scores") || "[]")) } catch {}
          refresh()
        }
        if (e.data?.type === "plan" && e.data.planId) {
          setSelectedPlan(e.data.planId)
          refresh()
        }
      }
    } catch {}

    // ── Real-time: Supabase Realtime (cross-tab / cross-device) ───────────
    const channel = supabase
      .channel(`dash_scores_${user.id}`)
      .on("postgres_changes", {
        event: "*", schema:"public", table:"score_history",
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        const { data } = await supabase
          .from("score_history").select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending:false })
          .limit(50)
        if (data) {
          setScores(data)
          localStorage.setItem("ielts-scores", JSON.stringify(data))
          refresh()
        }
      })
      .subscribe()

    // ── Also listen for user_preferences changes (plan switch from another tab) ──
    const prefChannel = supabase
      .channel(`dash_prefs_${user.id}`)
      .on("postgres_changes", {
        event: "*", schema:"public", table:"user_preferences",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const planId = payload.new?.selected_plan
        if (planId) { setSelectedPlan(planId); refresh() }
      })
      .subscribe()

    return () => {
      try { bc?.close() } catch {}
      supabase.removeChannel(channel)
      supabase.removeChannel(prefChannel)
    }
  }, [user, refresh])

  // ── Derived stats (re-computed on every trigger) ───────────────────────────
  const planId      = selectedPlan || "sprint"
  const planMeta    = PLAN_META.find(p => p.id === planId) || PLAN_META[0]
  const weeklyPlans = PLANS[planId] || PLANS.sprint

  const { totalAll, completedAll, perWeek, planPct } =
    readProgress(planId, weeklyPlans, user?.id)

  const activeWeekIdx = findActiveWeek(perWeek)
  const streak        = calcStreak(planId, weeklyPlans, user?.id)
  const nextTasks     = getNextTasks(planId, weeklyPlans, user?.id, activeWeekIdx)

  // Scores
  const fullMocks = scores.filter(s =>
    s.listening != null && s.reading != null && s.writing != null && s.speaking != null
  )
  const latestFull = fullMocks[0] || null
  const avgScore   = latestFull
    ? calcOverall(latestFull.listening, latestFull.reading, latestFull.writing, latestFull.speaking)
    : null
  const scoreTrend = fullMocks.length >= 2
    ? Math.round((
        calcOverall(fullMocks[0].listening, fullMocks[0].reading, fullMocks[0].writing, fullMocks[0].speaking) -
        calcOverall(fullMocks[1].listening, fullMocks[1].reading, fullMocks[1].writing, fullMocks[1].speaking)
      ) * 10) / 10
    : null

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="relative bg-background" style={{ paddingTop:"clamp(6.5rem,10vw,9rem)", paddingBottom:"4rem" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center py-24">
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

        {/* HEADER */}
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

        {/* STAT CARDS */}
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
            value={completedAll}
            sub={`of ${totalAll} total subtasks`}
            delay={0.15}
          />
          <StatCard
            icon={TrendingUp} iconColor="#10b981" label="Avg Mock Score"
            value={avgScore != null ? avgScore : "—"}
            sub={
              scoreTrend != null
                ? `${scoreTrend >= 0 ? "↑" : "↓"} ${Math.abs(scoreTrend)} vs last mock`
                : scores.length > 0
                ? "Log a full mock to compare"
                : "No scores yet"
            }
            subColor={scoreTrend != null ? (scoreTrend >= 0 ? "#10b981" : "#ef4444") : undefined}
            delay={0.20}
          />
          <StatCard
            icon={Target} iconColor="#0ea5e9" label="Band Target"
            value={planMeta.targetBand || "7.0+"}
            sub={`${planPct}% of plan complete`}
            delay={0.25}
          />
        </div>

        {/* CHARTS ROW */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.45, delay:0.2 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-4"
        >
          <CompletionCard
            perWeek={perWeek}
            planPct={planPct}
            activeWeekIdx={activeWeekIdx}
            weeklyPlans={weeklyPlans}
            planId={planId}
            userId={user?.id}
            planUnit={planMeta.unit}
          />
          <ScoreCard scores={scores}/>
        </motion.div>

        {/* BOTTOM ROW */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.45, delay:0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <SkillBarsCard
            scores={scores}
            activeWeekIdx={activeWeekIdx}
            totalWeeks={weeklyPlans.length}
          />
          <NextCard tasks={nextTasks}/>
          <CountdownCard/>
        </motion.div>

      </div>
    </section>
  )
}
