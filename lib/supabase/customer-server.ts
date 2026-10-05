
import "server-only";

import {
  createServerClient,
} from "@supabase/ssr";

import {
  cookies,
} from "next/headers";


export async function createCustomerServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Chybí veřejné nastavení Supabase."
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            /*
              Server Components nemohou vždy
              zapisovat cookies.

              Obnovování relace v takovém
              případě zajišťuje existující
              Supabase proxy.
            */
          }
        },
      },
    }
  );
}