"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FormEvent,
  useState,
} from "react";

import {
  useCart,
} from "../components/CartProvider";


export default function CheckoutPage() {

  const router =
    useRouter();


  const {
    items,
    totalPrice,
    clearCart,
    cartLoaded,
  } =
    useCart();



  const [
    shipping,
    setShipping,
  ] =
    useState(
      "pickup"
    );


  const [
    payment,
    setPayment,
  ] =
    useState(
      "cod"
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false
    );


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      ""
    );



  /*
    ==========================
    DOPRAVA
    ==========================
  */

  const shippingPrice =
    shipping ===
    "pickup"
      ? 79
      : shipping ===
        "address"
      ? 109
      : 0;



  /*
    ==========================
    CELKEM
    ==========================
  */

  const finalPrice =
    totalPrice +
    shippingPrice;



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
    ==========================
    ODESLÁNÍ OBJEDNÁVKY
    ==========================
  */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (
      items.length === 0 ||
      submitting
    ) {

      return;

    }


    setSubmitting(
      true
    );


    setErrorMessage(
      ""
    );


    const form =
      new FormData(
        event.currentTarget
      );



    /*
      ==========================
      ZÁKAZNÍK
      ==========================
    */

    const customer = {

      name:
        String(
          form.get(
            "name"
          ) || ""
        ),

      email:
        String(
          form.get(
            "email"
          ) || ""
        ),

      phone:
        String(
          form.get(
            "phone"
          ) || ""
        ),

      street:
        shipping ===
        "address"
          ? String(
              form.get(
                "street"
              ) || ""
            )
          : "",

      city:
        shipping ===
        "address"
          ? String(
              form.get(
                "city"
              ) || ""
            )
          : "",

      zip:
        shipping ===
        "address"
          ? String(
              form.get(
                "zip"
              ) || ""
            )
          : "",

    };



    /*
      ==========================
      PACKETA
      ==========================
    */

    const shippingPoint = {

      id: "",

      name: "",

    };



    /*
      ==========================
      PAYLOAD
      ==========================
    */

    const payload = {

      customer,

      shipping,

      shippingPoint,

      payment,

      items,

      productsPrice:
        totalPrice,

      shippingPrice,

      finalPrice,

    };



    try {

      const response =
        await fetch(
          "/api/orders",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify(
                payload
              ),

          }
        );



      const result =
        await response
          .json();



      if (
        !response.ok
      ) {

        setErrorMessage(
          result.error ||
          "Objednávku se nepodařilo odeslat."
        );


        setSubmitting(
          false
        );


        return;

      }



      /*
        ==========================
        POSLEDNÍ OBJEDNÁVKA
        ==========================
      */

      localStorage.setItem(
        "last-order",

        JSON.stringify({

          ...payload,

          orderNumber:
            result.orderNumber,

          orderToken:
            result.orderToken ||
            null,

          paymentMethod:
            result.paymentMethod ||
            payment,

          paymentStatus:
            result.paymentStatus ||
            "pending",

          createdAt:
            new Date()
              .toISOString(),

        })
      );



      /*
        ==========================
        VYČISTÍME KOŠÍK
        ==========================
      */

      clearCart();



      /*
        ==========================
        PŘESMĚROVÁNÍ
        ==========================

        Pokud server vrátil
        customer token, zákazník
        rovnou přejde na svoji
        bezpečnou stránku objednávky.
      */

      if (
        result.orderToken
      ) {

        router.push(
          `/objednavka/moje/${encodeURIComponent(
            result.orderToken
          )}?created=1`
        );

      } else {

        /*
          Fallback kdyby token
          z nějakého důvodu nebyl.
        */

        router.push(
          `/objednavka/hotovo?order=${encodeURIComponent(
            result.orderNumber
          )}`
        );

      }


    } catch (
      error
    ) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );


      setErrorMessage(
        "Nepodařilo se spojit se serverem."
      );


      setSubmitting(
        false
      );

    }

  }



  /*
    ==========================
    NAČÍTÁNÍ KOŠÍKU
    ==========================
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


        <section className="checkoutEmpty">

          <div className="eyebrow">
            CHECKOUT
          </div>

          <h1>
            Načítám objednávku...
          </h1>

        </section>

      </main>
    );

  }



  /*
    ==========================
    PRÁZDNÝ KOŠÍK
    ==========================
  */

  if (
    items.length === 0
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


          <div className="navLinks">

            <Link href="/">
              Domů
            </Link>

            <Link href="/pokemon">
              Pokémon
            </Link>

          </div>

        </nav>


        <section className="checkoutEmpty">

          <div className="eyebrow">
            OBJEDNÁVKA
          </div>

          <h1>
            Košík je prázdný.
          </h1>

          <p>
            Nejdřív si vyber produkt,
            který chceš objednat.
          </p>

          <Link
            href="/pokemon"
            className="button primary"
          >
            Prohlédnout produkty
          </Link>

        </section>

      </main>
    );

  }



  return (
    <main>


      {/* =========================
          NAVIGACE
      ========================== */}

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

          <Link href="/kosik">
            ← Zpět do košíku
          </Link>

        </div>

      </nav>



      {/* =========================
          CHECKOUT
      ========================== */}

      <section className="checkoutPage">


        <div className="checkoutHeader">

          <div className="eyebrow">
            CHECKOUT
          </div>

          <h1>
            Dokončení objednávky
          </h1>

          <p>
            Už jen pár údajů
            a objednávka je připravená.
          </p>

        </div>



        <form
          className="checkoutLayout"
          onSubmit={
            handleSubmit
          }
        >


          <div className="checkoutForms">



            {/* =====================
                01 KONTAKT
            ===================== */}

            <section className="checkoutBox">

              <div className="checkoutBoxNumber">
                01
              </div>

              <h2>
                Kontaktní údaje
              </h2>


              <div className="formGrid">


                <div className="formField formFull">

                  <label htmlFor="name">
                    Jméno a příjmení
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jan Novák"
                    required
                  />

                </div>



                <div className="formField">

                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jan@email.cz"
                    required
                  />

                </div>



                <div className="formField">

                  <label htmlFor="phone">
                    Telefon
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+420 123 456 789"
                    required
                  />

                </div>


              </div>

            </section>



            {/* =====================
                02 DOPRAVA
            ===================== */}

            <section className="checkoutBox">

              <div className="checkoutBoxNumber">
                02
              </div>

              <h2>
                Doprava
              </h2>


              <div className="shippingOptions">



                <label
                  className={
                    shipping ===
                    "pickup"
                      ? "shippingOption selected"
                      : "shippingOption"
                  }
                >

                  <input
                    type="radio"
                    name="shipping"
                    value="pickup"
                    checked={
                      shipping ===
                      "pickup"
                    }
                    onChange={() =>
                      setShipping(
                        "pickup"
                      )
                    }
                  />

                  <div>

                    <strong>
                      Výdejní místo
                    </strong>

                    <span>
                      Zásilkovna / Packeta
                    </span>

                  </div>

                  <b>
                    79 Kč
                  </b>

                </label>



                <label
                  className={
                    shipping ===
                    "address"
                      ? "shippingOption selected"
                      : "shippingOption"
                  }
                >

                  <input
                    type="radio"
                    name="shipping"
                    value="address"
                    checked={
                      shipping ===
                      "address"
                    }
                    onChange={() =>
                      setShipping(
                        "address"
                      )
                    }
                  />

                  <div>

                    <strong>
                      Doručení na adresu
                    </strong>

                    <span>
                      Kurýr na tvoji adresu
                    </span>

                  </div>

                  <b>
                    109 Kč
                  </b>

                </label>



                <label
                  className={
                    shipping ===
                    "personal"
                      ? "shippingOption selected"
                      : "shippingOption"
                  }
                >

                  <input
                    type="radio"
                    name="shipping"
                    value="personal"
                    checked={
                      shipping ===
                      "personal"
                    }
                    onChange={() =>
                      setShipping(
                        "personal"
                      )
                    }
                  />

                  <div>

                    <strong>
                      Osobní předání
                    </strong>

                    <span>
                      Po předchozí domluvě
                    </span>

                  </div>

                  <b>
                    Zdarma
                  </b>

                </label>


              </div>

            </section>



            {/* =====================
                03 PACKETA
            ===================== */}

            {shipping ===
              "pickup" && (

              <section className="checkoutBox">

                <div className="checkoutBoxNumber">
                  03
                </div>

                <h2>
                  Výdejní místo
                </h2>


                <div
                  className="shippingOption selected"
                  style={{
                    cursor:
                      "default",
                  }}
                >

                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >

                    <strong>
                      📦 Zásilkovna / Packeta
                    </strong>

                    <span>
                      Výběr konkrétního výdejního
                      místa napojíme později.
                    </span>

                  </div>

                </div>

              </section>

            )}



            {/* =====================
                03 ADRESA
            ===================== */}

            {shipping ===
              "address" && (

              <section className="checkoutBox">

                <div className="checkoutBoxNumber">
                  03
                </div>

                <h2>
                  Doručovací adresa
                </h2>


                <div className="formGrid">


                  <div className="formField formFull">

                    <label htmlFor="street">
                      Ulice a číslo
                    </label>

                    <input
                      id="street"
                      name="street"
                      type="text"
                      placeholder="Karetní 123"
                      required
                    />

                  </div>



                  <div className="formField">

                    <label htmlFor="city">
                      Město
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Plzeň"
                      required
                    />

                  </div>



                  <div className="formField">

                    <label htmlFor="zip">
                      PSČ
                    </label>

                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      placeholder="301 00"
                      required
                    />

                  </div>


                </div>

              </section>

            )}



            {/* =====================
                PLATBA
            ===================== */}

            <section className="checkoutBox">

              <div className="checkoutBoxNumber">

                {shipping ===
                "personal"
                  ? "03"
                  : "04"}

              </div>


              <h2>
                Platba
              </h2>


              <div className="shippingOptions">



                {/* KARTA */}

                <div className="shippingOption disabledOption">

                  <input
                    type="radio"
                    disabled
                  />

                  <div>

                    <strong>
                      Platba kartou online
                    </strong>

                    <span>
                      Visa • Mastercard • Apple Pay • Google Pay
                    </span>

                  </div>

                  <b>
                    Připravujeme
                  </b>

                </div>



                {/* DOBÍRKA */}

                <label
                  className={
                    payment ===
                    "cod"
                      ? "shippingOption selected"
                      : "shippingOption"
                  }
                >

                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={
                      payment ===
                      "cod"
                    }
                    onChange={() =>
                      setPayment(
                        "cod"
                      )
                    }
                  />

                  <div>

                    <strong>
                      Dobírka
                    </strong>

                    <span>
                      Zaplatíš při převzetí zásilky
                    </span>

                  </div>

                  <b>
                    Zdarma
                  </b>

                </label>


              </div>


              <p
                style={{
                  margin:
                    "14px 0 0",

                  color:
                    "#666",

                  fontSize:
                    "11px",

                  lineHeight:
                    "1.6",
                }}
              >
                Online platby kartou budou dostupné
                po spuštění platební brány Comgate.
              </p>

            </section>


          </div>



          {/* =========================
              SOUHRN
          ========================== */}

          <aside className="checkoutSummary">

            <div className="eyebrow">
              TVOJE OBJEDNÁVKA
            </div>

            <h2>
              Souhrn
            </h2>



            <div className="checkoutProducts">

              {items.map(
                (item) => (

                  <div
                    className="checkoutProduct"
                    key={
                      item.slug
                    }
                  >

                    <div className="checkoutProductImage">

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
                          {item.emoji}
                        </span>

                      )}

                    </div>


                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.quantity}×{" "}
                        {formatPrice(
                          item.price
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>



            <div className="checkoutTotals">


              <div>

                <span>
                  Produkty
                </span>

                <strong>
                  {formatPrice(
                    totalPrice
                  )}
                </strong>

              </div>



              <div>

                <span>
                  Doprava
                </span>

                <strong>

                  {shippingPrice ===
                  0
                    ? "Zdarma"
                    : formatPrice(
                        shippingPrice
                      )}

                </strong>

              </div>



              <div>

                <span>
                  Platba
                </span>

                <strong>
                  Dobírka
                </strong>

              </div>


            </div>



            <div className="checkoutFinal">

              <span>
                Celkem
              </span>

              <strong>
                {formatPrice(
                  finalPrice
                )}
              </strong>

            </div>



            <label className="termsCheck">

              <input
                type="checkbox"
                required
              />

              <span>
                Souhlasím s obchodními
                podmínkami.
              </span>

            </label>



            {errorMessage && (

              <div
                style={{
                  marginBottom:
                    "14px",

                  padding:
                    "12px",

                  borderRadius:
                    "8px",

                  background:
                    "#2a1212",

                  color:
                    "#ff8585",

                  fontSize:
                    "12px",
                }}
              >

                {errorMessage}

              </div>

            )}



            <button
              type="submit"
              className="placeOrderButton"
              disabled={
                submitting
              }
            >

              {submitting
                ? "Odesílám..."
                : "Objednat na dobírku →"}

            </button>



            <p className="testCheckoutNote">

              Objednávka se po odeslání
              uloží do systému.

            </p>


          </aside>


        </form>


      </section>


    </main>
  );
}