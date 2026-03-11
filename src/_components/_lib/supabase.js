import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://fjekxmtjfimgbdlmljfz.supabase.co"

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWt4bXRqZmltZ2JkbG1samZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ4MTMsImV4cCI6MjA4ODM5MDgxM30.aBWGpqNK7EqIzzCP4DUZJ_4SXPSc-WvNhUUTFi2Zrco"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)