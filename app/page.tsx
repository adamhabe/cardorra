import Link from "next/link";

import {
  getProductsWithLiveStock,
} from "./lib/productInventory";


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


export default async function Home() {

  const products =
    await getProductsWithLiveStock();


  const featuredProducts =
    products
      .filter(
        (product) =>
          product.featured
      )
      .slice(0, 3);


  return (
    <>


      {/* =========================
          NAVBAR
      ========================== */}

      <nav className="nav">

        <div className="navLeft">


          {/* MENU */}

          <div className="menuWrap">

            <input
              id="menu-toggle"
              type="checkbox"
              className="menuToggle"
            />


            <label
              htmlFor="menu-toggle"
              className="menuButton"
              aria-label="Otevřít menu"
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
                className="menuItem"
              >
                Pokémon
              </Link>


              <Link
                href="/darkove-poukazy"
                className="menuItem"
              >
                Dárkové poukazy
              </Link>


              <Link
                href="/kosik"
                className="menuItem"
              >
                Košík
              </Link>


              <a
                href="https://discord.gg/RsU4HQRFJ"
                target="_blank"
                rel="noreferrer"
                className="menuItem"
              >
                Discord
              </a>

            </div>

          </div>



          {/* LOGO */}

          <Link
            href="/"
            className="logo"
          >
            TCGVAULT
          </Link>

        </div>



        {/* DESKTOP NAV */}

        <div className="navLinks">

          <Link href="/pokemon">
            Produkty
          </Link>


          <a href="#jak-to-funguje">
            Jak to funguje
          </a>


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
          HERO
      ========================== */}

      <section className="hero">

        <div className="heroCopy">

          <div className="eyebrow">
            POKÉMON TCG
          </div>


          <h1>
            Tvoje další
            <br />
            karta začíná
            <br />
            tady.
          </h1>


          <p>
            Pokémon TCG produkty,
            sealed produkty a další
            kousky pro hráče i sběratele.
          </p>


          <div className="actions">

            <Link
              href="/pokemon"
              className="button primary"
            >
              Prohlédnout Pokémon →
            </Link>


            <a
              href="https://discord.gg/RsU4HQRFJ"
              target="_blank"
              rel="noreferrer"
              className="button secondary"
            >
              Discord
            </a>

          </div>

        </div>



        <div className="heroCard">

          <div className="glow" />


          <div className="floatingCard">

            <div className="cardTop">
              TCGVAULT
            </div>


            <div className="cardArt">
              🎴
            </div>


            <div className="cardBottom">

              <strong>
                Pokémon
                <br />
                TCG
              </strong>


              <span>
                Sealed
                <br />
                products
              </span>

            </div>

          </div>

        </div>

      </section>



      {/* =========================
          DOPORUČENÉ PRODUKTY
      ========================== */}

      <section className="products">

        <div className="sectionHead">

          <div>

            <div className="eyebrow">
              VYBRANÉ PRODUKTY
            </div>

            <h2>
              Doporučujeme
            </h2>

          </div>


          <Link href="/pokemon">
            Zobrazit vše →
          </Link>

        </div>



        {featuredProducts.length > 0 ? (

          <div className="grid">

            {featuredProducts.map(
              (product) => (

                <Link
                  href={`/produkt/${product.slug}`}
                  className="product productLink"
                  key={product.id}
                >

                  <div className="productImage">

                    {product.badge && (

                      <span className="badge">
                        {product.badge}
                      </span>

                    )}


                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                        className="productPhoto"
                      />

                    ) : (

                      <div className="productIcon">
                        {product.emoji}
                      </div>

                    )}

                  </div>



                  <div className="productInfo">

                    <div>

                      <p>
                        {product.set}
                      </p>


                      <h3>
                        {product.name}
                      </h3>


                      {product.shortDescription && (

                        <p>
                          {product.shortDescription}
                        </p>

                      )}

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



                  <div className="productBottom">

                    {product.stock > 0 ? (

                      <span className="stock">
                        Skladem {product.stock} ks
                      </span>

                    ) : (

                      <span>
                        Vyprodáno
                      </span>

                    )}


                    <span className="detailArrow">
                      Detail →
                    </span>

                  </div>

                </Link>

              )
            )}

          </div>

        ) : (

          <div className="emptyCategory">

            <h2>
              Žádné doporučené produkty
            </h2>

            <p>
              V administraci označ produkty
              jako „Doporučený“.
            </p>

          </div>

        )}

      </section>



      {/* =========================
          JAK TO FUNGUJE
      ========================== */}

      <section
        className="how"
        id="jak-to-funguje"
      >

        <div className="sectionHead">

          <div>

            <div className="eyebrow">
              TCGVAULT
            </div>

            <h2>
              Jednoduše a rychle
            </h2>

          </div>

        </div>


        <div className="steps">

          <div>

            <span>
              01
            </span>

            <h3>
              Vyber produkt
            </h3>

            <p>
              Prohlédni si nabídku
              Pokémon TCG produktů
              a vyber si, co chceš.
            </p>

          </div>


          <div>

            <span>
              02
            </span>

            <h3>
              Vlož do košíku
            </h3>

            <p>
              Zvol množství a přidej
              produkt do svého košíku.
            </p>

          </div>


          <div>

            <span>
              03
            </span>

            <h3>
              Dokonči objednávku
            </h3>

            <p>
              Vyplň údaje, vyber dopravu
              a objednávku odešli.
            </p>

          </div>

        </div>

      </section>



      {/* =========================
          DISCORD
      ========================== */}

      <section className="discordCta">

        <div>

          <div className="eyebrow">
            KOMUNITA
          </div>


          <h2>
            Přidej se na Discord
          </h2>


          <p>
            Novinky, produkty,
            Pokémon TCG a naše komunita
            na jednom místě.
          </p>

        </div>


        <a
          href="https://discord.gg/RsU4HQRFJ"
          target="_blank"
          rel="noreferrer"
          className="button secondary"
        >
          Připojit se →
        </a>

      </section>



      {/* =========================
          FOOTER
      ========================== */}

      <footer>

        <div className="footerInner">

          <div>

            <div className="footerLogo">
              TCGVAULT
            </div>

            <p>
              Pokémon TCG shop
              pro sběratele i hráče.
            </p>

          </div>


          <div className="footerColumn">

            <strong>
              SHOP
            </strong>

            <Link href="/pokemon">
              Pokémon
            </Link>

            <Link href="/darkove-poukazy">
              Dárkové poukazy
            </Link>

          </div>


          <div className="footerColumn">

            <strong>
              KOMUNITA
            </strong>

            <a
              href="https://discord.gg/RsU4HQRFJ"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>

          </div>

        </div>


        <div className="copyright">
          © 2026 TCGVAULT
        </div>

      </footer>


    </>
  );
}