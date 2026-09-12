import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let businessName = "tu negocio";
  if (profile?.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", profile.business_id)
      .maybeSingle();
    businessName = business?.name ?? businessName;
  }

  return (
    <AppShell>
      <PageHeader
        title={`¡Bienvenido a EmprendeMos!`}
        description={`Este es el panel de ${businessName}.`}
      />
    </AppShell>
  );
}
