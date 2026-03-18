import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Brain, Target, TrendingUp, Calendar, AlertCircle,
  CheckCircle2, Loader2, BookOpen, Mic, PenLine,
  Headphones, ClipboardList, Star, Send, Copy,
  Check, RefreshCw, ChevronDown, ChevronUp, Sparkles,
  ArrowRight, Heart, RotateCcw, MessageCircle
} from "lucide-react"
import { supabase } from "../_lib/supabase"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function calcOverall(l, r, w, s) {
  const vals = [l, r, w, s].filter(v => v != null)
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + Number(b), 0) / vals.length) * 2) / 2
}
function bandColor(b) {
  if (!b) return "#94a3b8"
  if (b >= 8) return "#059669"; if (b >= 7) return "#7c3aed"
  if (b >= 6.5) return "#2563eb"; if (b >= 6) return "#d97706"
  return "#ef4444"
}
const SKILL_ICONS = { Listening: Headphones, Reading: BookOpen, Writing: PenLine, Speaking: Mic }

function detectFrustration(text) {
  const t = text.toLowerCase()
  return [
    "can't do this","cannot do this","giving up","give up","hopeless","pointless",
    "useless","too hard","too difficult","overwhelmed","stressed","anxious",
    "worried","scared","afraid","nervous","hate this","hate ielts",
    "impossible","failed again","keep failing","always fail","never pass",
    "depressed","crying","want to quit","should quit","don't know why",
    "what's the point","whats the point","exhausted","burned out","burnt out",
    "frustrated","frustrating","i'm bad at","im bad at","terrible at",
    "not good enough","not smart enough","why is it so hard"
  ].some(s => t.includes(s))
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding questions
// ─────────────────────────────────────────────────────────────────────────────
const ONBOARDING_QUESTIONS = [
  {
    id: "goal",
    question: "What's your main reason for taking IELTS?",
    options: ["University admission","Immigration / visa","Work abroad","Professional registration","Personal achievement"],
    allowCustom: true, customPlaceholder: "e.g. PhD application in the UK"
  },
  {
    id: "targetBand",
    question: "What overall band score do you need?",
    options: ["6.0","6.5","7.0","7.5","8.0","8.5+"],
    allowCustom: false
  },
  {
    id: "deadline",
    question: "When is your exam (or target date)?",
    options: ["Less than 1 month","1–2 months","2–3 months","3–6 months","Not scheduled yet"],
    allowCustom: false
  },
  {
    id: "currentLevel",
    question: "How would you describe your current English level?",
    options: [
      "Beginner (A2) — struggle with basic English",
      "Pre-intermediate (B1) — understand everyday English",
      "Intermediate (B2) — comfortable but make frequent errors",
      "Upper-intermediate (C1) — mostly fluent, need exam technique",
      "Advanced (C2) — near-native, just need IELTS strategies"
    ],
    allowCustom: false
  },
  {
    id: "weakSkills",
    question: "Which IELTS skills feel most challenging? (pick all that apply)",
    options: ["Listening","Reading","Writing Task 1","Writing Task 2","Speaking"],
    multiSelect: true, allowCustom: false
  },
  {
    id: "studyTime",
    question: "How many hours per day can you dedicate to studying?",
    options: ["Less than 1 hour","1–2 hours","2–3 hours","3–4 hours","4+ hours"],
    allowCustom: false
  },
  {
    id: "studyDays",
    question: "How many days per week can you study?",
    options: ["3 days","4 days","5 days","6 days","Every day"],
    allowCustom: false
  },
  {
    id: "mocksTaken",
    question: "Have you taken any IELTS practice or mock tests before?",
    options: ["No, this is my first time","1–5 practice tests","6–15 practice tests","16–29 practice tests","30+ practice tests"],
    allowCustom: false
  },
  {
    id: "biggestChallenge",
    question: "What's your single biggest challenge preparing for IELTS?",
    options: [
      "Time management during the exam",
      "Vocabulary — I don't know enough words",
      "Grammar — I make too many errors",
      "Exam anxiety and stress",
      "Understanding British/Australian accents",
      "Writing essays — structure and ideas",
      "Speaking fluently and confidently",
      "Staying consistent with studying"
    ],
    allowCustom: true, customPlaceholder: "Describe your challenge..."
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// System prompts
// ─────────────────────────────────────────────────────────────────────────────
const IELTS_BASE = `You are a dedicated IELTS coach. You ONLY answer questions about IELTS preparation, English language learning, exam technique, and managing exam-related stress. You do NOT engage with any other topics.

IELTS KNOWLEDGE:
- Listening: 4 sections, 40 questions, 30 min. Band 7 ≈ 30/40.
- Reading: 3 passages, 40 questions, 60 min. Band 7 ≈ 30/40.
- Writing Task 1: 20 min, 150+ words, describe data/graphic. Task 2: 40 min, 250+ words, argumentative essay.
- Speaking Part 1 (intro), Part 2 (cue card long turn), Part 3 (abstract discussion). Band 7 needs fluency + vocabulary range.
- Band 7+ = average of 4 skills rounded to 0.5. Minimum 30 full mock tests before exam.
- Timeline: 8–16 weeks for Band 7 for B2/C1 speakers.

TOPIC BOUNDARY — CRITICAL:
If asked anything unrelated to IELTS or English learning, respond ONLY with: "I'm your dedicated IELTS coach — I can only help with IELTS preparation and English learning. What would you like to work on?"

FRUSTRATION EXCEPTION:
If the student shows distress/anxiety/burnout about the exam, FIRST acknowledge their feelings with genuine empathy (2 sentences), THEN give one concrete, realistic strategy. Do NOT dismiss their feelings.`

function buildPlanSystemPrompt() {
  return IELTS_BASE + `

PLAN TASK: Generate a comprehensive IELTS plan as raw JSON only (no markdown, no code blocks):
{
  "assessment": {
    "currentLevel": "band",
    "targetBand": "7.0",
    "strongSkills": [],
    "weakSkills": [],
    "estimatedWeeksToTarget": 12,
    "totalMockTestsNeeded": 30,
    "keyInsight": "specific insight"
  },
  "phases": [
    {
      "phase": 1,
      "name": "Phase name",
      "duration": "2 weeks",
      "goal": "goal",
      "weeklySchedule": { "Mon": "tasks", "Tue": "tasks", "Wed": "tasks", "Thu": "tasks", "Fri": "tasks", "Sat": "Full mock test + review", "Sun": "Light review + vocab" },
      "mockTestsThisPhase": 4,
      "focusAreas": [],
      "milestones": []
    }
  ],
  "weeklyMockSchedule": [
    { "week": 1, "mockType": "Listening only", "targetBand": 6.0, "focus": "post-test action" }
  ],
  "skillRoadmaps": {
    "Listening": { "currentBand": null, "targetBand": 7.0, "keyTechniques": [], "dailyPractice": "task" },
    "Reading":   { "currentBand": null, "targetBand": 7.0, "keyTechniques": [], "dailyPractice": "task" },
    "Writing":   { "currentBand": null, "targetBand": 7.0, "keyTechniques": [], "dailyPractice": "task" },
    "Speaking":  { "currentBand": null, "targetBand": 7.0, "keyTechniques": [], "dailyPractice": "task" }
  },
  "mistakePatterns": [],
  "nextWeekPriorities": [
    { "priority": 1, "task": "task", "time": "45 min", "why": "reason" }
  ],
  "motivationalNote": "genuine personalized encouragement"
}`
}

function buildChatSystem(plan, profile) {
  return IELTS_BASE + `

STUDENT PROFILE: ${profile ? Object.entries(profile).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") : "New student"}
PLAN SNAPSHOT: ${plan ? `Band ${plan.assessment?.currentLevel} → ${plan.assessment?.targetBand}, weak: ${plan.assessment?.weakSkills?.join(", ")}, ${plan.assessment?.estimatedWeeksToTarget}w` : "None yet"}

RULES: Under 180 words. Actionable. End with one thing they can do TODAY. If off-topic: use the standard redirect line.`
}

function buildPlanPrompt(scores, notebook, profile, completionPct) {
  const history = scores.slice(0,10).map((s,i) => {
    const ov = calcOverall(s.listening, s.reading, s.writing, s.speaking)
    return `Test ${i+1}: L=${s.listening??'?'} R=${s.reading??'?'} W=${s.writing??'?'} S=${s.speaking??'?'} Overall=${ov??'?'}`
  }).join("\n") || "No tests yet"

  const mistakes = notebook?.mistakes
    ? Object.entries(notebook.mistakes).flatMap(([sec,items]) =>
        items.map(m => `[${sec}] ${m.mistake||''} — ${m.reason||''}`)
      ).filter(Boolean).slice(0,15).join("\n")
    : "None logged"

  return `STUDENT PROFILE:
${Object.entries(profile||{}).map(([k,v])=>`- ${k}: ${Array.isArray(v)?v.join(", "):v}`).join("\n")}

SCORES (${scores.length} tests):
${history}

MISTAKES:
${mistakes}

PLAN COMPLETION: ${completionPct}%
MOCKS TAKEN: ${scores.length}/30

Generate the plan now.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding flow component
// ─────────────────────────────────────────────────────────────────────────────
function OnboardingFlow({ onComplete }) {
  const [step,        setStep]        = useState(0)
  const [answers,     setAnswers]     = useState({})
  const [selected,    setSelected]    = useState([])
  const [customInput, setCustomInput] = useState("")
  const [showCustom,  setShowCustom]  = useState(false)

  const q      = ONBOARDING_QUESTIONS[step]
  const isLast = step === ONBOARDING_QUESTIONS.length - 1
  const pct    = (step / ONBOARDING_QUESTIONS.length) * 100

  function selectOption(opt) {
    if (q.multiSelect) {
      setSelected(p => p.includes(opt) ? p.filter(o => o !== opt) : [...p, opt])
    } else {
      setSelected([opt]); setShowCustom(false)
    }
  }

  const canProceed = q.multiSelect
    ? selected.length > 0
    : selected.length > 0 || (showCustom && customInput.trim().length > 2)

  function next() {
    if (!canProceed) return
    const value = q.multiSelect ? selected : selected.length > 0 ? selected[0] : customInput.trim()
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)
    setSelected([]); setCustomInput(""); setShowCustom(false)
    if (isLast) { onComplete(newAnswers) }
    else        { setStep(s => s + 1) }
  }

  return (
    <div className="py-1">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Question {step + 1} of {ONBOARDING_QUESTIONS.length}</span>
          <span>{Math.round(pct + 100 / ONBOARDING_QUESTIONS.length)}%</span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            animate={{ width: `${pct + 100 / ONBOARDING_QUESTIONS.length}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>
          <p className="text-sm font-semibold text-foreground mb-1">{q.question}</p>
          {q.multiSelect && <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>}

          <div className="space-y-2 mb-4">
            {q.options.map(opt => {
              const active = selected.includes(opt)
              return (
                <button key={opt} onClick={() => selectOption(opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    active ? "border-violet-400 bg-violet-50 text-violet-800 font-medium" : "border-border bg-white text-foreground/80 hover:border-violet-200 hover:bg-violet-50/40"
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${active ? "border-violet-500 bg-violet-500" : "border-border/60"}`}>
                      {active && <Check size={9} className="text-white"/>}
                    </div>
                    {opt}
                  </div>
                </button>
              )
            })}

            {q.allowCustom && (
              <button onClick={() => { setShowCustom(p => !p); setSelected([]) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${showCustom ? "border-violet-400 bg-violet-50 text-violet-800" : "border-dashed border-border text-muted-foreground hover:border-violet-200"}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${showCustom ? "border-violet-500 bg-violet-500" : "border-border/60"}`}>
                    {showCustom && <Check size={9} className="text-white"/>}
                  </div>
                  Other — type your own answer
                </div>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showCustom && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <input
                  autoFocus
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") next() }}
                  placeholder={q.customPlaceholder || "Type your answer..."}
                  className="w-full text-sm border border-violet-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setSelected([]); setShowCustom(false) }}
                className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary/60 transition">
                Back
              </button>
            )}
            <button onClick={next} disabled={!canProceed}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition shadow-sm shadow-violet-200">
              {isLast ? "Generate My Plan" : "Next"} <ArrowRight size={14}/>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan display sub-components
// ─────────────────────────────────────────────────────────────────────────────
function AssessmentCard({ assessment }) {
  if (!assessment) return null
  const { currentLevel, targetBand, strongSkills=[], weakSkills=[], estimatedWeeksToTarget, totalMockTestsNeeded, keyInsight } = assessment
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <div className="rounded-xl border border-border bg-gradient-to-br from-violet-50 to-white p-4">
        <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">Assessment</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: bandColor(parseFloat(currentLevel)) }}>{currentLevel}</div>
          <div>
            <p className="text-xs text-muted-foreground">Current estimate</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-semibold">→ Target:</span>
              <span className="text-xs font-bold" style={{ color: bandColor(parseFloat(targetBand)) }}>Band {targetBand}</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Calendar size={10}/> {estimatedWeeksToTarget} weeks · {totalMockTestsNeeded} mock tests</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">Skills</p>
        {strongSkills.length > 0 && <div className="mb-2"><p className="text-[10px] text-green-600 font-semibold mb-1">✓ Strong</p>{strongSkills.map(s=><span key={s} className="inline-block text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 mr-1 mb-1">{s}</span>)}</div>}
        {weakSkills.length > 0 && <div><p className="text-[10px] text-red-500 font-semibold mb-1">⚠ Needs work</p>{weakSkills.map(s=><span key={s} className="inline-block text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 mr-1 mb-1">{s}</span>)}</div>}
      </div>
      {keyInsight && (
        <div className="sm:col-span-2 rounded-xl border border-violet-200 bg-violet-50 p-4 flex gap-3">
          <Sparkles size={14} className="text-violet-500 flex-shrink-0 mt-0.5"/>
          <p className="text-sm text-violet-800 leading-relaxed">{keyInsight}</p>
        </div>
      )}
    </div>
  )
}

function PhaseCard({ phase }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <button onClick={() => setOpen(p=>!p)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><span className="text-xs font-bold text-violet-600">{phase.phase}</span></div>
          <div className="text-left">
            <p className="text-sm font-semibold">{phase.name}</p>
            <p className="text-xs text-muted-foreground">{phase.duration} · {phase.mockTestsThisPhase} mocks</p>
          </div>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition ${open?"rotate-180":""}`}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/60">
            <div className="p-4 space-y-3">
              <div className="flex gap-2 p-3 bg-violet-50 rounded-lg"><Target size={12} className="text-violet-500 flex-shrink-0 mt-0.5"/><p className="text-xs text-violet-800">{phase.goal}</p></div>
              {phase.weeklySchedule && (
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Weekly Schedule</p>
                  <div className="space-y-1.5">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => phase.weeklySchedule[d] && (
                      <div key={d} className="flex gap-2 text-xs">
                        <span className="w-8 font-semibold text-violet-600 font-mono flex-shrink-0">{d}</span>
                        <span className="text-foreground/80 leading-relaxed">{phase.weeklySchedule[d]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {phase.milestones?.length > 0 && (
                <ul className="space-y-1">
                  {phase.milestones.map((m,i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 size={11} className="text-green-500 flex-shrink-0 mt-0.5"/>{m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MockScheduleTable({ schedule, mocksTaken }) {
  if (!schedule?.length) return null
  return (
    <div>
      <div className="mb-3 p-3 bg-violet-50 rounded-xl border border-violet-100 flex items-center gap-2">
        <TrendingUp size={13} className="text-violet-500 flex-shrink-0"/>
        <p className="text-xs text-violet-800"><strong>{mocksTaken}</strong> done · <strong className="text-violet-600">{Math.max(0,30-mocksTaken)} remaining</strong> for Band 7+</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead><tr className="bg-secondary/50 border-b border-border">{["Week","Type","Target","After-test focus"].map(h=><th key={h} className="text-left px-3 py-2 font-mono text-muted-foreground uppercase tracking-wider text-[10px]">{h}</th>)}</tr></thead>
          <tbody>
            {schedule.map((row,i) => (
              <tr key={i} className={`border-b border-border/50 ${i%2===0?"bg-white":"bg-secondary/20"}`}>
                <td className="px-3 py-2 font-bold text-violet-600">W{row.week}</td>
                <td className="px-3 py-2 text-foreground/80">{row.mockType}</td>
                <td className="px-3 py-2"><span className="font-bold text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: bandColor(row.targetBand) }}>{row.targetBand}</span></td>
                <td className="px-3 py-2 text-foreground/70">{row.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SkillRoadmaps({ roadmaps }) {
  if (!roadmaps) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(roadmaps).map(([skill, data]) => {
        const Icon = SKILL_ICONS[skill] || BookOpen
        return (
          <div key={skill} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0"><Icon size={13} className="text-violet-600"/></div>
              <div className="flex-1">
                <p className="text-xs font-semibold">{skill}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {data.currentBand && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: bandColor(data.currentBand) }}>{data.currentBand}</span>}
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: bandColor(data.targetBand) }}>{data.targetBand}</span>
                </div>
              </div>
            </div>
            {data.dailyPractice && <div className="mb-2 text-[11px] bg-violet-50 rounded-lg px-3 py-2 text-violet-800"><span className="font-semibold">Daily: </span>{data.dailyPractice}</div>}
            {data.keyTechniques?.length > 0 && <ul className="space-y-1">{data.keyTechniques.map((t,i)=><li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/70"><span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>{t}</li>)}</ul>}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AIPlanOptimizer({ openAuth, scores = [], completionPct = 0 }) {
  const [open,        setOpen]        = useState(false)
  const [stage,       setStage]       = useState("idle") // idle | onboarding | generating | plan
  const [profile,     setProfile]     = useState(null)
  const [plan,        setPlan]        = useState(null)
  const [error,       setError]       = useState(null)
  const [user,        setUser]        = useState(null)
  const [activeTab,   setActiveTab]   = useState("overview")
  const [copied,      setCopied]      = useState(false)
  const [notebook,    setNotebook]    = useState(null)
  const [chatInput,   setChatInput]   = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => l.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("ielts-ai-plan") || "null")
      const pr = JSON.parse(localStorage.getItem("ielts-ai-profile") || "null")
      if (p) { setPlan(p); setStage("plan") }
      if (pr) setProfile(pr)
    } catch {}
  }, [])

  useEffect(() => {
    try { setNotebook(JSON.parse(localStorage.getItem("ielts-notebook") || "null")) } catch {}
    if (user) supabase.from("notebook").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setNotebook(data) })
  }, [user])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatHistory])

  async function callClaude(messages, system) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
    })
    const data = await res.json()
    return (data.content || []).map(b => b.text || "").join("")
  }

  async function generatePlan(profileData) {
    const p = profileData || profile
    if (!p) return
    setStage("generating"); setError(null)
    localStorage.setItem("ielts-ai-profile", JSON.stringify(p))
    try {
      const raw = await callClaude([{ role: "user", content: buildPlanPrompt(scores, notebook, p, completionPct) }], buildPlanSystemPrompt())
      let cleaned = raw.trim()
      if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "")
      const parsed = JSON.parse(cleaned)
      setPlan(parsed)
      localStorage.setItem("ielts-ai-plan", JSON.stringify(parsed))
      setStage("plan"); setActiveTab("overview"); setChatHistory([])
    } catch (e) {
      setError("Couldn't generate plan — please try again.")
      setStage(profile ? "plan" : "idle")
      console.error(e)
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    const isFrustrated = detectFrustration(msg)
    setChatInput("")
    const newHistory = [...chatHistory, { role: "user", content: msg, frustrated: isFrustrated }]
    setChatHistory(newHistory)
    setChatLoading(true)
    try {
      const reply = await callClaude(newHistory.map(m => ({ role: m.role, content: m.content })), buildChatSystem(plan, profile))
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }])
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", content: "I'm having trouble right now — please try again." }])
    }
    setChatLoading(false)
  }

  function resetPlan() {
    localStorage.removeItem("ielts-ai-plan"); localStorage.removeItem("ielts-ai-profile")
    setPlan(null); setProfile(null); setChatHistory([]); setError(null); setStage("onboarding")
  }

  function copyPlan() {
    if (!plan) return
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  function handleOpen() {
    if (!user) { openAuth(); return }
    setOpen(o => {
      if (!o && stage === "idle" && !plan) setStage("onboarding")
      return !o
    })
  }

  const tabs = [
    { id: "overview",   label: "Overview",   icon: Brain         },
    { id: "phases",     label: "Phases",      icon: Calendar      },
    { id: "mocks",      label: "Mocks",       icon: ClipboardList },
    { id: "skills",     label: "Skills",      icon: Target        },
    { id: "priorities", label: "This Week",   icon: Star          },
    { id: "chat",       label: "Ask Coach",   icon: MessageCircle },
  ]

  return (
    <div className="mt-8 border border-violet-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* Header */}
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-50/60 transition">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
            <Brain size={17} className="text-white"/>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
              AI Coach
              <span className="text-[9px] font-mono bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">IELTS only</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {!user ? "Sign in for your personalized Band 7+ roadmap"
                : plan ? `${plan.assessment?.estimatedWeeksToTarget}w to Band ${plan.assessment?.targetBand} · ${Math.max(0,30-scores.length)} mocks left`
                : stage === "onboarding" ? "Setting up your profile..."
                : "Answer a few questions to get your roadmap"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {plan && <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-1 rounded-full"><Sparkles size={9}/> Plan ready</span>}
          {open ? <ChevronUp size={16} className="text-muted-foreground"/> : <ChevronDown size={16} className="text-muted-foreground"/>}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-violet-100">
            <div className="p-5">

              {/* Onboarding */}
              {stage === "onboarding" && (
                <div>
                  <div className="mb-4 p-3 rounded-xl bg-violet-50 border border-violet-100 flex gap-3">
                    <Brain size={15} className="text-violet-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-xs font-semibold text-violet-800">Let's build your personal IELTS roadmap</p>
                      <p className="text-xs text-violet-600/80">9 quick questions so I can tailor your plan precisely</p>
                    </div>
                  </div>
                  <OnboardingFlow onComplete={profileData => { setProfile(profileData); generatePlan(profileData) }} />
                </div>
              )}

              {/* Generating */}
              {stage === "generating" && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-pulse"/>
                    <div className="absolute inset-0 flex items-center justify-center"><Brain size={24} className="text-violet-500 animate-pulse"/></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-violet-700 mb-1">Building your personalized plan...</p>
                    <p className="text-xs text-muted-foreground max-w-xs">Analyzing your profile, scores, and mistakes to create a Band 7+ roadmap with 30+ scheduled mock tests</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["Skill gaps","Mock schedule","Weekly tasks","Techniques"].map(l => (
                      <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100 animate-pulse">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Plan */}
              {stage === "plan" && plan && (
                <>
                  {error && <div className="mb-3 flex items-center gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600"><AlertCircle size={13}/>{error}</div>}

                  {/* Action bar */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <button onClick={resetPlan} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-secondary/60 transition">
                      <RotateCcw size={12}/> Retake quiz
                    </button>
                    <button onClick={() => generatePlan()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 transition">
                      <RefreshCw size={12}/> Regenerate
                    </button>
                    <button onClick={copyPlan} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-secondary/60 transition ml-auto">
                      {copied ? <><Check size={12} className="text-green-500"/> Copied</> : <><Copy size={12}/> Export</>}
                    </button>
                  </div>

                  {scores.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Latest scores</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {scores.slice(0,3).map((s,i) => {
                          const ov = calcOverall(s.listening, s.reading, s.writing, s.speaking)
                          return (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-lg text-[11px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: bandColor(ov) }}>{ov??'?'}</div>
                              <div className="text-[10px] text-muted-foreground">L{s.listening??'?'} R{s.reading??'?'} W{s.writing??'?'} S{s.speaking??'?'}</div>
                            </div>
                          )
                        })}
                        <div className="ml-auto text-[11px] text-muted-foreground">{scores.length} done · {Math.max(0,30-scores.length)} left</div>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 flex-wrap mb-4 border-b border-border pb-3">
                    {tabs.map(tab => {
                      const Icon = tab.icon
                      return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${activeTab===tab.id ? "bg-violet-100 text-violet-700" : "text-muted-foreground hover:bg-secondary/60"}`}>
                          <Icon size={11}/>
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                        </button>
                      )
                    })}
                  </div>

                  {activeTab === "overview" && (
                    <div>
                      <AssessmentCard assessment={plan.assessment}/>
                      {plan.mistakePatterns?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Mistake Patterns</p>
                          <div className="space-y-1.5">
                            {plan.mistakePatterns.map((p,i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <AlertCircle size={11} className="text-amber-500 flex-shrink-0 mt-0.5"/>{p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.motivationalNote && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3">
                          <Heart size={14} className="text-green-600 flex-shrink-0 mt-0.5"/>
                          <p className="text-sm text-green-800 italic">{plan.motivationalNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "phases"     && <div className="space-y-2">{plan.phases?.map(ph => <PhaseCard key={ph.phase} phase={ph}/>)}</div>}
                  {activeTab === "mocks"      && <MockScheduleTable schedule={plan.weeklyMockSchedule} mocksTaken={scores.length}/>}
                  {activeTab === "skills"     && <SkillRoadmaps roadmaps={plan.skillRoadmaps}/>}
                  {activeTab === "priorities" && (
                    <div className="space-y-2">
                      {plan.nextWeekPriorities?.map((p,i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-white">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-violet-600">{p.priority}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{p.task}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.time} · {p.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat */}
                  {activeTab === "chat" && (
                    <div>
                      <div className="rounded-xl border border-border bg-secondary/10 h-72 overflow-y-auto p-3 mb-3 space-y-3">
                        {chatHistory.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><MessageCircle size={17} className="text-violet-600"/></div>
                            <div>
                              <p className="text-sm font-semibold mb-1">Your IELTS coach</p>
                              <p className="text-xs text-muted-foreground">Ask about strategies, your weak skills, mock test tips, or how to manage exam stress. <strong>IELTS topics only.</strong></p>
                            </div>
                          </div>
                        )}
                        {chatHistory.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
                            {msg.role === "assistant" && (
                              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                                <Brain size={11} className="text-violet-600"/>
                              </div>
                            )}
                            <div className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-violet-500 text-white rounded-br-sm"
                                : msg.content.includes("I'm your dedicated IELTS coach")
                                  ? "bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-sm"
                                  : "bg-white border border-border text-foreground/80 rounded-bl-sm"
                            }`}>
                              {msg.frustrated && msg.role === "user" && <div className="flex items-center gap-1 mb-1 text-white/70"><Heart size={9}/><span className="text-[9px]">Feeling frustrated</span></div>}
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2"><Brain size={11} className="text-violet-600"/></div>
                            <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                              {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>)}
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef}/>
                      </div>
                      <div className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendChat() } }}
                          placeholder="Ask about IELTS strategies, scores, your plan..."
                          className="flex-1 text-sm border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/30 bg-white"/>
                        <button onClick={sendChat} disabled={!chatInput.trim()||chatLoading}
                          className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center hover:bg-violet-600 disabled:opacity-40 transition flex-shrink-0 self-end mb-0.5">
                          <Send size={13}/>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["How to improve Writing Task 2?","Best mock test strategy","I feel like giving up","Listening section 4 tips","Reach Band 7 fast"].map(q => (
                          <button key={q} onClick={() => setChatInput(q)}
                            className={`text-[10px] px-2 py-1 rounded-lg border transition ${q==="I feel like giving up" ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" : "bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100"}`}>
                            {q}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">This coach only answers IELTS-related questions</p>
                    </div>
                  )}
                </>
              )}

              {/* Idle — no plan yet */}
              {stage === "idle" && !plan && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center"><Brain size={26} className="text-violet-500"/></div>
                  <p className="text-sm font-semibold">Your personalized IELTS roadmap</p>
                  <p className="text-xs text-muted-foreground max-w-xs">Answer 9 quick questions to get a comprehensive Band 7+ plan with 30+ mock tests, skill roadmaps, and daily tasks.</p>
                  <div className="flex flex-wrap justify-center gap-1.5 mb-1">
                    {["9-question quiz","30+ mock tests","Skill roadmaps","AI coach"].map(f => (
                      <span key={f} className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">{f}</span>
                    ))}
                  </div>
                  <button onClick={() => setStage("onboarding")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition shadow-md shadow-violet-200">
                    <Sparkles size={14}/> Get Started
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
