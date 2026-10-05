
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createCustomerServerClient,
} from "../../lib/supabase/customer-server";

import {
  createAdminClient,
} from "../../lib/supabase/admin";

import LogoutButton from "./LogoutButton";

import styles from "./account.module.css";


export const dynamic =
  "force-dynamic";


function formatPrice(
  price: number
) {
  return (
    new Intl.NumberFormat(
      "cs-CZ"
    ).format(price) + " Kč"
  );
}


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "cs-CZ",
    {
      dateStyle: "medium",
      timeZone: "Europe/Prague",
    }
  ).format(
    new Date(value)
  );
}


function statusLabel(
  status: string
) {
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


export default async function AccountPage() {
  /*
    Nejdříve ověříme skutečně
    přihlášeného uživatele.
  */

  const authClient =
    await createCustomerServerClient();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/prihlaseni");
  }


  /*
    Serverový admin klient použijeme
    výhradně po ověření přihlášení.

    Dotaz je omezen na ID zákazníka.
  */

  const supabase =
    createAdminClient();

  const {
    data: orders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(
      [
        "id",
        "order_number",
        "created_at",
        "status",
        "total_price",
        "customer_token",
        "tracking_number",
        "cancellation_request_status",
      ].join(",")
    )
    .eq(
      "customer_user_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );


  if (ordersError) {
    console.error(
      "CUSTOMER ORDERS ERROR:",
      ordersError
    );

    throw new Error(
      "Nepodařilo se načíst objednávky."
    );
  }


  const customerName =
    typeof user.user_metadata?.full_name ===
    "string"
      ? user.user_metadata.full_name
      : "";


  return (
    <main className={styles.page}>

      <div className={styles.container}>

        {/* ZÁHLAVÍ */}

        <div className={styles.header}>

          <div>

            <div className={styles.eyebrow}>
              CARDORRA / ACCOUNT
            </div>

            <h1>
              Můj účet<span>.</span>
            </h1>

            <p>
              {customerName
                ? `Vítej zpátky, ${customerName}.`
                : "Vítej zpátky."}
            </p>

          </div>

          <div className={styles.logout}>
            <LogoutButton />
          </div>

        </div>


        <div className={styles.layout}>

          {/* OBJEDNÁVKY */}

          <section className={styles.orders}>

            <div className={styles.sectionHead}>

              <div>

                <span>
                  01 / OBJEDNÁVKY
                </span>

                <h2>
                  Moje objednávky
                </h2>

              </div>

              <strong>
                {orders?.length || 0}
              </strong>

            </div>


            {!orders || orders.length === 0 ? (

              <div className={styles.empty}>

                <h3>
                  Zatím tu nemáš žádné objednávky.
                </h3>

                <p>
                  Nové objednávky vytvořené
                  po přihlášení se ti budou
                  zobrazovat tady.
                </p>

                <p>
                  Starší nákupy bez účtu
                  zatím zůstávají dostupné
                  přes jejich soukromý odkaz.
                </p>

                <Link href="/pokemon">
                  Prohlédnout produkty →
                </Link>

              </div>

            ) : (

              <div className={styles.orderList}>

                {orders.map(
                  (order) => (

                    <article
                      className={styles.order}
                      key={order.id}
                    >

                      <div className={styles.orderTop}>

                        <div>

                          <span>
                            {formatDate(
                              order.created_at
                            )}
                          </span>

                          <h3>
                            {order.order_number}
                          </h3>

                        </div>

                        <span className={styles.status}>
                          {statusLabel(
                            order.status
                          )}
                        </span>

                      </div>


                      <div className={styles.orderBottom}>

                        <div>

                          <span>
                            Celkem
                          </span>

                          <strong>
                            {formatPrice(
                              Number(
                                order.total_price
                              )
                            )}
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

                          <span>
                            Detail zatím není dostupný.
                          </span>

                        )}

                      </div>


                      {order.cancellation_request_status ===
                        "requested" && (

                        <div className={styles.notice}>
                          Žádost o zrušení čeká na vyřízení.
                        </div>

                      )}


                      {order.tracking_number && (

                        <div className={styles.tracking}>
                          Tracking:{" "}
                          {order.tracking_number}
                        </div>

                      )}

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* PROFIL */}

          <aside className={styles.profile}>

            <div className={styles.sectionHead}>

              <div>

                <span>
                  02 / PROFIL
                </span>

                <h2>
                  Moje údaje
                </h2>

              </div>

            </div>


            <div className={styles.profileRow}>

              <span>
                Jméno
              </span>

              <strong>
                {customerName || "Neuvedeno"}
              </strong>

            </div>


            <div className={styles.profileRow}>

              <span>
                E-mail
              </span>

              <strong>
                {user.email}
              </strong>

            </div>


            <div className={styles.profileNote}>
              Uložené doručovací adresy
              a úpravu profilu přidáme
              v další části zákaznického účtu.
            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}