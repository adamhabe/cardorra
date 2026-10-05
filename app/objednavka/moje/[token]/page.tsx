import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";

import {
  requestCancellation,
} from "./actions";


export const dynamic =
  "force-dynamic";


export const metadata = {

  robots: {
    index: false,
    follow: false,
  },

};


type Props = {

  params:
    Promise<{
      token: string;
    }>;

  searchParams:
    Promise<{
      created?: string;
      requested?: string;
      error?: string;
    }>;

};


function formatPrice(
  price: number
) {

  return (
    new Intl.NumberFormat(
      "cs-CZ"
    ).format(price) +
    " Kč"
  );

}


function formatDate(
  value:
    string |
    null
) {

  if (!value) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "cs-CZ",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",

      timeZone:
        "Europe/Prague",
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
      return "Objednávka přijata";

    case "awaiting_payment":
      return "Čeká na platbu";

    case "paid":
      return "Zaplaceno";

    case "processing":
      return "Připravujeme";

    case "shipped":
      return "Odesláno";

    case "completed":
      return "Dokončeno";

    case "cancelled":
      return "Zrušeno";

    default:
      return status;

  }

}


function paymentLabel(
  method: string
) {

  switch (method) {

    case "cod":
      return "Dobírka";

    case "card":
      return "Platba kartou";

    case "bank":
      return "Bankovní převod";

    default:
      return method;

  }

}


function paymentStatusLabel(
  status: string
) {

  switch (status) {

    case "paid":
      return "Zaplaceno";

    case "failed":
      return "Platba selhala";

    case "refunded":
      return "Refundováno";

    case "partially_refunded":
      return "Částečně refundováno";

    default:
      return "Čeká na platbu";

  }

}


function shippingLabel(
  method: string
) {

  switch (method) {

    case "pickup":
      return "Výdejní místo";

    case "address":
      return "Doručení na adresu";

    case "personal":
      return "Osobní předání";

    default:
      return method;

  }

}


function progressIndex(
  status: string
) {

  if (
    status === "completed"
  ) {
    return 3;
  }


  if (
    status === "shipped"
  ) {
    return 2;
  }


  if (
    status === "paid" ||
    status === "processing"
  ) {
    return 1;
  }


  return 0;

}


