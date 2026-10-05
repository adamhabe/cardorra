import Link from "next/link";
import { notFound } from "next/navigation";

import {
  categories,
  formatPrice,
} from "../../data/products";

import {
  getProductsWithLiveStock,
} from "../../lib/productInventory";


export const dynamic =
  "force-dynamic";


type CategoryPageProps = {

  params: Promise<{
    category: string;
  }>;

};


export default async function CategoryPage({
  params,
}: CategoryPageProps) {

  const {
    category,
  } =
    await params;


  const selectedCategory =
    categories.find(
      (item) =>
        item.slug === category
    );


  if (!selectedCategory) {
    notFound();
  }


  const products =
    await getProductsWithLiveStock();


  const filteredProducts =
    products.filter(
      (product) =>
        product.category ===
        category
    );


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

          <Link href="/pokemon">
            Pokémon
          </Link>

        </div>

      </nav>



      {/* KATALOG */}

      <section className="catalog">

        <div className="catalogHead">

          <div className="eyebrow">
            POKÉMON TCG
          </div>


          <h1>
            {selectedCategory.name}
          </h1>


          <p>
            Pokémon TCG produkty
            v kategorii {selectedCategory.name}.
          </p>

        </div>



        {/* KATEGORIE */}

        <div className="categoryBar">

          <Link href="/pokemon">
            Vše
          </Link>


          {categories.map(
            (item) => (

              <Link
                key={item.slug}
                href={`/pokemon/${item.slug}`}
                className={
                  item.slug === category
                    ? "categoryActive"
                    : ""
                }
              >
                {item.name}
              </Link>

            )
          )}

        </div>



        {/* PRODUKTY */}

        {filteredProducts.length > 0 ? (

          <div className="catalogGrid">

            {filteredProducts.map(
              (product) => (

                <Link
                  key={product.slug}
                  href={`/produkt/${product.slug}?from=${encodeURIComponent(
                    `/pokemon/${category}`
                  )}`}
                  className="product productLink"
                >

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

        ) : (

          <div className="emptyCategory">

            <h2>
              Zatím tu nic není.
            </h2>

            <p>
              V této kategorii momentálně
              nemáme žádné produkty.
            </p>

          </div>

        )}

      </section>



      <footer>

        <div className="footerInner">

          <div>

            <div className="footerLogo">
              TCGVAULT
            </div>

            <p>
              TCG shop pro sběratele.
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