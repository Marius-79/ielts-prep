import { useEffect, useState } from "react"
import { supabase } from "../_components/_lib/supabase"

export default function Profile() {

  const [user,setUser] = useState(null)
  const [username,setUsername] = useState("")
  const [avatar,setAvatar] = useState(null)
  const [avatarUrl,setAvatarUrl] = useState("")

  useEffect(()=>{

    async function loadProfile(){

      const { data:userData } = await supabase.auth.getUser()

      const currentUser = userData.user

      const { data: listener } = supabase.auth.onAuthStateChange(
  async (event, session) => {

    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single()

      setUsername(profile?.username)

    } else {

      setUsername(null)

    }

  }
)

      const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id",currentUser.id)
      .single()

      if(data){

        setUsername(data.username)
        setAvatarUrl(data.avatar_url)

      }

    }

    loadProfile()

  },[])

  async function uploadAvatar(e){

    const file = e.target.files[0]

    if(!file) return

    const filePath = `avatars/${user.id}`

    const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath,file,{ upsert:true })

    if(error){
      alert(error.message)
      return
    }

    const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

    setAvatarUrl(data.publicUrl)

    await supabase
    .from("profiles")
    .update({ avatar_url:data.publicUrl })
    .eq("id",user.id)

  }

  async function saveProfile(){

    await supabase
    .from("profiles")
    .update({ username })
    .eq("id",user.id)

    alert("Profile updated")

  }

  return(

    <div className="max-w-xl mx-auto py-20">

      <h1 className="text-3xl font-bold mb-8">
        Your Profile
      </h1>

      <div className="space-y-6">

        <div>

          <p className="text-sm mb-2">Profile Picture</p>

          {avatarUrl && (
            <img
              src={avatarUrl}
              className="w-20 h-20 rounded-full mb-3"
            />
          )}

          <input type="file" onChange={uploadAvatar} />

        </div>

        <div>

          <p className="text-sm mb-2">Username</p>

          <input
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />

        </div>

        <button
          onClick={saveProfile}
          className="bg-primary text-white px-6 py-3 rounded-lg"
        >
          Save Changes
        </button>

      </div>

    </div>

  )

}