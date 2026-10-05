import Link from "next/link";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";

import {
  importCurrentCatalog,
} from "./actions";


export const dynamic =
  "force-dynamic";


type Props = {

  searchParams:
    Promise<{
      q?: string;
      status?: string;
      imported?: string;
      saved?: string;
      error?: string;
    }>;

};


export default async function ProductsPage({
  searchParams,
}: Props) {

  const params =
    await searchParams;


  const q =
    params.q?.trim() ||
    "";


  const status =
    params.status ||
    "all";


  const supabase =
    createAdminClient();


  let query =
    supabase
      .from("products")
      .select("*")
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (q) {

    query =
      query.ilike(
        "name",
        `%${q}%`
      );

  }


  if (
    status ===
    "active"
  ) {

    query =
      query.eq(
        "active",
        true
      );

  }


  if (
    status ===
    "hidden"
  ) {

    query =
      query.eq(
        "active",
        false
      );

  }


  const [
    productsResult,
    inventoryResult,
  ] =
    await Promise.all([

      query,

      supabase
        .from(
          "product_inventory"
        )
        .select(
          "product_slug, stock"
        ),

    ]);


  const inventoryMap =
    new Map(
      (
        inventoryResult.data ||
        []
      ).map(
        (row) => [
          row.product_slug,
          Number(
            row.stock || 0
          ),
        ]
      )
    );


  const products =
    (
      productsResult.data ||
      []
    ).map(
      (product) => ({
        ...product,

        liveStock:
          inventoryMap.get(
            product.slug
          ) ??
          Number(
            product.stock ||
            0
          ),
      })
    );


  const {
    data: allProducts,
  } =
    await supabase
      .from("products")
      .select(
        "id, active, slug"
      );


  const total =
    allProducts?.length ||
    0;


  const active =
    allProducts?.filter(
      (item) =>
        item.active
    ).length ||
    0;


  const totalStock =
    Array.from(
      inventoryMap.values()
    ).reduce(
      (
        sum,
        stock
      ) =>
        sum + stock,
      0
    );


  const lowStock =
    Array.from(
      inventoryMap.values()
    ).filter(
      (stock) =>
        stock <= 2
    ).length;


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


  return (
    <main className="adminMain">


      <div className="adminPageHeader">

        <div>

          <div className="adminEyebrow">
            PRODUKTY
          </div>

          <h1>
            Produktový katalog
          </h1>

          <p>
            Ceny, sklad, názvy, popisy
            a všechny produkty na jednom místě.
          </p>

        </div>


        <Link
          href="/admin/produkty/novy"
          className="adminPrimaryButton"
        >
          + Přidat produkt
        </Link>

      </div>



      {params.imported ===
        "1" && (

        <div className="productSuccess">
          Současný katalog byl úspěšně importován.
        </div>

      )}


      {params.saved && (

        <div className="productSuccess">
          Změna byla uložena.
        </div>

      )}


      {params.error && (

        <div className="productError">
          {params.error}
        </div>

      )}



      <section className="productAdminStats">

        <div>

          <span>
            PRODUKTŮ
          </span>

          <strong>
            {total}
          </strong>

        </div>


        <div>

          <span>
            AKTIVNÍCH
          </span>

          <strong>
            {active}
          </strong>

        </div>


        <div>

          <span>
            KUSŮ SKLADEM
          </span>

          <strong>
            {totalStock}
          </strong>

        </div>


        <div>

          <span>
            LOW STOCK
          </span>

          <strong>
            {lowStock}
          </strong>

        </div>

      </section>



      <section className="productAdminPanel">


        <div className="productToolbar">

          <form
            method="GET"
            className="productSearch"
          >

            <input
              name="q"
              defaultValue={q}
              placeholder="Hledat produkt..."
            />


            <select
              name="status"
              defaultValue={
                status
              }
            >

              <option value="all">
                Všechny
              </option>

              <option value="active">
                Aktivní
              </option>

              <option value="hidden">
                Skryté
              </option>

            </select>


            <button type="submit">
              Hledat
            </button>

          </form>


          {total === 0 && (

            <form
              action={
                importCurrentCatalog
              }
            >

              <button
                type="submit"
                className="productImportButton"
              >
                Importovat současný katalog
              </button>

            </form>

          )}

        </div>



        {products.length ===
        0 ? (

          <div className="productAdminEmpty">

            <div>
              ◇
            </div>

            <h2>
              Žádné produkty
            </h2>

            <p>
              Naimportuj současný katalog
              nebo vytvoř první produkt.
            </p>


            {total === 0 && (

              <form
                action={
                  importCurrentCatalog
                }
              >

                <button
                  type="submit"
                  className="adminPrimaryButton"
                >
                  Importovat 5 současných produktů
                </button>

              </form>

            )}

          </div>

        ) : (

          <div className="productAdminTable">


            <div className="productAdminRow productAdminHead">

              <span>
                Produkt
              </span>

              <span>
                Kategorie
              </span>

              <span>
                Cena
              </span>

              <span>
                Sklad
              </span>

              <span>
                Stav
              </span>

              <span></span>

            </div>



            {products.map(
              (product) => (

                <div
                  className="productAdminRow"
                  key={
                    product.id
                  }
                >

                  <div className="productAdminIdentity">

                    <div className="productAdminImage">

                      {product.image ? (

                        <img
                          src={
                            product.image
                          }
                          alt=""
                        />

                      ) : (

                        <span>
                          {product.emoji}
                        </span>

                      )}

                    </div>


                    <div>

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        /{product.slug}
                      </span>

                    </div>

                  </div>


                  <span>
                    {product.category_name}
                  </span>


                  <div className="productAdminPrice">

                    {product.old_price && (

                      <small>
                        {formatPrice(
                          product.old_price
                        )}
                      </small>

                    )}

                    <strong>
                      {formatPrice(
                        product.price
                      )}
                    </strong>

                  </div>


                  <strong
                    className={
                      product.liveStock <=
                      2
                        ? "productLowStock"
                        : ""
                    }
                  >
                    {product.liveStock} ks
                  </strong>


                  <span
                    className={
                      product.active
                        ? "productStatus active"
                        : "productStatus hidden"
                    }
                  >
                    {product.active
                      ? "Aktivní"
                      : "Skrytý"}
                  </span>


                  <Link
                    href={`/admin/produkty/${product.id}`}
                    className="productEditButton"
                  >
                    Upravit →
                  </Link>

                </div>

              )
            )}

          </div>

        )}

      </section>


    </main>
  );
}