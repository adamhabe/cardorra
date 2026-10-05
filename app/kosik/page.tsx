"use client";

import Link from "next/link";

import {
  useCart,
} from "../components/CartProvider";


export default function CartPage() {

  const {
    items,

    removeFromCart,

    updateQuantity,

    clearCart,

    totalPrice,

    cartLoaded,
  } = useCart();


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


  /*
    DOKUD SE KOŠÍK
    NENAČTE, NIC
    NEVYHODNOCUJEME.
  */

  if (
    !cartLoaded
  ) {

    return (

      <main>

        <nav className="nav">

          <div className="navLeft">

            <Link
              href="/"
              className="logo"
            >
              TCG<span>VAULT</span>
            </Link>

          </div>

        </nav>


        <section className="cartPage">

          <div className="eyebrow">
            OBJEDNÁVKA
          </div>

          <h1>
            Načítám košík...
          </h1>

        </section>

      </main>

    );

  }


  return (

    <main>


      {/* NAVIGACE */}

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
                className="menuItem"
              >
                Pokémon

                <span>
                  →
                </span>
              </Link>


              <Link
                href="/darkove-poukazy"
                className="menuItem"
              >
                Dárkové poukazy

                <span>
                  →
                </span>
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


          <Link href="/pokemon">
            Pokémon
          </Link>


          <a
            className="discord"
            href="https://discord.gg/RsU4HQRFJ"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>

        </div>

      </nav>



      {/* KOŠÍK */}

      <section className="cartPage">

        <div className="eyebrow">
          OBJEDNÁVKA
        </div>


        <h1>
          Tvůj košík
        </h1>



        {items.length === 0 ? (


          /*
            PRÁZDNÝ KOŠÍK
          */

          <div className="emptyCart">


            <div className="emptyCartIcon">
              🛒
            </div>


            <h2>
              Košík je zatím prázdný
            </h2>


            <p>
              Vyber si něco z nabídky
              Pokémon produktů.
            </p>


            <Link
              href="/pokemon"
              className="button primary"
            >
              Prohlédnout produkty
            </Link>

          </div>


        ) : (


          <div className="cartLayout">


            {/* LEVÁ ČÁST */}

            <div className="cartItems">


              {items.map(
                (
                  item
                ) => (

                  <article
                    className="cartItem"
                    key={
                      item.slug
                    }
                  >


                    {/* PRODUKT */}

                    <Link
                      href={
                        `/produkt/${item.slug}?from=${encodeURIComponent(
                          "/kosik"
                        )}`
                      }
                      className="cartProductImage"
                    >

                      {item.image ? (

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />

                      ) : (

                        <span>
                          {
                            item.emoji
                          }
                        </span>

                      )}

                    </Link>



                    {/* NÁZEV */}

                    <div className="cartProductInfo">

                      <Link
                        href={
                          `/produkt/${item.slug}?from=${encodeURIComponent(
                            "/kosik"
                          )}`
                        }
                      >

                        <h3>
                          {
                            item.name
                          }
                        </h3>

                      </Link>


                      <strong>
                        {
                          formatPrice(
                            item.price
                          )
                        }
                      </strong>

                    </div>



                    {/* MNOŽSTVÍ */}

                    <div className="cartQuantity">


                      <button
                        type="button"
                        disabled={
                          item.quantity <=
                          1
                        }
                        onClick={() =>
                          updateQuantity(
                            item.slug,

                            item.quantity -
                            1
                          )
                        }
                      >
                        −
                      </button>


                      <span>
                        {
                          item.quantity
                        }
                      </span>


                      <button
                        type="button"
                        disabled={
                          item.quantity >=
                          item.stock
                        }
                        onClick={() =>
                          updateQuantity(
                            item.slug,

                            item.quantity +
                            1
                          )
                        }
                      >
                        +
                      </button>


                    </div>



                    {/* CENA */}

                    <div className="cartItemTotal">


                      <strong>
                        {
                          formatPrice(
                            item.price *
                            item.quantity
                          )
                        }
                      </strong>


                      <button
                        type="button"
                        className="removeItem"
                        onClick={() =>
                          removeFromCart(
                            item.slug
                          )
                        }
                      >
                        Odebrat
                      </button>


                    </div>


                  </article>

                )
              )}



              <button
                type="button"
                className="clearCart"
                onClick={
                  clearCart
                }
              >
                Vyprázdnit košík
              </button>


            </div>



            {/* PRAVÁ ČÁST */}

            <aside className="cartSummary">


              <div className="eyebrow">
                SOUHRN
              </div>


              <h2>
                Objednávka
              </h2>



              <div className="summaryRow">

                <span>
                  Produkty
                </span>

                <strong>
                  {
                    formatPrice(
                      totalPrice
                    )
                  }
                </strong>

              </div>



              <div className="summaryRow">

                <span>
                  Doprava
                </span>

                <strong>
                  Vybereš dále
                </strong>

              </div>



              <div className="summaryTotal">

                <span>
                  Celkem
                </span>

                <strong>
                  {
                    formatPrice(
                      totalPrice
                    )
                  }
                </strong>

              </div>



              {/* TOHLE JE TEĎ NORMÁLNÍ NEXT LINK */}

              <Link
                href="/objednavka"
                className="checkoutButton checkoutLink"
              >
                Pokračovat k objednávce →
              </Link>


              <p className="checkoutNote">
                Dopravu a platbu vybereš
                v dalším kroku.
              </p>


            </aside>


          </div>


        )}


      </section>


    </main>

  );

}