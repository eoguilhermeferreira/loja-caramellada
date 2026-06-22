import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "@/types/database.types";

export async function createAdminClient() {
  await connection();
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
