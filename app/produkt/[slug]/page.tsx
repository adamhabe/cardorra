import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatPrice,
} from "../../data/products";

import {
  getProductWithLiveStock,
} from "../../lib/productInventory";

import ProductPurchaseBox from "../../components/ProductPurchaseBox";


export const dynamic =
  "force-dynamic";


type ProductPageProps = {

  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;

};


export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {

  const {
    slug,
  } =
    await params;


  const {
    from,
  } =
    await searchParams;


  const product =
    await getProductWithLiveStock(
      slug
    );


  if (!product) {
    notFound();
  }


  const backUrl =
    from || "/pokemon";


  return (
    <main>


      {/* NAV */}

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

          <Link href="/pokemon">
            Pokémon
          </Link>

        </div>

      </nav>



      {/* DETAIL */}

      <section className="productDetail">


        {/* LEVÁ STRANA */}

        <div>

          <Link
            href={backUrl}
            className="backLink"
          >
            ← Zpět
          </Link>


          <div className="detailImage">

            {product.badge && (

              <div className="badge">
                {product.badge}
              </div>

            )}


            {product.image ? (

              <img
                src={product.image}
                alt={product.name}
                className="detailPhoto"
              />

            ) : (

              <span className="detailEmoji">
                {product.emoji}
              </span>

            )}

          </div>

        </div>



        {/* PRAVÁ STRANA */}

        <div className="detailInfo">

          <div className="eyebrow">
            {product.categoryName}
          </div>


          <h1>
            {product.name}
          </h1>


          <p className="detailDescription">
            {product.set}
          </p>


          <p className="detailDescription">
            {product.shortDescription}
          </p>



          <div className="detailPrice">

            {product.oldPrice && (

              <span>
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



          <div className="stockBox">

            {product.stock > 0 ? (

              <>
                <strong>
                  ✓ Skladem {product.stock} ks
                </strong>

                <span>
                  Připraveno k objednání
                </span>
              </>

            ) : (

              <>
                <strong>
                  Vyprodáno
                </strong>

                <span>
                  Produkt momentálně
                  není skladem
                </span>
              </>

            )}

          </div>



          <ProductPurchaseBox
            product={{
              slug:
                product.slug,

              name:
                product.name,

              price:
                product.price,

              image:
                product.image,

              emoji:
                product.emoji,

              stock:
                product.stock,
            }}
          />



          <div className="detailTrust">

            <span>
              ✓ Originální sealed produkt
            </span>

            <span>
              ✓ Bezpečně zabalené
            </span>

            <span>
              ✓ Sklad kontrolovaný živě
            </span>

          </div>

        </div>

      </section>



      {/* POPIS */}

      <section className="productDescription">

        <div>

          <div className="eyebrow">
            DETAIL PRODUKTU
          </div>


          <h2>
            O produktu
          </h2>


          <p>
            {product.description}
          </p>

        </div>



        <div className="contentsBox">

          <h3>
            Obsah produktu
          </h3>


          <ul>

            {product.contents.map(
              (item) => (

                <li key={item}>
                  {item}
                </li>

              )
            )}

          </ul>

        </div>

      </section>


    </main>
  );
}