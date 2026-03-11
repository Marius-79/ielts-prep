import { supabase } from "../_components/_lib/supabase"

export async function saveTaskProgress(userId, week, day, task, checkedIndices) {
  const indicesArray = Array.isArray(checkedIndices) 
    ? checkedIndices 
    : [...checkedIndices]

  const { error } = await supabase
    .from("study_progress")
    .upsert({
      user_id: userId,
      week,
      day,
      task,
      completed: indicesArray.length > 0,
      completed_indices: indicesArray
    }, { onConflict: "user_id,week,day,task" })

  if (error) {
    console.error("Progress save error:", error)
  }
}
export async function loadUserProgress(userId) {

  const { data, error } = await supabase
    .from("study_progress")
    .select("*")
    .eq("user_id", userId)

  if (error) {
    console.error("Progress load error:", error)
    return []
  }

  return data

}
