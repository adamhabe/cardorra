import Link from "next/link";

const vouchers = [
  {
    price: "500 Kč",
    icon: "🎁",
    text: "Dárkový poukaz v hodnotě 500 Kč",
  },
  {
    price: "1 000 Kč",
    icon: "🎟️",
    text: "Dárkový poukaz v hodnotě 1 000 Kč",
  },
  {
    price: "2 000 Kč",
    icon: "💳",
    text: "Dárkový poukaz v hodnotě 2 000 Kč",
  },
];

export default function GiftVouchers() {
  return (
    <main>
      <nav className="nav">
        <div className="navLeft">

          <div className="menuWrap">
            <input
              id="menu-toggle"
              type="checkbox"
              className="menuToggle"
            />

            <label htmlFor="menu-toggle" className="menuButton">
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
                className="menuItem active"
              >
                Dárkové poukazy
                <span>→</span>
              </Link>
            </div>
          </div>

          <Link href="/" className="logo">
            TCG<span>VAULT</span>
          </Link>

        </div>

        <div className="navLinks">
          <Link href="/">
            Domů
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

      <section className="catalog">

        <div className="catalogHead">
          <div className="eyebrow">
            DÁRKOVÉ POUKAZY
          </div>

          <h1>
            Daruj TCG radost.
          </h1>

          <p>
            Vyber hodnotu poukazu, která ti vyhovuje.
          </p>
        </div>

        <div className="voucherGrid">

          {vouchers.map((voucher) => (
            <article
              className="voucher"
              key={voucher.price}
            >

              <div className="voucherIcon">
                {voucher.icon}
              </div>

              <div>
                <p>DÁRKOVÝ POUKAZ</p>

                <h2>
                  {voucher.price}
                </h2>

                <span>
                  {voucher.text}
                </span>
              </div>

              <button className="buy">
                Vybrat poukaz →
              </button>

            </article>
          ))}

        </div>

      </section>

      <footer>
        <div className="footerInner">

          <div>
            <div className="footerLogo">
              TCG<span>VAULT</span>
            </div>

            <p>
              Moderní TCG shop pro sběratele.
            </p>
          </div>

          <div className="footerColumn">
            <strong>Kontakt</strong>

            <a href="mailto:info@example.cz">
              info@example.cz
            </a>

            <a
              href="https://discord.gg/RsU4HQRFJ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          </div>

          <div className="footerColumn">
            <strong>Informace</strong>

            <a href="#">
              Obchodní podmínky
            </a>

            <a href="#">
              Doprava a platba
            </a>

            <a href="#">
              Reklamace
            </a>
          </div>

        </div>

        <div className="copyright">
          © 2026 TCG Vault • Demo verze
        </div>
      </footer>
    </main>
  );
}