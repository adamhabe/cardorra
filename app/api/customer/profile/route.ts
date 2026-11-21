
import { NextResponse } from "next/server";

import { createCustomerServerClient } from "../../../../lib/supabase/customer-server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authClient = await createCustomerServerClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { profile: null },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("customer_profiles")
      .select("first_name, last_name, phone")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("CHECKOUT PROFILE ERROR:", error);

      return NextResponse.json(
        { error: "Nepodařilo se načíst profil." },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        profile: {
          firstName:
            profile?.first_name ??
            user.user_metadata?.first_name ??
            "",

          lastName:
            profile?.last_name ??
            user.user_metadata?.last_name ??
            "",

          email: user.email ?? "",

          phone:
            profile?.phone ??
            user.user_metadata?.phone ??
            "",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("CHECKOUT PROFILE API ERROR:", error);

    return NextResponse.json(
      { error: "Interní chyba serveru." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
