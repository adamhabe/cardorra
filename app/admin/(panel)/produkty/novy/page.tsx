import Link from "next/link";

import ProductForm from "../ProductForm";

import {
  createProduct,
} from "../actions";


type Props = {

  searchParams:
    Promise<{
      error?: string;
    }>;

};


export default async function NewProductPage({
  searchParams,
}: Props) {

  const params =
    await searchParams;


  return (
    <main className="adminMain">

      <div className="productEditorTop">

        <Link
          href="/admin/produkty"
        >
          ← Produkty
        </Link>

      </div>


      <div className="adminPageHeader">

        <div>

          <div className="adminEyebrow">
            NOVÝ PRODUKT
          </div>

          <h1>
            Přidat produkt
          </h1>

          <p>
            Vyplň produkt a ulož ho do katalogu.
          </p>

        </div>

      </div>


      {params.error && (

        <div className="productError">
          {params.error ===
          "invalid"
            ? "Zkontroluj povinné údaje."
            : params.error}
        </div>

      )}


      <ProductForm
        action={createProduct}
        submitLabel="Vytvořit produkt →"
      />

    </main>
  );
}