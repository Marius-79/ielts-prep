import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://fjekxmtjfimgbdlmljfz.supabase.co"

const supabaseAnonKey = "sb_publishable_2MUwWOjzguV8EA6Q-pfe-g_fKN58it2"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)