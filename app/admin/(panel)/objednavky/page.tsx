import Link from "next/link";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";

import {
  isOrderStatus,
  orderStatusClass,
  orderStatusLabel,
  shippingMethodLabel,
  paymentMethodLabel,
} from "../../../../lib/admin/orders";


export const dynamic =
  "force-dynamic";


const PAGE_SIZE =
  20;


type Props = {

  searchParams:
    Promise<{
      q?: string;
      status?: string;
      page?: string;
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
  value: string
) {

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


function cleanSearch(
  value: string
) {

  return value
    .replace(
      /[,%()]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .slice(
      0,
      80
    );

}


export default async function OrdersPage({
  searchParams,
}: Props) {

  const params =
    await searchParams;


  const q =
    cleanSearch(
      params.q || ""
    );


  const statusFilter =
    params.status &&
    isOrderStatus(
      params.status
    )
      ? params.status
      : "all";


  const requestedPage =
    Number(
      params.page ||
      1
    );


  const currentPage =
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;


  const from =
    (
      currentPage -
      1
    ) *
    PAGE_SIZE;


  const to =
    from +
    PAGE_SIZE -
    1;


  const supabase =
    createAdminClient();


  let ordersQuery =
    supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          shipping_method,
          payment_method,
          total_price,
          status,
          created_at
        `,
        {
          count:
            "exact",
        }
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (
    statusFilter !==
    "all"
  ) {

    ordersQuery =
      ordersQuery.eq(
        "status",
        statusFilter
      );

  }


  if (q) {

    ordersQuery =
      ordersQuery.or(
        [
          `order_number.ilike.%${q}%`,
          `customer_name.ilike.%${q}%`,
          `customer_email.ilike.%${q}%`,
        ].join(",")
      );

  }


  const [
    ordersResult,
    totalResult,
    newResult,
    paidResult,
    processingResult,
  ] =
    await Promise.all([

      ordersQuery.range(
        from,
        to
      ),

      supabase
        .from("orders")
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        ),

      supabase
        .from("orders")
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .eq(
          "status",
          "new"
        ),

      supabase
        .from("orders")
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .eq(
          "status",
          "paid"
        ),

      supabase
        .from("orders")
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .eq(
          "status",
          "processing"
        ),

    ]);


  if (
    ordersResult.error
  ) {

    console.error(
      "ADMIN ORDERS ERROR:",
      ordersResult.error
    );

  }


  const orders =
    ordersResult.data ||
    [];


  const filteredCount =
    ordersResult.count ||
    0;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredCount /
        PAGE_SIZE
      )
    );


  function pageHref(
    page: number
  ) {

    const search =
      new URLSearchParams();


    if (q) {

      search.set(
        "q",
        q
      );

    }


    if (
      statusFilter !==
      "all"
    ) {

      search.set(
        "status",
        statusFilter
      );

    }


    if (
      page > 1
    ) {

      search.set(
        "page",
        String(page)
      );

    }


    const query =
      search.toString();


    return query
      ? `/admin/objednavky?${query}`
      : "/admin/objednavky";

  }


  return (
    <main className="adminMain">


      <div className="adminPageHeader">

        <div>

          <div className="adminEyebrow">
            OBJEDNÁVKY
          </div>

          <h1>
            Objednávky
          </h1>

          <p>
            Kompletní správa objednávek,
            zákazníků, plateb a expedice.
          </p>

        </div>

      </div>



      {params.error && (

        <div className="orderAdminError">
          Objednávku se nepodařilo načíst nebo upravit.
        </div>

      )}



      <section className="orderStats">

        <div>

          <span>
            CELKEM
          </span>

          <strong>
            {totalResult.count ||
              0}
          </strong>

        </div>


        <div>

          <span>
            NOVÉ
          </span>

          <strong>
            {newResult.count ||
              0}
          </strong>

        </div>


        <div>

          <span>
            ZAPLACENÉ
          </span>

          <strong>
            {paidResult.count ||
              0}
          </strong>

        </div>


        <div>

          <span>
            PŘIPRAVUJÍ SE
          </span>

          <strong>
            {processingResult.count ||
              0}
          </strong>

        </div>

      </section>



      <section className="orderPanel">


        <form
          method="GET"
          className="orderToolbar"
        >

          <input
            name="q"
            defaultValue={q}
            placeholder="Číslo objednávky, jméno nebo e-mail..."
          />


          <select
            name="status"
            defaultValue={
              statusFilter
            }
          >

            <option value="all">
              Všechny stavy
            </option>

            <option value="new">
              Nové
            </option>

            <option value="awaiting_payment">
              Čeká na platbu
            </option>

            <option value="paid">
              Zaplacené
            </option>

            <option value="processing">
              Připravuje se
            </option>

            <option value="shipped">
              Odeslané
            </option>

            <option value="completed">
              Dokončené
            </option>

            <option value="cancelled">
              Zrušené
            </option>

          </select>


          <button type="submit">
            Filtrovat
          </button>


          {(q ||
            statusFilter !==
              "all") && (

            <Link
              href="/admin/objednavky"
              className="orderClearFilter"
            >
              Zrušit filtr
            </Link>

          )}

        </form>



        {orders.length ===
        0 ? (

          <div className="orderEmpty">

            <div>
              ▤
            </div>

            <h2>
              Žádné objednávky
            </h2>

            <p>
              Pro tento filtr jsme nic nenašli.
            </p>

          </div>

        ) : (

          <div className="orderTable">


            <div className="orderRow orderTableHead">

              <span>
                Objednávka
              </span>

              <span>
                Zákazník
              </span>

              <span>
                Doprava
              </span>

              <span>
                Platba
              </span>

              <span>
                Cena
              </span>

              <span>
                Stav
              </span>

              <span></span>

            </div>



            {orders.map(
              (order) => (

                <Link
                  href={`/admin/objednavky/${order.id}`}
                  className="orderRow orderTableItem"
                  key={
                    order.id
                  }
                >

                  <div className="orderNumber">

                    <strong>
                      {order.order_number}
                    </strong>

                    <span>
                      {formatDate(
                        order.created_at
                      )}
                    </span>

                  </div>


                  <div className="orderCustomer">

                    <strong>
                      {order.customer_name}
                    </strong>

                    <span>
                      {order.customer_email}
                    </span>

                  </div>


                  <span>
                    {shippingMethodLabel(
                      order.shipping_method
                    )}
                  </span>


                  <span>
                    {paymentMethodLabel(
                      order.payment_method
                    )}
                  </span>


                  <strong className="orderPrice">
                    {formatPrice(
                      Number(
                        order.total_price
                      )
                    )}
                  </strong>


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


                  <span className="orderArrow">
                    →
                  </span>

                </Link>

              )
            )}

          </div>

        )}



        {totalPages > 1 && (

          <div className="orderPagination">

            <div>

              Zobrazeno{" "}

              <strong>
                {from + 1}
              </strong>

              {" – "}

              <strong>
                {Math.min(
                  to + 1,
                  filteredCount
                )}
              </strong>

              {" z "}

              <strong>
                {filteredCount}
              </strong>

            </div>


            <div>

              {currentPage > 1 && (

                <Link
                  href={
                    pageHref(
                      currentPage -
                      1
                    )
                  }
                >
                  ← Předchozí
                </Link>

              )}


              <span>
                {currentPage}
                {" / "}
                {totalPages}
              </span>


              {currentPage <
                totalPages && (

                <Link
                  href={
                    pageHref(
                      currentPage +
                      1
                    )
                  }
                >
                  Další →
                </Link>

              )}

            </div>

          </div>

        )}


      </section>


    </main>
  );
}