import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_BASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if(!supabaseAnonKey || !supabaseUrl) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);