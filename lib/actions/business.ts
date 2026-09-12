import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import type { Business } from "@/types/database";

export async function getCurrentBusiness(): Promise<Business | null> {
  const businessId = await getCurrentBusinessId();
  if (!businessId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();

  return data ?? null;
}
