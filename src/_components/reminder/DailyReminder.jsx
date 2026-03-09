import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarDays, X } from "lucide-react"

export default function DailyReminder() {

  const [visible,setVisible] = useState(false)

  useEffect(()=>{

    const lastSeen = localStorage.getItem("studyReminderLastSeen")
    const now = Date.now()

    if(!lastSeen || now - Number(lastSeen) > 86400000){

      setVisible(true)

    }

  },[])

  function closeReminder(){

    localStorage.setItem("studyReminderLastSeen", Date.now())
    setVisible(false)

  }

  return (

    <AnimatePresence>

      {visible && (

        <motion.div
          initial={{ y:-80, opacity:0 }}
          animate={{ y:0, opacity:1 }}
          exit={{ y:-80, opacity:0 }}
          transition={{ duration:0.4 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >

          <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-primary text-white shadow-lg">

            <CalendarDays size={20}/>

            <div className="text-sm font-medium">

              Time to continue your IELTS preparation today 📚

            </div>

            <button
              onClick={closeReminder}
              className="opacity-80 hover:opacity-100"
            >
              <X size={18}/>
            </button>

          </div>

        </motion.div>

      )}

    </AnimatePresence>

  )

}