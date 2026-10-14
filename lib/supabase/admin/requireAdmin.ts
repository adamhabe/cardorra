import { redirect } from "next/navigation";

import { createClient } from "../server";
import { createAdminClient } from "../admin";

export async function requireAdmin() {
  // 1. Ověříme přihlášeného člověka z Auth cookie.
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect("/admin/login");
  }

  // 2. Ověříme, že jeho UUID existuje v admin_users.
  const admin = createAdminClient();

  const { data: adminRow, error: adminError } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !adminRow) {
    redirect("/admin/login?error=not-admin");
  }

  return {
    userId,
    email:
      typeof data.claims.email === "string"
        ? data.claims.email
        : "",
  };
}