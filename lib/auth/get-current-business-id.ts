import { createClient } from "@/lib/supabase/server";

/**
 * Reads the business_id for the currently logged-in user from their profile.
 * RLS still enforces access on every query, but inserts need business_id
 * supplied explicitly to satisfy the `with check` clause.
 */
export async function getCurrentBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile?.business_id ?? null;
}
