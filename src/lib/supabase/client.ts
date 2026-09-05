import { createClient } from "@supabase/supabase-js";

// Reserved adapter entrypoint for the future provider switch. It is never called in local mode.
export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}
