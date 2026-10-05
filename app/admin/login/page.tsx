import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "../../../lib/supabase/server";

import {
  createAdminClient,
} from "../../../lib/supabase/admin";

import {
  login,
} from "./actions";


type LoginPageProps = {

  searchParams:
    Promise<{
      error?: string;
    }>;

};


export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {

  /*
    Když už je admin přihlášený,
    pošleme ho rovnou do panelu.
  */

  const supabase =
    await createClient();


  const {
    data,
  } =
    await supabase.auth.getClaims();


  const userId =
    data?.claims?.sub;


  if (userId) {

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


    if (adminUser) {

      redirect(
        "/admin"
      );

    }

  }


  const {
    error,
  } =
    await searchParams;


  let errorMessage =
    "";


  if (
    error === "login"
  ) {

    errorMessage =
      "Špatný e-mail nebo heslo.";

  }


  if (
    error === "not-admin"
  ) {

    errorMessage =
      "Tento účet nemá přístup do administrace.";

  }


  if (
    error === "missing"
  ) {

    errorMessage =
      "Vyplň e-mail a heslo.";

  }


  return (
    <main className="adminLoginPage">

      <div className="adminLoginGlow"></div>


      <section className="adminLoginCard">

        <div className="adminBrand">
          TCG<span>VAULT</span>
        </div>


        <div className="adminLoginLabel">
          ADMINISTRATION
        </div>


        <h1>
          Přihlášení
        </h1>


        <p className="adminLoginDescription">
          Interní administrační panel
          TCG Vault.
        </p>


        {errorMessage && (

          <div className="adminError">
            {errorMessage}
          </div>

        )}


        <form
          action={login}
          className="adminLoginForm"
        >

          <label>

            <span>
              E-mail
            </span>

            <input
              type="email"
              name="email"
              placeholder="admin@email.cz"
              autoComplete="email"
              required
            />

          </label>


          <label>

            <span>
              Heslo
            </span>

            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />

          </label>


          <button type="submit">
            Přihlásit se →
          </button>

        </form>


        <div className="adminLoginSecurity">
          🔒 Zabezpečený přístup
        </div>

      </section>

    </main>
  );

}