import Link from "next/link";

import {
  categories,
  formatPrice,
} from "../data/products";

import {
  getProductsWithLiveStock,
} from "../lib/productInventory";


export const dynamic =
  "force-dynamic";


export default async function PokemonPage() {

  const products =
    await getProductsWithLiveStock();


  return (
    <main>


      {/* =========================
          NAVIGACE
      ========================= */}

      <nav className="nav">

        <div className="navLeft">

          <div className="menuWrap">

            <input
              id="menu-toggle"
              type="checkbox"
              className="menuToggle"
            />


            <label
              htmlFor="menu-toggle"
              className="menuButton"
            >
              <span></span>
              <span></span>
              <span></span>
            </label>


            <div className="menuPanel">

              <div className="menuTitle">
                MENU
              </div>


              <Link
                href="/pokemon"
                className="menuItem active"
              >
                Pokémon
                <span>→</span>
              </Link>


              <Link
                href="/darkove-poukazy"
                className="menuItem"
              >
                Dárkové poukazy
                <span>→</span>
              </Link>

            </div>

          </div>


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


          <a
            href="https://discord.gg/RsU4HQRFJ"
            target="_blank"
            rel="noreferrer"
            className="discord"
          >
            Discord
          </a>

        </div>

      </nav>



      {/* =========================
          KATALOG
      ========================= */}

      <section className="catalog">


        {/* HEADER */}

        <div className="catalogHead">

          <div className="eyebrow">
            POKÉMON TCG
          </div>


          <h1>
            Pokémon produkty
          </h1>


          <p>
            Booster boxy, ETB,
            boostery, kolekce a další
            sealed Pokémon TCG produkty.
          </p>

        </div>



        {/* =========================
            KATEGORIE
        ========================= */}

        <div className="categoryBar">

          <Link
            href="/pokemon"
            className="categoryActive"
          >
            Vše
          </Link>


          {categories.map(
            (category) => (

              <Link
                key={category.slug}
                href={`/pokemon/${category.slug}`}
              >
                {category.name}
              </Link>

            )
          )}

        </div>



        {/* =========================
            PRODUKTY
        ========================= */}

        <div className="catalogGrid">


          {products.map(
            (product) => (

              <Link

                href={`/produkt/${product.slug}?from=${encodeURIComponent(
                  "/pokemon"
                )}`}

                className="product productLink"

                key={product.slug}
              >


                {/* OBRÁZEK */}

                <div className="productImage">


                  {product.badge && (

                    <div className="badge">
                      {product.badge}
                    </div>

                  )}


                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.name}
                      className="productPhoto"
                    />

                  ) : (

                    <span className="productIcon">
                      {product.emoji}
                    </span>

                  )}


                </div>



                {/* INFORMACE */}

                <div className="productInfo">


                  <div>

                    <p>
                      {product.categoryName}
                    </p>


                    <h3>
                      {product.name}
                    </h3>

                  </div>



                  <div className="priceStack">


                    {product.oldPrice && (

                      <span className="oldPrice">

                        {formatPrice(
                          product.oldPrice
                        )}

                      </span>

                    )}


                    <strong>

                      {formatPrice(
                        product.price
                      )}

                    </strong>

                  </div>


                </div>



                {/* SKLAD + ŠIPKA */}

                <div className="productBottom">


                  {product.stock > 0 ? (

                    <span className="inStock">
                      SKLADEM {product.stock} ks
                    </span>

                  ) : (

                    <span>
                      VYPRODÁNO
                    </span>

                  )}


                  <span className="detailArrow">
                    →
                  </span>


                </div>


              </Link>

            )
          )}


        </div>


      </section>



      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <div className="footerInner">


          <div>

            <div className="footerLogo">
              TCGVAULT
            </div>

            <p>
              TCG shop pro sběratele
              a hráče.
            </p>

          </div>



          <div className="footerColumn">

            <strong>
              Kontakt
            </strong>

            <span>
              info@example.cz
            </span>

            <a
              href="https://discord.gg/RsU4HQRFJ"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>

          </div>



          <div className="footerColumn">

            <strong>
              Informace
            </strong>

            <span>
              Obchodní podmínky
            </span>

            <span>
              Doprava a platba
            </span>

            <span>
              Reklamace
            </span>

          </div>


        </div>


        <div className="copyright">

          © 2026 TCG Vault

        </div>

      </footer>


    </main>
  );
}