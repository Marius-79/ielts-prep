import { motion, AnimatePresence } from "motion/react"
import { X, User, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { supabase } from "../_lib/supabase"
import { toast } from "sonner"

export default function ProfileModal({ open, onClose, user, currentUsername, currentAvatar, onUpdated }) {

const [username, setUsername] = useState(currentUsername || "")
const [usernameStatus, setUsernameStatus] = useState(null)
const [avatarUrl, setAvatarUrl] = useState(currentAvatar || null)
const [uploading, setUploading] = useState(false)
const [saving, setSaving] = useState(false)
const fileRef = useRef(null)

useEffect(() => {
  setUsername(currentUsername || "")
  setAvatarUrl(currentAvatar || null)
}, [currentUsername, currentAvatar, open])

async function checkUsername(value) {
  setUsername(value)
  if (value === currentUsername) { setUsernameStatus("same"); return }
  if (value.length < 3) { setUsernameStatus(null); return }
  setUsernameStatus("checking")
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", value)
    .maybeSingle()
  setUsernameStatus(data ? "taken" : "available")
}

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return }

  setUploading(true)
  const ext = file.name.split(".").pop()
  const path = `avatars/${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true })

  if (uploadError) {
    toast.error("Upload failed: " + uploadError.message)
    setUploading(false)
    return
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  const url = data.publicUrl + "?t=" + Date.now() // bust cache
  setAvatarUrl(url)
  setUploading(false)
  toast.success("Avatar uploaded!")
}

async function handleSave() {
  if (usernameStatus === "taken") { toast.error("Username already taken"); return }
  if (username.length < 3) { toast.error("Username must be at least 3 characters"); return }

  setSaving(true)

  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_url: avatarUrl })
    .eq("id", user.id)

  if (error) {
    toast.error("Save failed: " + error.message)
    setSaving(false)
    return
  }

  toast.success("Profile updated!")
  onUpdated({ username, avatarUrl })
  onClose()
  setSaving(false)
}

const initials = (currentUsername || "?").slice(0, 2).toUpperCase()

return (

<AnimatePresence>
{open && (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 z-[100] flex items-center justify-center p-4"
  style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
  onClick={onClose}
>
  <motion.div
    initial={{ scale: 0.94, opacity: 0, y: 16 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.94, opacity: 0, y: 16 }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="relative w-full max-w-[380px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="h-1 w-full bg-primary" />

    {/* header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
      <div>
        <h2 className="text-base font-bold text-foreground">Edit Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Update your username and avatar</p>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <X size={16} />
      </button>
    </div>

    <div className="px-6 py-6 space-y-5">

      {/* avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <p className="text-xs text-muted-foreground">Click the camera to upload (max 2MB)</p>
      </div>

      {/* username */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
          Username
        </label>
        <div className="relative">
          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={username}
            onChange={(e) => checkUsername(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && <Loader2 size={14} className="animate-spin text-muted-foreground/50" />}
            {usernameStatus === "available" && <CheckCircle2 size={14} className="text-green-500" />}
            {usernameStatus === "taken" && <AlertCircle size={14} className="text-red-400" />}
          </span>
        </div>
        {usernameStatus === "available" && <p className="text-green-500 text-xs mt-1">Available ✓</p>}
        {usernameStatus === "taken" && <p className="text-red-400 text-xs mt-1">Already taken</p>}
      </div>

      {/* email — read only */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
          Email <span className="normal-case font-normal">(cannot be changed)</span>
        </label>
        <input
          type="email"
          value={user?.email || ""}
          disabled
          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted text-muted-foreground cursor-not-allowed"
        />
      </div>

      {/* save */}
      <button
        onClick={handleSave}
        disabled={saving || usernameStatus === "taken"}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
      >
        {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : "Save changes"}
      </button>

    </div>
  </motion.div>
</motion.div>
)}
</AnimatePresence>
)
}