export default async function CustomerOrderPage({
  params,
  searchParams,
}: Props) {

  const {
    token,
  } =
    await params;


  const query =
    await searchParams;


  const supabase =
    createAdminClient();


  const {
    data: order,
    error,
  } =
    await supabase
      .from("orders")
      .select("*")
      .eq(
        "customer_token",
        token
      )
      .maybeSingle();


  if (
    error ||
    !order
  ) {

    notFound();

  }


  const {
    data: items,
  } =
    await supabase
      .from("order_items")
      .select("*")
      .eq(
        "order_id",
        order.id
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );


  const orderItems =
    items || [];


  const slugs =
    Array.from(
      new Set(
        orderItems.map(
          (item) =>
            item.product_slug
        )
      )
    );


  let visuals: {
    slug: string;
    image: string;
    emoji: string;
  }[] = [];


  if (
    slugs.length > 0
  ) {

    const {
      data,
    } =
      await supabase
        .from("products")
        .select(
          "slug, image, emoji"
        )
        .in(
          "slug",
          slugs
        );


    visuals =
      data || [];

  }


  const visualMap =
    new Map(
      visuals.map(
        (item) => [
          item.slug,
          item,
        ]
      )
    );


  const isCancelled =
    order.status ===
    "cancelled";


  const canRequestCancellation =
    ![
      "shipped",
      "completed",
      "cancelled",
    ].includes(
      order.status
    );


  const cancellationRequested =
    order.cancellation_request_status ===
    "requested";


  const cancellationRejected =
    order.cancellation_request_status ===
    "rejected";


  const currentProgress =
    progressIndex(
      order.status
    );


  const cancellationAction =
    requestCancellation.bind(
      null,
      token
    );


  return (
    <main className="customerOrderPage">


      {/* NAV */}

      <nav className="nav">

        <div className="navLeft">

          <Link
            href="/"
            className="logo"
          >
            TCG<span>VAULT</span>
          </Link>

        </div>


        <div className="navLinks">

          <Link href="/">
            Domů
          </Link>

          <Link href="/pokemon">
            Pokémon
          </Link>

        </div>

      </nav>



      <div className="customerOrderContainer">


        {/* CREATED */}

        {query.created && (

          <div className="customerOrderSuccess">

            <strong>
              ✓ Objednávku jsme přijali
            </strong>

            <span>
              Číslo objednávky je{" "}
              {order.order_number}.
            </span>

          </div>

        )}



        {query.requested && (

          <div className="customerOrderSuccess">

            <strong>
              Žádost byla odeslána
            </strong>

            <span>
              Zrušení musí nejdřív potvrdit
              administrace.
            </span>

          </div>

        )}



        {query.error && (

          <div className="customerOrderError">

            {query.error ===
            "reason"
              ? "Napiš prosím důvod zrušení."
              : query.error ===
                "not-allowed"
              ? "Tuto objednávku už nelze zrušit tímto způsobem."
              : query.error ===
                "resolved"
              ? "Žádost o zrušení už byla vyřízena."
              : "Žádost se nepodařilo odeslat."}

          </div>

        )}



        {/* HEADER */}

        <header className="customerOrderHeader">

          <div>

            <div className="eyebrow">
              TVOJE OBJEDNÁVKA
            </div>


            <h1>
              {order.order_number}
            </h1>


            <p>
              Vytvořeno{" "}
              {formatDate(
                order.created_at
              )}
            </p>

          </div>


          <span
            className={
              `customerOrderStatus customerOrderStatus--${order.status}`
            }
          >
            {statusLabel(
              order.status
            )}
          </span>

        </header>



        {/* PROGRESS */}

        {!isCancelled && (

          <section className="customerProgress">

            {[
              "Přijata",
              "Připravuje se",
              "Odeslána",
              "Dokončena",
            ].map(
              (
                step,
                index
              ) => (

                <div
                  key={step}
                  className={
                    index <=
                    currentProgress
                      ? "customerProgressStep active"
                      : "customerProgressStep"
                  }
                >

                  <div>
                    {index + 1}
                  </div>

                  <span>
                    {step}
                  </span>

                </div>

              )
            )}

          </section>

        )}



        {isCancelled && (

          <div className="customerCancelled">

            <strong>
              Objednávka byla zrušena.
            </strong>

            <span>
              Zrušeno{" "}
              {formatDate(
                order.cancelled_at
              )}
            </span>

          </div>

        )}



        <div className="customerOrderLayout">


          {/* LEFT */}

          <div className="customerOrderMain">


            {/* PRODUCTS */}

            <section className="customerOrderCard">

              <div className="customerOrderCardHead">

                <span>
                  POLOŽKY
                </span>

                <h2>
                  Produkty
                </h2>

              </div>


              <div className="customerOrderItems">

                {orderItems.map(
                  (item) => {

                    const visual =
                      visualMap.get(
                        item.product_slug
                      );


                    return (

                      <div
                        className="customerOrderItem"
                        key={
                          item.id
                        }
                      >

                        <div className="customerOrderImage">

                          {visual?.image ? (

                            <img
                              src={
                                visual.image
                              }
                              alt=""
                            />

                          ) : (

                            <span>
                              {visual?.emoji ||
                                "🎴"}
                            </span>

                          )}

                        </div>


                        <div>

                          <strong>
                            {item.product_name}
                          </strong>

                          <span>
                            {item.quantity}×{" "}
                            {formatPrice(
                              Number(
                                item.price
                              )
                            )}
                          </span>

                        </div>


                        <b>
                          {formatPrice(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          )}
                        </b>

                      </div>

                    );

                  }
                )}

              </div>


              <div className="customerOrderTotals">

                <div>

                  <span>
                    Produkty
                  </span>

                  <strong>
                    {formatPrice(
                      Number(
                        order.products_price
                      )
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Doprava
                  </span>

                  <strong>
                    {formatPrice(
                      Number(
                        order.shipping_price
                      )
                    )}
                  </strong>

                </div>


                <div className="customerOrderTotal">

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

              </div>

            </section>



            {/* TRACKING */}

            {order.tracking_number && (

              <section className="customerOrderCard">

                <div className="customerOrderCardHead">

                  <span>
                    ZÁSILKA
                  </span>

                  <h2>
                    Sledování zásilky
                  </h2>

                </div>


                <div className="customerTracking">

                  <span>
                    Tracking číslo
                  </span>

                  <strong>
                    {order.tracking_number}
                  </strong>

                  <p>
                    Po napojení dopravce tady
                    bude i přímý odkaz na sledování.
                  </p>

                </div>

              </section>

            )}



            {/* CANCELLATION */}

            <section className="customerOrderCard">

              <div className="customerOrderCardHead">

                <span>
                  SPRÁVA OBJEDNÁVKY
                </span>

                <h2>
                  Zrušení objednávky
                </h2>

              </div>


              {cancellationRequested ? (

                <div className="customerCancelPending">

                  <strong>
                    Žádost čeká na vyřízení
                  </strong>

                  <p>
                    Důvod:
                  </p>

                  <blockquote>
                    {order.cancellation_reason}
                  </blockquote>

                </div>

              ) : cancellationRejected ? (

                <div className="customerCancelRejected">

                  <strong>
                    Žádost o zrušení byla zamítnuta
                  </strong>


                  {order.cancellation_resolution_note && (

                    <p>
                      {order.cancellation_resolution_note}
                    </p>

                  )}

                </div>

              ) : canRequestCancellation ? (

                <form
                  action={
                    cancellationAction
                  }
                  className="customerCancelForm"
                >

                  <p>
                    Pokud už objednávku nechceš,
                    můžeš požádat o její zrušení.
                    Objednávku zruší až administrace.
                  </p>


                  <label>

                    <span>
                      Důvod zrušení
                    </span>

                    <textarea
                      name="reason"
                      rows={4}
                      required
                      minLength={3}
                      maxLength={500}
                      placeholder="Např. objednal jsem omylem dvakrát..."
                    />

                  </label>


                  <button
                    type="submit"
                  >
                    Požádat o zrušení
                  </button>

                </form>

              ) : (

                <div className="customerCancelUnavailable">

                  {isCancelled
                    ? "Objednávka už byla zrušena."
                    : "Objednávka už je v takové fázi, že ji tímto způsobem nelze zrušit."}

                </div>

              )}

            </section>


          </div>



          {/* RIGHT */}

          <aside className="customerOrderSide">


            {/* SHIPPING */}

            <section className="customerOrderCard">

              <div className="customerOrderCardHead">

                <span>
                  DOPRAVA
                </span>

                <h2>
                  Doručení
                </h2>

              </div>


              <div className="customerInfo">

                <div>

                  <span>
                    Způsob
                  </span>

                  <strong>
                    {shippingLabel(
                      order.shipping_method
                    )}
                  </strong>

                </div>


                {order.shipping_method ===
                  "pickup" && (

                  <div>

                    <span>
                      Výdejní místo
                    </span>

                    <strong>
                      {order.shipping_point_name ||
                        "Zatím neurčeno"}
                    </strong>

                  </div>

                )}


                {order.shipping_method ===
                  "address" && (

                  <div>

                    <span>
                      Adresa
                    </span>

                    <strong>
                      {order.street}
                    </strong>

                    <strong>
                      {order.zip}{" "}
                      {order.city}
                    </strong>

                  </div>

                )}

              </div>

            </section>



            {/* PAYMENT */}

            <section className="customerOrderCard">

              <div className="customerOrderCardHead">

                <span>
                  PLATBA
                </span>

                <h2>
                  Platba
                </h2>

              </div>


              <div className="customerInfo">

                <div>

                  <span>
                    Metoda
                  </span>

                  <strong>
                    {paymentLabel(
                      order.payment_method
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Stav
                  </span>

                  <strong>
                    {order.payment_method ===
                    "cod"
                      ? "Platba při převzetí"
                      : paymentStatusLabel(
                          order.payment_status
                        )}
                  </strong>

                </div>


                {order.refund_status !==
                  "none" && (

                  <div>

                    <span>
                      Refundace
                    </span>

                    <strong>
                      {order.refund_status ===
                      "pending"
                        ? "Čeká na refundaci"
                        : order.refund_status ===
                          "refunded"
                        ? "Refundováno"
                        : "Zpracovává se"}
                    </strong>

                  </div>

                )}

              </div>

            </section>



            {/* CONTACT */}

            <section className="customerOrderCard">

              <div className="customerOrderCardHead">

                <span>
                  KONTAKT
                </span>

                <h2>
                  Údaje objednávky
                </h2>

              </div>


              <div className="customerInfo">

                <div>

                  <span>
                    Jméno
                  </span>

                  <strong>
                    {order.customer_name}
                  </strong>

                </div>


                <div>

                  <span>
                    E-mail
                  </span>

                  <strong>
                    {order.customer_email}
                  </strong>

                </div>


                <div>

                  <span>
                    Telefon
                  </span>

                  <strong>
                    {order.customer_phone}
                  </strong>

                </div>

              </div>

            </section>



            <div className="customerPrivateLink">

              <strong>
                Soukromý odkaz
              </strong>

              <p>
                Tento odkaz umožňuje zobrazit
                tvoji objednávku. Nesdílej ho
                veřejně.
              </p>

            </div>


          </aside>

        </div>

      </div>

    </main>
  );
}