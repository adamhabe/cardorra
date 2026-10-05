
"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createBrowserClient,
} from "@supabase/ssr";

import styles from "../prihlaseni/login.module.css";


export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [registered, setRegistered] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrorMessage("");

    if (name.trim().length < 2) {
      setErrorMessage(
        "Vyplň prosím své jméno."
      );

      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Heslo musí mít alespoň 8 znaků."
      );

      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Zadaná hesla se neshodují."
      );

      return;
    }

    setSubmitting(true);

    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setErrorMessage(
          "Registrace momentálně není dostupná."
        );

        return;
      }

      const supabase = createBrowserClient(
        supabaseUrl,
        supabaseKey
      );

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),

        password,

        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(
          "Registraci se nepodařilo dokončit. " +
          "Zkontroluj údaje a zkus to znovu."
        );

        return;
      }

      /*
        Pokud je potvrzování e-mailu
        zapnuté, Supabase obvykle
        nevrátí aktivní session.
      */

      if (data.session) {
        router.replace("/ucet");
        router.refresh();

        return;
      }

      setRegistered(true);

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setErrorMessage(
        "Nastala chyba při registraci. " +
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
              Vytvoř si účet a měj všechny
              svoje nákupy, objednávky
              a doručovací údaje
              na jednom místě.
            </p>

          </div>

        </section>


        {/* PRAVÁ STRANA */}

        <section className={styles.formSection}>

          <div className={styles.formInner}>

            {registered ? (

              <div className={styles.formHeading}>

                <span className={styles.formEyebrow}>
                  REGISTRACE
                </span>

                <h2>
                  Zkontroluj svůj e-mail.
                </h2>

                <p>
                  Pokud lze pro tuto adresu
                  vytvořit nový účet, poslali
                  jsme ti potvrzovací odkaz.
                  Otevři ho a dokonči registraci.
                </p>

                <div className={styles.bottom}>

                  <Link href="/prihlaseni">
                    Přejít na přihlášení →
                  </Link>

                </div>

              </div>

            ) : (

              <>

                <div className={styles.formHeading}>

                  <span className={styles.formEyebrow}>
                    REGISTRACE
                  </span>

                  <h2>
                    Vytvoř si účet.
                  </h2>

                  <p>
                    Registrace zabere jen chvilku.
                  </p>

                </div>


                <form
                  onSubmit={handleSubmit}
                  className={styles.form}
                >

                  {/* JMÉNO */}

                  <div className={styles.field}>

                    <label htmlFor="register-name">
                      Jméno a příjmení
                    </label>

                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jan Novák"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      maxLength={100}
                      disabled={submitting}
                      required
                    />

                  </div>


                  {/* E-MAIL */}

                  <div className={styles.field}>

                    <label htmlFor="register-email">
                      E-mailová adresa
                    </label>

                    <input
                      id="register-email"
                      type="email"
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

                    <label htmlFor="register-password">
                      Heslo
                    </label>

                    <div className={styles.passwordField}>

                      <input
                        id="register-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Alespoň 8 znaků"
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        disabled={submitting}
                        minLength={8}
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
                      >
                        {showPassword
                          ? "Skrýt"
                          : "Ukázat"}
                      </button>

                    </div>

                  </div>


                  {/* POTVRZENÍ HESLA */}

                  <div className={styles.field}>

                    <label htmlFor="register-confirm">
                      Heslo znovu
                    </label>

                    <input
                      id="register-confirm"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Zopakuj heslo"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      disabled={submitting}
                      required
                    />

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
                        ? "Vytvářím účet..."
                        : "Vytvořit účet"}
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>

                  </button>

                </form>


                <div className={styles.register}>

                  <span>
                    Už máš účet?
                  </span>

                  <p>
                    Přihlas se a pokračuj
                    ve svých nákupech.
                  </p>

                  <div className={styles.bottom}>

                    <Link href="/prihlaseni">
                      Přihlásit se →
                    </Link>

                  </div>

                </div>

              </>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}