
"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createBrowserClient,
} from "@supabase/ssr";

import styles from "./login.module.css";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");


  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("verification") ===
      "failed"
    ) {
      setErrorMessage(
        "Potvrzovací odkaz je neplatný " +
        "nebo jeho platnost vypršela."
      );
    }
  }, []);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setErrorMessage(
          "Přihlašování momentálně není dostupné."
        );

        return;
      }

      const supabase = createBrowserClient(
        supabaseUrl,
        supabaseKey
      );

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setErrorMessage(
          "Přihlášení se nepodařilo. " +
          "Zkontroluj e-mail, heslo " +
          "a potvrzení registrace."
        );

        return;
      }

      router.replace("/ucet");
      router.refresh();

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setErrorMessage(
        "Nastala chyba při přihlašování. " +
        "Zkus to prosím znovu."
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className={styles.page}>

      {/* HORNÍ LIŠTA */}

      <header className={styles.header}>

        <Link
          href="/"
          className={styles.brand}
        >
          CARDORRA
        </Link>

        <Link
          href="/"
          className={styles.back}
        >
          <span aria-hidden="true">
            ←
          </span>

          Zpět do obchodu
        </Link>

      </header>


      <div className={styles.content}>

        {/* LEVÁ STRANA */}

        <section className={styles.intro}>

          <div className={styles.introInner}>

            <div className={styles.eyebrow}>
              TVŮJ ÚČET
            </div>

            <h1>
              Tvoje karty.
              <br />
              <span>
                Tvoje Cardorra.
              </span>
            </h1>

            <p>
              Přihlas se a měj své nákupy,
              doručovací údaje a objednávky
              na jednom místě.
            </p>

          </div>

        </section>


        {/* PRAVÁ STRANA */}

        <section className={styles.formSection}>

          <div className={styles.formInner}>

            <div className={styles.formHeading}>

              <span className={styles.formEyebrow}>
                PŘIHLÁŠENÍ
              </span>

              <h2>
                Vítej zpátky.
              </h2>

              <p>
                Zadej svůj e-mail a heslo.
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
              className={styles.form}
            >

              {/* E-MAIL */}

              <div className={styles.field}>

                <label htmlFor="email">
                  E-mailová adresa
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tvuj@email.cz"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  required
                />

              </div>


              {/* HESLO */}

              <div className={styles.field}>

                <div className={styles.labelRow}>

                  <label htmlFor="password">
                    Heslo
                  </label>

                </div>

                <div className={styles.passwordField}>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    autoComplete="current-password"
                    placeholder="Zadej své heslo"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    disabled={submitting}
                    required
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Skrýt heslo"
                        : "Zobrazit heslo"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword
                      ? "Skrýt"
                      : "Ukázat"}
                  </button>

                </div>

              </div>


              {errorMessage && (

                <div
                  className={styles.error}
                  role="alert"
                >
                  {errorMessage}
                </div>

              )}


              <button
                type="submit"
                className={styles.submit}
                disabled={submitting}
              >

                <span>
                  {submitting
                    ? "Přihlašuji..."
                    : "Přihlásit se"}
                </span>

                <span aria-hidden="true">
                  →
                </span>

              </button>

            </form>


            {/* REGISTRACE */}

            <div className={styles.register}>

              <span>
                Ještě nemáš účet?
              </span>

              <p>
                Zaregistruj se a měj své
                objednávky na jednom místě.
              </p>

              <div className={styles.bottom}>

                <Link href="/registrace">
                  Vytvořit účet →
                </Link>

              </div>

            </div>


            {/* NÁKUP BEZ ÚČTU */}

            <div className={styles.bottom}>

              <Link href="/">
                Pokračovat v nákupu bez přihlášení
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}