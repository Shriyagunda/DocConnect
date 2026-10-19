import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend .env"
  );
}

// Trusted server client. Privileged access stays on the Express backend.
// Do not import this module from the frontend or expose the service role key.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function verifySupabaseConnection() {
  const { error } = await supabaseAdmin.from("users").select("id").limit(1);
  if (error) {
    console.error("Supabase connection failed:", error.message);
    throw error;
  }
  console.log("Supabase connected successfully");
}

export default supabaseAdmin;
