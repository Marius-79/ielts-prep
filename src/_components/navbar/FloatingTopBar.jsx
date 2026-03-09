import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "../_lib/supabase"
import {
  LayoutDashboard,
  Brain,
  CalendarDays,
  Mail,
  Eye,
  EyeOff,
  User,
  Library
} from "lucide-react"

const sections = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "skills", icon: Brain, label: "Skills" },
  { id: "study-plan", icon: CalendarDays, label: "Plan" },
  { id: "resources", icon: Library, label: "Resources" },
  { id: "contact", icon: Mail, label: "Contact" }
]

export default function FloatingTopBar({ openAuth }) {

  const [active,setActive] = useState("overview")
  const [collapsed,setCollapsed] = useState(false)
  const [wave,setWave] = useState(false)

  const [user,setUser] = useState(null)
  const [username,setUsername] = useState(null)


  useEffect(()=>{

    async function loadUser(){

      const { data:{ session } } = await supabase.auth.getSession()

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if(currentUser){

        const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id",currentUser.id)
        .single()

        setUsername(data?.username)

      } else {

        setUsername(null)

      }

    }

    loadUser()

    const { data:listener } = supabase.auth.onAuthStateChange(
      async (_event,session)=>{

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if(currentUser){

          const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id",currentUser.id)
          .single()

          setUsername(data?.username)

        }else{

          setUsername(null)

        }

      }
    )

    return ()=>listener.subscription.unsubscribe()

  },[])


  useEffect(()=>{

    const observer = new IntersectionObserver(
      (entries)=>{

        entries.forEach(entry=>{
          if(entry.isIntersecting){
            setActive(entry.target.id)
          }
        })

      },
      { rootMargin:"-40% 0px -55% 0px" }
    )

    sections.forEach(section=>{
      const el = document.getElementById(section.id)
      if(el) observer.observe(el)
    })

    return ()=>observer.disconnect()

  },[])


  function scrollTo(id){
    document.getElementById(id)?.scrollIntoView({
      behavior:"smooth"
    })
  }


  function expandBar(){
    setCollapsed(false)
    setWave(true)
    setTimeout(()=>setWave(false),600)
  }


  async function logout(){
    await supabase.auth.signOut()
  }


  return(

<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">

<motion.div
animate={{ scale:collapsed?0.9:1 }}
transition={{ type:"spring",stiffness:260,damping:22 }}
className={`relative flex items-center border border-border bg-white/90 backdrop-blur-md shadow-md
${collapsed ? "w-12 h-12 rounded-full justify-center" : "px-3 py-2 rounded-full gap-1"}
`}
>

<AnimatePresence>
{wave && (
<motion.div
initial={{ scaleX:0 }}
animate={{ scaleX:1 }}
exit={{ opacity:0 }}
transition={{ duration:0.5 }}
className="absolute inset-0 bg-primary/10 origin-left rounded-full"
/>
)}
</AnimatePresence>


{collapsed ? (

<button
onClick={expandBar}
className="flex items-center justify-center w-full h-full text-muted-foreground"
>
<Eye size={20}/>
</button>

) : (

<div className="relative flex items-center gap-1">

{sections.map((item)=>{

const Icon = item.icon
const isActive = active === item.id

return(

<motion.button
key={item.id}
onClick={()=>scrollTo(item.id)}
whileHover={{ y:-3, scale:1.05 }}
transition={{ type:"spring",stiffness:300,damping:20 }}
className="relative flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition"
>

{isActive && (
<motion.div
layoutId="navHighlight"
className="absolute inset-0 bg-primary/10 rounded-full"
transition={{ type:"spring",stiffness:300,damping:30 }}
/>
)}

<Icon size={18} className="relative z-10"/>
<span className="relative z-10">{item.label}</span>

</motion.button>

)

})}


{/* SIGN IN */}

{!user && (

<button
onClick={openAuth}
className="ml-3 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm hover:opacity-90 transition"
>
<User size={16}/>
Sign In
</button>

)}


{/* USER LOGGED IN */}

{user && (

<button
onClick={logout}
className="ml-3 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm hover:opacity-80 transition"
>
{username || "Account"}
</button>

)}


<motion.button
onClick={()=>setCollapsed(true)}
whileHover={{ y:-2, scale:1.05 }}
transition={{ type:"spring",stiffness:300,damping:20 }}
className="ml-1 p-2 text-muted-foreground hover:text-primary transition"
>
<EyeOff size={18}/>
</motion.button>

</div>

)}

</motion.div>

</div>

)

}