
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createCustomerServerClient,
} from "../../lib/supabase/customer-server";

import {
  createAdminClient,
} from "../../lib/supabase/admin";

import {
  updateCustomerProfile,
} from "./actions";

import LogoutButton from "./LogoutButton";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

type CustomerOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_price: number | string;
  customer_token: string | null;
  tracking_number: string | null;
  cancellation_request_status: string | null;
};

type CustomerProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  switch (status) {
    case "new":
      return "Přijata";
    case "awaiting_payment":
      return "Čeká na platbu";
    case "paid":
      return "Zaplacena";
    case "processing":
      return "Připravujeme";
    case "shipped":
      return "Odeslána";
    case "completed":
      return "Dokončena";
    case "cancelled":
      return "Zrušena";
    default:
      return status;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ profil?: string }>;
}) {
  const authClient = await createCustomerServerClient();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/prihlaseni");
  }

  const supabase = createAdminClient();

  const [
    { data: ordersData, error: ordersError },
    { data: profileData, error: profileError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, created_at, status, total_price, customer_token, tracking_number, cancellation_request_status"
      )
      .eq("customer_user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("customer_profiles")
      .select("user_id, first_name, last_name, phone, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (ordersError) {
    console.error("CUSTOMER ORDERS ERROR:", ordersError);
    throw new Error("Nepodařilo se načíst objednávky.");
  }

  if (profileError) {
    console.error("CUSTOMER PROFILE ERROR:", profileError);
    throw new Error("Nepodařilo se načíst zákaznický profil.");
  }

  const orders = (ordersData ?? []) as CustomerOrder[];

  const profile = profileData as CustomerProfile | null;

  const firstName =
    profile?.first_name ||
    (typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : "");

  const lastName =
    profile?.last_name ||
    (typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name
      : "");

  const phone =
    profile?.phone ||
    (typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : "");

  const customerName = `${firstName} ${lastName}`.trim();

  const params = await searchParams;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              CARDORRA / ACCOUNT
            </div>

            <h1>
              Můj účet<span>.</span>
            </h1>

            <p>
              {firstName
                ? `Vítej zpátky, ${firstName}.`
                : "Vítej zpátky."}
            </p>
          </div>

          <div className={styles.logout}>
            <LogoutButton />
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.orders}>
            <div className={styles.sectionHead}>
              <div>
                <span>01 / OBJEDNÁVKY</span>
                <h2>Moje objednávky</h2>
              </div>

              <strong>{orders.length}</strong>
            </div>

            {orders.length === 0 ? (
              <div className={styles.empty}>
                <h3>Zatím tu nemáš žádné objednávky.</h3>

                <p>
                  Nové objednávky vytvořené po přihlášení
                  se ti budou zobrazovat tady.
                </p>

                <p>
                  Starší nákupy bez účtu zůstávají
                  dostupné přes jejich soukromý odkaz.
                </p>

                <Link href="/pokemon">
                  Prohlédnout produkty →
                </Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <article className={styles.order} key={order.id}>
                    <div className={styles.orderTop}>
                      <div>
                        <span>{formatDate(order.created_at)}</span>
                        <h3>{order.order_number}</h3>
                      </div>

                      <span className={styles.status}>
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <div className={styles.orderBottom}>
                      <div>
                        <span>Celkem</span>
                        <strong>
                          {formatPrice(Number(order.total_price))}
                        </strong>
                      </div>

                      {order.customer_token ? (
                        <Link
                          href={`/objednavka/moje/${order.customer_token}`}
                          className={styles.detailLink}
                        >
                          Zobrazit objednávku →
                        </Link>
                      ) : (
                        <span>Detail zatím není dostupný.</span>
                      )}
                    </div>

                    {order.cancellation_request_status === "requested" && (
                      <div className={styles.notice}>
                        Žádost o zrušení čeká na vyřízení.
                      </div>
                    )}

                    {order.tracking_number && (
                      <div className={styles.tracking}>
                        Tracking: {order.tracking_number}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.profile}>
            <div className={styles.sectionHead}>
              <div>
                <span>02 / PROFIL</span>
                <h2>Moje údaje</h2>
              </div>
            </div>

            {params.profil === "ulozeno" && (
              <div className={styles.profileSuccess}>
                Údaje byly úspěšně uloženy.
              </div>
            )}

            {params.profil === "neplatne" && (
              <div className={styles.profileError}>
                Zkontroluj zadané údaje. Jméno a příjmení
                musí mít alespoň 2 znaky a telefon alespoň 6 znaků.
              </div>
            )}

            {params.profil === "chyba" && (
              <div className={styles.profileError}>
                Údaje se nepodařilo uložit. Zkus to prosím znovu.
              </div>
            )}

            <form action={updateCustomerProfile} className={styles.profileForm}>
              <div className={styles.profileField}>
                <label htmlFor="first_name">Jméno</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  defaultValue={firstName}
                  minLength={2}
                  maxLength={60}
                  required
                />
              </div>

              <div className={styles.profileField}>
                <label htmlFor="last_name">Příjmení</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  defaultValue={lastName}
                  minLength={2}
                  maxLength={60}
                  required
                />
              </div>

              <div className={styles.profileField}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  disabled
                />
                <small>
                  E-mail zatím nelze změnit v této části profilu.
                </small>
              </div>

              <div className={styles.profileField}>
                <label htmlFor="phone">Telefonní číslo</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={phone}
                  minLength={6}
                  maxLength={30}
                  required
                />
              </div>

              <button type="submit" className={styles.profileSubmit}>
                Uložit změny →
              </button>
            </form>

            <div className={styles.profileNote}>
              Údaje v profilu můžeš kdykoliv upravit.
              Již vytvořené objednávky si zachovávají
              kontaktní údaje zadané při nákupu.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
