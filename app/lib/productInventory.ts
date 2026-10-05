import {
  createClient,
} from "@supabase/supabase-js";


export type ProductWithLiveStock = {

  id: string;

  slug: string;

  name: string;

  category:
    | "booster-box"
    | "elite-trainer-box"
    | "mini-tin"
    | "booster"
    | "collection-box"
    | "ostatni";

  categoryName: string;

  set: string;

  price: number;

  oldPrice?: number;

  stock: number;

  badge?: string;

  image: string;

  emoji: string;

  shortDescription: string;

  description: string;

  contents: string[];

  active: boolean;

  featured: boolean;

  sortOrder: number;

};


function getSupabaseClient() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;


  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {

    throw new Error(
      "Chybí Supabase environment variables."
    );

  }


  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {

      auth: {

        persistSession:
          false,

        autoRefreshToken:
          false,

      },

    }
  );

}



export async function getProductsWithLiveStock():
  Promise<ProductWithLiveStock[]> {

  const supabase =
    getSupabaseClient();


  /*
    ==========================
    PRODUKTOVÝ KATALOG
    ==========================

    Název, cena, popisy atd.
    se teď berou ze Supabase.
  */

  const {
    data: productRows,
    error: productsError,
  } =
    await supabase
      .from("products")
      .select(`
        id,
        slug,
        name,
        category,
        category_name,
        set_name,
        price,
        old_price,
        stock,
        badge,
        image,
        emoji,
        short_description,
        description,
        contents,
        active,
        featured,
        sort_order
      `)
      .eq(
        "active",
        true
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (productsError) {

    console.error(
      "PRODUCT DATABASE ERROR:",
      productsError
    );

    return [];

  }



  /*
    ==========================
    LIVE SKLAD
    ==========================
  */

  const {
    data: inventoryRows,
    error: inventoryError,
  } =
    await supabase
      .from(
        "product_inventory"
      )
      .select(
        "product_slug, stock"
      );


  if (inventoryError) {

    console.error(
      "INVENTORY ERROR:",
      inventoryError
    );

  }



  const inventory =
    new Map<
      string,
      number
    >();


  for (
    const row of
    inventoryRows ?? []
  ) {

    inventory.set(
      row.product_slug,
      Number(
        row.stock ?? 0
      )
    );

  }



  /*
    ==========================
    DATABASE → SHOP FORMAT
    ==========================
  */

  return (
    productRows ?? []
  ).map(
    (product) => ({

      id:
        product.id,

      slug:
        product.slug,

      name:
        product.name,

      category:
        product.category,

      categoryName:
        product.category_name,

      set:
        product.set_name,

      price:
        Number(
          product.price
        ),

      oldPrice:
        product.old_price !==
        null
          ? Number(
              product.old_price
            )
          : undefined,

      /*
        product_inventory je zatím
        hlavní zdroj skladu.
      */

      stock:
        inventory.get(
          product.slug
        ) ??
        Number(
          product.stock ?? 0
        ),

      badge:
        product.badge ||
        undefined,

      image:
        product.image || "",

      emoji:
        product.emoji || "🎴",

      shortDescription:
        product.short_description ||
        "",

      description:
        product.description ||
        "",

      contents:
        Array.isArray(
          product.contents
        )
          ? product.contents.map(
              String
            )
          : [],

      active:
        Boolean(
          product.active
        ),

      featured:
        Boolean(
          product.featured
        ),

      sortOrder:
        Number(
          product.sort_order ??
          0
        ),

    })
  );

}



export async function getProductWithLiveStock(
  slug: string
):
  Promise<
    ProductWithLiveStock |
    undefined
  > {

  const products =
    await getProductsWithLiveStock();


  return products.find(
    (product) =>
      product.slug ===
      slug
  );

}