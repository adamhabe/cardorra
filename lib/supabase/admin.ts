import {
  createClient,
} from "@supabase/supabase-js";


export function createAdminClient() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;


  if (
    !supabaseUrl ||
    !secretKey
  ) {

    throw new Error(
      "Chybí serverové Supabase proměnné."
    );

  }


  return createClient(
    supabaseUrl,
    secretKey,
    {

      auth: {

        persistSession:
          false,

        autoRefreshToken:
          false,

      },

    }
  );

}