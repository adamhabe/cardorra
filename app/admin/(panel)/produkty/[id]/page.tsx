import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createAdminClient,
} from "../../../../../lib/supabase/admin";

import ProductForm from "../ProductForm";

import {
  updateProduct,
  hideProduct,
} from "../actions";


type Props = {

  params:
    Promise<{
      id: string;
    }>;

  searchParams:
    Promise<{
      saved?: string;
      error?: string;
    }>;

};


export default async function EditProductPage({
  params,
  searchParams,
}: Props) {

  const {
    id,
  } =
    await params;


  const query =
    await searchParams;


  const supabase =
    createAdminClient();


  const {
    data: product,
  } =
    await supabase
      .from("products")
      .select("*")
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (!product) {
    notFound();
  }


  const {
    data: inventory,
  } =
    await supabase
      .from(
        "product_inventory"
      )
      .select("stock")
      .eq(
        "product_slug",
        product.slug
      )
      .maybeSingle();


  const productWithLiveStock = {
    ...product,

    stock:
      inventory?.stock ??
      product.stock ??
      0,
  };


  return (
    <main className="adminMain">


      <div className="productEditorTop">

        <Link
          href="/admin/produkty"
        >
          ← Produkty
        </Link>


        <form action={hideProduct}>

          <input
            type="hidden"
            name="id"
            value={product.id}
          />

          <button
            type="submit"
            className="productHideButton"
          >
            Skrýt produkt
          </button>

        </form>

      </div>



      <div className="adminPageHeader">

        <div>

          <div className="adminEyebrow">
            UPRAVIT PRODUKT
          </div>

          <h1>
            {product.name}
          </h1>

          <p>
            Změny uložíme do produktové databáze.
          </p>

        </div>

      </div>



      {query.saved && (

        <div className="productSuccess">
          ✓ Produkt byl uložen.
        </div>

      )}


      {query.error && (

        <div className="productError">
          {query.error ===
          "invalid"
            ? "Zkontroluj povinné údaje."
            : query.error}
        </div>

      )}



      <ProductForm
        product={
          productWithLiveStock
        }
        action={updateProduct}
        submitLabel="Uložit změny →"
      />


    </main>
  );
}