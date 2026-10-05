import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  createAdminClient,
} from "../../../../../lib/supabase/admin";

import {
  ORDER_STATUSES,
  orderStatusClass,
  orderStatusLabel,
  shippingMethodLabel,
  paymentMethodLabel,
} from "../../../../../lib/admin/orders";

import {
  updateOrder,
  cancelOrder,
  rejectCancellationRequest,
} from "../actions";


type Props = {

  params:
    Promise<{
      id: string;
    }>;

  searchParams:
    Promise<{
      saved?: string;
      error?: string;
      cancelled?: string;
      refund?: string;
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


function refundStatusLabel(
  value: string
) {

  switch (value) {

    case "pending":
      return "Čeká na refundaci";

    case "refunded":
      return "Refundováno";

    case "partially_refunded":
      return "Částečně refundováno";

    case "failed":
      return "Refundace selhala";

    default:
      return "Bez refundace";

  }

}


export default async function OrderDetailPage({
  params,
  searchParams,
}: Props) {

  const {
    id,
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
        "id",
        id
      )
      .maybeSingle();


  if (
    error ||
    !order
  ) {

    notFound();

  }



  const [
    itemsResult,
    historyResult,
  ] =
    await Promise.all([

      supabase
        .from("order_items")
        .select("*")
        .eq(
          "order_id",
          id
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          }
        ),

      supabase
        .from(
          "order_status_history"
        )
        .select("*")
        .eq(
          "order_id",
          id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

    ]);


  const items =
    itemsResult.data ||
    [];


  const history =
    historyResult.data ||
    [];


  const totalItems =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity
        ),
      0
    );


  const productSlugs =
    Array.from(
      new Set(
        items.map(
          (item) =>
            item.product_slug
        )
      )
    );


  let productVisuals: {
    slug: string;
    image: string;
    emoji: string;
  }[] = [];


  if (
    productSlugs.length > 0
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
          productSlugs
        );


    productVisuals =
      data || [];

  }


  const visualMap =
    new Map(
      productVisuals.map(
        (product) => [
          product.slug,
          product,
        ]
      )
    );


  const isCancelled =
    order.status ===
    "cancelled";


  const isFulfilled =
    order.status ===
      "shipped" ||
    order.status ===
      "completed";


  const canCancel =
    !isCancelled &&
    !isFulfilled;


  const hasCancellationRequest =
    order.cancellation_request_status ===
    "requested";


  const refundPending =
    order.refund_status ===
    "pending";


  return (
    <main className="adminMain">


      {/* =========================
          ZPĚT
      ========================== */}

      <div className="orderDetailBack">

        <Link href="/admin/objednavky">
          ← Objednávky
        </Link>

      </div>



      {/* =========================
          HEADER
      ========================== */}

      <div className="orderDetailHeader">

        <div>

          <div className="adminEyebrow">
            OBJEDNÁVKA
          </div>


          <div className="orderTitleRow">

            <h1>
              {order.order_number}
            </h1>


            <span
              className={
                orderStatusClass(
                  order.status
                )
              }
            >
              {orderStatusLabel(
                order.status
              )}
            </span>

          </div>


          <p>
            Vytvořeno{" "}
            {formatDate(
              order.created_at
            )}
          </p>

        </div>


        <a
          href={`mailto:${order.customer_email}`}
          className="orderContactButton"
        >
          Napsat zákazníkovi
        </a>

      </div>



      {/* =========================
          NOTIFIKACE
      ========================== */}

      {query.saved && (

        <div className="orderAdminSuccess">

          {query.saved ===
          "rejected"
            ? "✓ Žádost o zrušení byla zamítnuta."
            : "✓ Objednávka byla aktualizována."}

        </div>

      )}


      {query.cancelled && (

        <div className="orderAdminSuccess">
          ✓ Objednávka byla zrušena a produkty byly vráceny na sklad.
        </div>

      )}


      {query.refund ===
        "pending" && (

        <div className="orderRefundWarning">

          <strong>
            ⚠ Objednávka čeká na refundaci
          </strong>

          <span>
            Vrátit zákazníkovi:{" "}
            {formatPrice(
              Number(
                order.refund_amount ||
                order.total_price
              )
            )}
          </span>

        </div>

      )}


      {query.error ===
        "already-fulfilled" && (

        <div className="orderAdminError">
          Odeslanou nebo dokončenou objednávku už nelze tímto způsobem zrušit.
        </div>

      )}


      {query.error &&
        query.error !==
          "already-fulfilled" && (

        <div className="orderAdminError">
          Změnu objednávky se nepodařilo uložit.
        </div>

      )}



      {/* =========================
          ŽÁDOST O ZRUŠENÍ
      ========================== */}

      {hasCancellationRequest && (

        <div className="orderCancellationRequest">

          <div>

            <span>
              ⚠ ŽÁDOST O ZRUŠENÍ
            </span>

            <strong>
              Zákazník žádá o zrušení objednávky.
            </strong>


            {order.cancellation_reason && (

              <p>
                „{order.cancellation_reason}“
              </p>

            )}


            <small>
              Požádáno{" "}
              {formatDate(
                order.cancellation_requested_at
              )}
            </small>

          </div>



          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                "10px",

              marginTop:
                "14px",
            }}
          >


            <form
              action={
                cancelOrder
              }
            >

              <input
                type="hidden"
                name="order_id"
                value={
                  order.id
                }
              />


              <input
                type="hidden"
                name="cancel_reason"
                value={
                  order.cancellation_reason ||
                  "Schválena žádost zákazníka"
                }
              />


              <button
                type="submit"
                className="adminPrimaryButton"
                style={{
                  width:
                    "100%",
                }}
              >
                Schválit a zrušit
              </button>

            </form>



            <form
              action={
                rejectCancellationRequest
              }
            >

              <input
                type="hidden"
                name="order_id"
                value={
                  order.id
                }
              />


              <input
                type="hidden"
                name="reject_note"
                value="Žádost o zrušení byla zamítnuta administrací."
              />


              <button
                type="submit"
                className="orderCancelButton"
                style={{
                  width:
                    "100%",
                }}
              >
                Zamítnout
              </button>

            </form>

          </div>

        </div>

      )}



      {/* =========================
          DETAIL
      ========================== */}

      <div className="orderDetailLayout">


        {/* =========================
            LEVÁ ČÁST
        ========================== */}

        <div className="orderDetailMain">


          {/* PRODUKTY */}

          <section className="orderCard">

            <div className="orderCardHead">

              <div>

                <span>
                  POLOŽKY
                </span>

                <h2>
                  Produkty
                </h2>

              </div>


              <strong>
                {totalItems} ks
              </strong>

            </div>


            <div className="orderItems">

              {items.map(
                (item) => {

                  const visual =
                    visualMap.get(
                      item.product_slug
                    );


                  return (

                    <div
                      className="orderItem"
                      key={
                        item.id
                      }
                    >

                      <div className="orderItemImage">

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


                      <div className="orderItemName">

                        <strong>
                          {item.product_name}
                        </strong>

                        <span>
                          {item.product_slug}
                        </span>

                      </div>


                      <div className="orderItemQuantity">
                        {item.quantity}×
                      </div>


                      <div className="orderItemPrice">

                        <span>
                          {formatPrice(
                            Number(
                              item.price
                            )
                          )}{" "}
                          / ks
                        </span>

                        <strong>
                          {formatPrice(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          )}
                        </strong>

                      </div>

                    </div>

                  );

                }
              )}

            </div>


            <div className="orderTotals">

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


              <div className="orderGrandTotal">

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



          {/* =========================
              HISTORIE
          ========================== */}

          <section className="orderCard">

            <div className="orderCardHead">

              <div>

                <span>
                  HISTORIE
                </span>

                <h2>
                  Průběh objednávky
                </h2>

              </div>

            </div>


            <div className="orderTimeline">

              {history.length ===
              0 ? (

                <div className="orderTimelineEmpty">
                  Zatím bez historie.
                </div>

              ) : (

                history.map(
                  (entry) => (

                    <div
                      className="orderTimelineItem"
                      key={
                        entry.id
                      }
                    >

                      <div className="orderTimelineDot" />


                      <div>

                        <strong>

                          {entry.old_status
                            ? `${orderStatusLabel(
                                entry.old_status
                              )} → ${orderStatusLabel(
                                entry.new_status
                              )}`
                            : orderStatusLabel(
                                entry.new_status
                              )}

                        </strong>


                        {entry.note && (

                          <p>
                            {entry.note}
                          </p>

                        )}


                        <span>
                          {formatDate(
                            entry.created_at
                          )}
                        </span>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>


        </div>



        {/* =========================
            PRAVÁ ČÁST
        ========================== */}

        <aside className="orderDetailSide">


          {/* SPRÁVA */}

          <section className="orderCard orderManagement">

            <div className="orderCardHead">

              <div>

                <span>
                  SPRÁVA
                </span>

                <h2>
                  Stav objednávky
                </h2>

              </div>

            </div>


            {isCancelled ? (

              <div className="orderCancelledState">

                <strong>
                  Objednávka je zrušená
                </strong>


                <span>
                  Zrušeno{" "}
                  {formatDate(
                    order.cancelled_at
                  )}
                </span>


                <span>
                  Sklad vrácen{" "}
                  {formatDate(
                    order.stock_returned_at
                  )}
                </span>

              </div>

            ) : (

              <form
                action={updateOrder}
                className="orderManageForm"
              >

                <input
                  type="hidden"
                  name="order_id"
                  value={
                    order.id
                  }
                />


                <label>

                  <span>
                    Stav
                  </span>

                  <select
                    name="status"
                    defaultValue={
                      order.status
                    }
                  >

                    {ORDER_STATUSES
                      .filter(
                        (status) =>
                          status.value !==
                          "cancelled"
                      )
                      .map(
                        (status) => (

                          <option
                            key={
                              status.value
                            }
                            value={
                              status.value
                            }
                          >
                            {status.label}
                          </option>

                        )
                      )}

                  </select>


                  <small>
                    Zrušení objednávky se provádí zvlášť.
                  </small>

                </label>


                <label>

                  <span>
                    Tracking číslo
                  </span>

                  <input
                    name="tracking_number"
                    defaultValue={
                      order.tracking_number ||
                      ""
                    }
                    placeholder="Např. Z123456789"
                  />

                </label>


                <label>

                  <span>
                    Interní poznámka
                  </span>

                  <textarea
                    name="admin_note"
                    rows={5}
                    defaultValue={
                      order.admin_note ||
                      ""
                    }
                    placeholder="Vidí pouze administrace..."
                  />

                </label>


                <label>

                  <span>
                    Poznámka ke změně
                  </span>

                  <input
                    name="status_note"
                    placeholder="Např. zásilka připravena"
                  />

                  <small>
                    Zapíše se do historie objednávky.
                  </small>

                </label>


                <button
                  type="submit"
                  className="adminPrimaryButton orderSaveButton"
                >
                  Uložit objednávku →
                </button>

              </form>

            )}

          </section>



          {/* REFUND */}

          {(order.refund_status !==
            "none" ||
            order.payment_status ===
              "paid") && (

            <section className="orderCard">

              <div className="orderCardHead">

                <div>

                  <span>
                    REFUNDACE
                  </span>

                  <h2>
                    Vrácení platby
                  </h2>

                </div>

              </div>


              <div className="orderInfoList">

                <div>

                  <span>
                    Stav
                  </span>

                  <strong
                    className={
                      refundPending
                        ? "orderRefundPending"
                        : ""
                    }
                  >
                    {refundStatusLabel(
                      order.refund_status
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Částka
                  </span>

                  <strong>
                    {formatPrice(
                      Number(
                        order.refund_amount ||
                        0
                      )
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Refundováno
                  </span>

                  <strong>
                    {formatDate(
                      order.refunded_at
                    )}
                  </strong>

                </div>

              </div>


              {refundPending && (

                <div className="orderRefundInfo">

                  Až bude napojený Comgate,
                  odsud budeme moct refundaci
                  spustit přímo na původní kartu.

                </div>

              )}

            </section>

          )}



          {/* ZÁKAZNÍK */}

          <section className="orderCard">

            <div className="orderCardHead">

              <div>

                <span>
                  ZÁKAZNÍK
                </span>

                <h2>
                  Kontaktní údaje
                </h2>

              </div>

            </div>


            <div className="orderInfoList">

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

                <a
                  href={`mailto:${order.customer_email}`}
                >
                  {order.customer_email}
                </a>

              </div>


              <div>

                <span>
                  Telefon
                </span>

                <a
                  href={`tel:${order.customer_phone}`}
                >
                  {order.customer_phone}
                </a>

              </div>

            </div>

          </section>



          {/* DOPRAVA */}

          <section className="orderCard">

            <div className="orderCardHead">

              <div>

                <span>
                  DOPRAVA
                </span>

                <h2>
                  Doručení
                </h2>

              </div>

            </div>


            <div className="orderInfoList">

              <div>

                <span>
                  Způsob
                </span>

                <strong>
                  {shippingMethodLabel(
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
                      "Zatím nevybráno"}
                  </strong>

                  {order.shipping_point_id && (

                    <small>
                      ID:{" "}
                      {order.shipping_point_id}
                    </small>

                  )}

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



          {/* PLATBA */}

          <section className="orderCard">

            <div className="orderCardHead">

              <div>

                <span>
                  PLATBA
                </span>

                <h2>
                  Platba
                </h2>

              </div>

            </div>


            <div className="orderInfoList">

              <div>

                <span>
                  Metoda
                </span>

                <strong>
                  {paymentMethodLabel(
                    order.payment_method
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Stav platby
                </span>

                <strong>
                  {order.payment_status ||
                    "pending"}
                </strong>

              </div>


              <div>

                <span>
                  Zaplaceno
                </span>

                <strong>
                  {formatDate(
                    order.paid_at
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Odesláno
                </span>

                <strong>
                  {formatDate(
                    order.shipped_at
                  )}
                </strong>

              </div>

            </div>

          </section>



          {/* DANGER ZONE */}

          {canCancel &&
            !hasCancellationRequest && (

            <section className="orderDangerZone">

              <div className="orderDangerHead">

                <span>
                  NEBEZPEČNÁ ZÓNA
                </span>

                <h2>
                  Zrušit objednávku
                </h2>

                <p>
                  Zrušením objednávky se všechny
                  její produkty automaticky vrátí
                  zpět na sklad.
                </p>

              </div>


              <div className="orderStockReturnPreview">

                <strong>
                  Na sklad se vrátí:
                </strong>


                {items.map(
                  (item) => (

                    <div
                      key={
                        item.id
                      }
                    >

                      <span>
                        {item.product_name}
                      </span>

                      <b>
                        +{item.quantity} ks
                      </b>

                    </div>

                  )
                )}

              </div>


              {order.payment_status ===
                "paid" && (

                <div className="orderPaidCancelWarning">

                  <strong>
                    ⚠ Objednávka je zaplacená
                  </strong>

                  <span>
                    Po zrušení vznikne refundace
                    ve výši{" "}
                    {formatPrice(
                      Number(
                        order.total_price
                      )
                    )}
                    .
                  </span>

                </div>

              )}


              <form
                action={
                  cancelOrder
                }
                className="orderCancelForm"
              >

                <input
                  type="hidden"
                  name="order_id"
                  value={
                    order.id
                  }
                />


                <label>

                  <span>
                    Důvod zrušení
                  </span>

                  <textarea
                    name="cancel_reason"
                    rows={3}
                    maxLength={500}
                    placeholder="Např. zákazník požádal o zrušení objednávky..."
                  />

                </label>


                <button
                  type="submit"
                  className="orderCancelButton"
                >
                  Zrušit objednávku a vrátit sklad
                </button>

              </form>


              <small className="orderDangerNote">
                Tuto operaci nelze běžným přepnutím stavu vrátit zpět.
              </small>

            </section>

          )}


        </aside>

      </div>


    </main>
  );
}