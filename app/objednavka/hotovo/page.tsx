import Link from "next/link";


export default async function OrderComplete({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
  }>;
}) {

  const {
    order,
  } = await searchParams;


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


      <section className="orderComplete">

        <div className="successIcon">
          ✓
        </div>


        <div className="eyebrow">
          OBJEDNÁVKA PŘIJATA
        </div>


        <h1>
          Díky za objednávku.
        </h1>


        <p>
          Testovací objednávka
          byla úspěšně vytvořena.
        </p>


        {order && (

          <div className="orderNumber">

            <span>
              Číslo objednávky
            </span>

            <strong>
              {order}
            </strong>

          </div>

        )}


        <div className="orderCompleteActions">

          <Link
            href="/"
            className="button primary"
          >
            Zpět na hlavní stránku
          </Link>

          <Link
            href="/pokemon"
            className="button secondary"
          >
            Další produkty
          </Link>

        </div>


        <p className="demoWarning">
          Toto je zatím pouze demo.
          Žádná skutečná objednávka
          nebyla odeslána.
        </p>

      </section>

    </main>
  );
}