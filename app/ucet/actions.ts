
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCustomerServerClient } from "../../lib/supabase/customer-server";
import { createAdminClient } from "../../lib/supabase/admin";

export async function updateCustomerProfile(formData: FormData) {
  const authClient = await createCustomerServerClient();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/prihlaseni");
  }

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (
    firstName.length < 2 ||
    firstName.length > 60 ||
    lastName.length < 2 ||
    lastName.length > 60 ||
    phone.length < 6 ||
    phone.length > 30
  ) {
    redirect("/ucet?profil=neplatne");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("customer_profiles")
    .upsert(
      {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("CUSTOMER PROFILE UPDATE ERROR:", error);
    redirect("/ucet?profil=chyba");
  }

  revalidatePath("/ucet");
  redirect("/ucet?profil=ulozeno");
}
