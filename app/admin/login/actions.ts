"use server";


import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "../../../lib/supabase/server";

import {
  createAdminClient,
} from "../../../lib/supabase/admin";


export async function login(
  formData: FormData
) {

  const email =
    String(
      formData.get("email") || ""
    )
      .trim()
      .toLowerCase();


  const password =
    String(
      formData.get("password") || ""
    );


  if (
    !email ||
    !password
  ) {

    redirect(
      "/admin/login?error=missing"
    );

  }


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      });


  if (error) {

    redirect(
      "/admin/login?error=login"
    );

  }


  /*
    Ověříme čerstvě přihlášeného
    uživatele.
  */

  const {
    data,
    error: claimsError,
  } =
    await supabase.auth.getClaims();


  const userId =
    data?.claims?.sub;


  if (
    claimsError ||
    !userId
  ) {

    await supabase.auth.signOut();

    redirect(
      "/admin/login?error=login"
    );

  }


  /*
    A ještě admin_users.
  */

  const admin =
    createAdminClient();


  const {
    data: adminUser,
  } =
    await admin
      .from("admin_users")
      .select("user_id")
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();


  if (!adminUser) {

    await supabase.auth.signOut();

    redirect(
      "/admin/login?error=not-admin"
    );

  }


  redirect(
    "/admin"
  );

}