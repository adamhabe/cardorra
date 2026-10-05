import Link from "next/link";

import {
  createAdminClient,
} from "../../../lib/supabase/admin";


export const dynamic =
  "force-dynamic";


export default async function AdminDashboardPage() {

  const supabase =
    createAdminClient();



  /*
    ==========================
    STATISTIKY
    ==========================
  */

  const [
    ordersResult,
    newOrdersResult,
    inventoryResult,
    recentOrdersResult,
  ] =
    await Promise.all([

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
        .from("product_inventory")
        .select(
          "product_slug, stock"
        ),


      supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            customer_name,
            customer_email,
            total_price,
            status,
            created_at
          `
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(5),

    ]);



  const inventory =
    inventoryResult.data ??
    [];


  const stockUnits =
    inventory.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.stock ||
          0
        ),
      0
    );


  const lowStock =
    inventory.filter(
      (item) =>
        Number(item.stock) <=
        2
    ).length;


  const recentOrders =
    recentOrdersResult.data ??
    [];



  function formatPrice(
    price: number
  ) {

    return (
      new Intl.NumberFormat(
        "cs-CZ"
      ).format(
        price
      ) +
      " Kč"
    );

  }



  function formatDate(
    date: string
  ) {

    return new Intl.DateTimeFormat(
      "cs-CZ",
      {
        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    ).format(
      new Date(date)
    );

  }



  return (
    <main className="adminMain">


      {/* HEADER */}

      <div className="adminPageHeader">

        <div>

          <div className="adminEyebrow">
            DASHBOARD
          </div>


          <h1>
            Přehled shopu
          </h1>


          <p>
            Objednávky, sklad
            a rychlý přehled toho,
            co se v shopu děje.
          </p>

        </div>


        <Link
          href="/admin/produkty/novy"
          className="adminPrimaryButton"
        >
          + Přidat produkt
        </Link>

      </div>



      {/* STATISTIKY */}

      <section className="adminStats">

        <article className="adminStatCard">

          <span>
            OBJEDNÁVKY
          </span>

          <strong>
            {ordersResult.count ?? 0}
          </strong>

          <small>
            celkem
          </small>

        </article>



        <article className="adminStatCard">

          <span>
            NOVÉ
          </span>

          <strong>
            {newOrdersResult.count ?? 0}
          </strong>

          <small>
            čekají na vyřízení
          </small>

        </article>



        <article className="adminStatCard">

          <span>
            SKLADEM
          </span>

          <strong>
            {stockUnits}
          </strong>

          <small>
            kusů celkem
          </small>

        </article>



        <article className="adminStatCard">

          <span>
            LOW STOCK
          </span>

          <strong>
            {lowStock}
          </strong>

          <small>
            produktů ≤ 2 ks
          </small>

        </article>

      </section>



      {/* OBJEDNÁVKY */}

      <section className="adminDashboardPanel">

        <div className="adminPanelHeader">

          <div>

            <span>
              POSLEDNÍ OBJEDNÁVKY
            </span>

            <h2>
              Objednávky
            </h2>

          </div>


          <Link href="/admin/objednavky">
            Zobrazit vše →
          </Link>

        </div>



        {recentOrders.length === 0 ? (

          <div className="adminEmptyState">

            <strong>
              Zatím žádné objednávky
            </strong>

            <span>
              Až nějaká přijde,
              objeví se tady.
            </span>

          </div>

        ) : (

          <div className="adminOrderTable">


            <div className="adminOrderRow adminOrderHead">

              <span>
                Objednávka
              </span>

              <span>
                Zákazník
              </span>

              <span>
                Datum
              </span>

              <span>
                Stav
              </span>

              <span>
                Celkem
              </span>

            </div>



            {recentOrders.map(
              (order) => (

                <div
                  className="adminOrderRow"
                  key={order.id}
                >

                  <strong>
                    {order.order_number}
                  </strong>


                  <div className="adminCustomer">

                    <strong>
                      {order.customer_name}
                    </strong>

                    <span>
                      {order.customer_email}
                    </span>

                  </div>


                  <span>
                    {formatDate(
                      order.created_at
                    )}
                  </span>


                  <span className="adminStatus">
                    {order.status}
                  </span>


                  <strong>
                    {formatPrice(
                      order.total_price
                    )}
                  </strong>

                </div>

              )
            )}


          </div>

        )}

      </section>


    </main>
  );

}