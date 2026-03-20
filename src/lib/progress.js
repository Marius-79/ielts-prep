import { supabase } from "../_components/_lib/supabase"

export async function saveTaskProgress(userId, planId, week, day, task, checkedIndices) {
  const indicesArray = Array.isArray(checkedIndices) ? checkedIndices : [...checkedIndices]
  const { error } = await supabase
    .from("study_progress")
    .upsert({
      user_id: userId,
      plan: planId,
      week,
      day,
      task,
      completed: indicesArray.length > 0,
      completed_indices: indicesArray
    }, { onConflict: "user_id,plan,week,day,task" })
  if (error) console.error("Progress save error:", error)
}

export async function loadUserProgress(userId, planId = null) {
  let query = supabase
    .from("study_progress")
    .select("*")
    .eq("user_id", userId)
  if (planId) query = query.eq("plan", planId)
  const { data, error } = await query
  if (error) { console.error("Progress load error:", error); return [] }
  return data
}

export async function saveSelectedPlan(userId, planId) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, selected_plan: planId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
  if (error) console.error("Plan save error:", error)
}

export async function loadSelectedPlan(userId) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("selected_plan")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) { console.error("Plan load error:", error); return null }
  return data?.selected_plan ?? null
}
