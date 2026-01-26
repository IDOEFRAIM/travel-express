
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug amélioré
if (!supabaseUrl || !serviceRoleKey) {
  console.log("--- DEBUG CONFIG SUPABASE ---");
  console.log("URL:", supabaseUrl ? "OK" : "MANQUANTE");
  console.log("SERVICE_ROLE:", serviceRoleKey ? "OK" : "MANQUANT");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("-----------------------------");
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);