import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Falta SUPABASE_URL o SUPABASE_KEY en el archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
