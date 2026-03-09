import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { useState } from "react"
import { supabase } from "../_lib/supabase"
import { toast } from "sonner"

export default function AuthModal({ open, onClose }) {

const [username,setUsername] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [usernameStatus,setUsernameStatus] = useState(null)
const [loading,setLoading] = useState(false)
const [isLogin,setIsLogin] = useState(true)


function validatePassword(password){

const strong =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

return strong.test(password)

}


async function checkUsername(value){

setUsername(value)

if(value.length < 3){
setUsernameStatus(null)
return
}

const { data } = await supabase
.from("profiles")
.select("username")
.eq("username", value)
.single()

if(data){
setUsernameStatus("taken")
}else{
setUsernameStatus("available")
}

}


async function handleAuth(){

setLoading(true)

if(!isLogin){

if(usernameStatus === "taken"){
toast.error("Username already taken")
setLoading(false)
return
}

if(!validatePassword(password)){
toast.error("Password must contain 8+ characters, uppercase letter, number and symbol")
setLoading(false)
return
}

}

let result

if(isLogin){

result = await supabase.auth.signInWithPassword({
email,
password
})

}else{

result = await supabase.auth.signUp({
email,
password
})

}

if(result.error){

toast.error(result.error.message)
setLoading(false)
return

}

const user = result.data.user

// create profile row after signup
if(!isLogin && user){

const { error: profileError } = await supabase
.from("profiles")
.insert({
id: user.id,
username: username
})

if(profileError){
toast.error("Profile creation failed")
}

}

toast.success(isLogin ? "Login successful" : "Account created!")

onClose()

setLoading(false)

}


async function signInWithGithub(){

await supabase.auth.signInWithOAuth({
provider:"github"
})

}


return(

<AnimatePresence>

{open && (

<motion.div
className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]"
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
>

<motion.div
initial={{scale:0.9,opacity:0}}
animate={{scale:1,opacity:1}}
exit={{scale:0.9,opacity:0}}
className="bg-white rounded-2xl p-8 w-[380px] shadow-xl"
>

<div className="flex justify-between items-center mb-6">

<h2 className="text-xl font-semibold">
{isLogin ? "Login" : "Create Account"}
</h2>

<button onClick={onClose}>
<X size={18}/>
</button>

</div>


{/* username input */}

{!isLogin && (

<div className="mb-3">

<input
type="text"
placeholder="Username"
value={username}
minLength={3}
onChange={(e)=>checkUsername(e.target.value)}
className="w-full border border-border rounded-lg px-4 py-3"
/>

{usernameStatus === "available" && (
<p className="text-green-500 text-xs mt-1">
Username available
</p>
)}

{usernameStatus === "taken" && (
<p className="text-red-500 text-xs mt-1">
Username already taken
</p>
)}

</div>

)}


<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border border-border rounded-lg px-4 py-3 mb-3"
/>


<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full border border-border rounded-lg px-4 py-3 mb-2"
/>


{!isLogin && (

<p className="text-xs text-muted-foreground mb-4">
Password must contain: 8 characters, uppercase letter, number and symbol
</p>

)}


<button
onClick={handleAuth}
disabled={loading}
className="w-full bg-primary text-white py-3 rounded-lg"
>
{loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
</button>


<button
onClick={signInWithGithub}
className="w-full border border-border py-3 rounded-lg mt-3"
>
Continue with GitHub
</button>


<div className="text-sm text-center mt-4">

{isLogin ? (

<span>
No account?{" "}
<button
className="text-primary"
onClick={()=>setIsLogin(false)}
>
Create one
</button>
</span>

):(

<span>
Already have an account?{" "}
<button
className="text-primary"
onClick={()=>setIsLogin(true)}
>
Login
</button>
</span>

)}

</div>

</motion.div>

</motion.div>

)}

</AnimatePresence>

)

}