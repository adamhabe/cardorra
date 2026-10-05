"use server";

import {
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "../../../../lib/admin/requireAdmin";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";

import {
  deleteStoredProductImage,
} from "../../../../lib/admin/productImages";

import {
  products as oldProducts,
} from "../../../data/products";


const categories = {

  "booster-box":
    "Booster Box",

  "elite-trainer-box":
    "Elite Trainer Box",

  "mini-tin":
    "Mini Tin",

  booster:
    "Booster",

  "collection-box":
    "Collection Box",

  ostatni:
    "Ostatní",

};


function slugify(
  value: string
) {

  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

}


function text(
  formData: FormData,
  name: string
) {

  return String(
    formData.get(name) ||
    ""
  ).trim();

}


function integer(
  formData: FormData,
  name: string,
  fallback = 0
) {

  const value =
    Number(
      formData.get(name)
    );


  if (
    !Number.isFinite(value)
  ) {

    return fallback;

  }


  return Math.max(
    0,
    Math.floor(value)
  );

}


function contentsFromForm(
  formData: FormData
) {

  return text(
    formData,
    "contents"
  )
    .split("\n")
    .map(
      (line) =>
        line.trim()
    )
    .filter(Boolean);

}


function getUploadedImage(
  formData: FormData
) {

  const url =
    text(
      formData,
      "uploaded_image_url"
    );


  const path =
    text(
      formData,
      "uploaded_image_path"
    );


  if (
    !url ||
    !path
  ) {

    return null;

  }


  if (
    path.includes("..") ||
    path.startsWith("/") ||
    path.length > 500
  ) {

    return null;

  }


  if (
    !url.includes(
      "/storage/v1/object/public/product-images/"
    )
  ) {

    return null;

  }


  return {
    url,
    path,
  };

}



/*
  ===========================
  IMPORT STARÉHO KATALOGU
  ===========================
*/

export async function importCurrentCatalog() {

  const adminUser =
    await requireAdmin();


  const supabase =
    createAdminClient();


  const {
    data: inventory,
  } =
    await supabase
      .from("product_inventory")
      .select(
        "product_slug, stock"
      );


  const inventoryMap =
    new Map(
      (
        inventory ||
        []
      ).map(
        (row) => [
          row.product_slug,
          row.stock,
        ]
      )
    );


  const rows =
    oldProducts.map(
      (
        product,
        index
      ) => ({

        slug:
          product.slug,

        name:
          product.name,

        category:
          product.category,

        category_name:
          product.categoryName,

        set_name:
          product.set,

        price:
          product.price,

        old_price:
          product.oldPrice ??
          null,

        stock:
          inventoryMap.get(
            product.slug
          ) ??
          product.stock,

        badge:
          product.badge ??
          null,

        image:
          product.image,

        image_path:
          null,

        emoji:
          product.emoji,

        short_description:
          product.shortDescription,

        description:
          product.description,

        contents:
          product.contents,

        active:
          true,

        featured:
          index < 3,

        sort_order:
          index,

      })
    );


  const {
    error,
  } =
    await supabase
      .from("products")
      .upsert(
        rows,
        {
          onConflict:
            "slug",
        }
      );


  if (error) {

    redirect(
      `/admin/produkty?error=${encodeURIComponent(
        error.message
      )}`
    );

  }


  await supabase
    .from(
      "admin_audit_log"
    )
    .insert({

      admin_user_id:
        adminUser.userId,

      action:
        "IMPORT_PRODUCTS",

      entity_type:
        "products",

      details: {
        count:
          rows.length,
      },

    });


  revalidatePath(
    "/admin/produkty"
  );


  redirect(
    "/admin/produkty?imported=1"
  );

}



/*
  ===========================
  NOVÝ PRODUKT
  ===========================
*/

export async function createProduct(
  formData: FormData
) {

  const adminUser =
    await requireAdmin();


  const supabase =
    createAdminClient();


  const name =
    text(
      formData,
      "name"
    );


  let slug =
    text(
      formData,
      "slug"
    );


  slug =
    slugify(
      slug ||
      name
    );


  const category =
    text(
      formData,
      "category"
    );


  const uploadedImage =
    getUploadedImage(
      formData
    );


  if (
    !name ||
    !slug ||
    !Object.prototype
      .hasOwnProperty.call(
        categories,
        category
      )
  ) {

    if (
      uploadedImage
    ) {

      await deleteStoredProductImage(
        uploadedImage.path
      );

    }


    redirect(
      "/admin/produkty/novy?error=invalid"
    );

  }


  const price =
    integer(
      formData,
      "price"
    );


  const stock =
    integer(
      formData,
      "stock"
    );


  const oldPriceRaw =
    text(
      formData,
      "old_price"
    );


  const oldPrice =
    oldPriceRaw
      ? Number(
          oldPriceRaw
        )
      : null;


  const row = {

    slug,

    name,

    category,

    category_name:
      categories[
        category as keyof typeof categories
      ],

    set_name:
      text(
        formData,
        "set_name"
      ),

    price,

    old_price:
      oldPrice,

    stock,

    badge:
      text(
        formData,
        "badge"
      ) ||
      null,

    image:
      uploadedImage?.url ||
      "",

    image_path:
      uploadedImage?.path ||
      null,

    emoji:
      text(
        formData,
        "emoji"
      ) ||
      "🎴",

    short_description:
      text(
        formData,
        "short_description"
      ),

    description:
      text(
        formData,
        "description"
      ),

    contents:
      contentsFromForm(
        formData
      ),

    active:
      formData.get(
        "active"
      ) ===
      "on",

    featured:
      formData.get(
        "featured"
      ) ===
      "on",

    sort_order:
      integer(
        formData,
        "sort_order"
      ),

  };


  const {
    data: created,
    error,
  } =
    await supabase
      .from("products")
      .insert(row)
      .select(
        "id, slug"
      )
      .single();


  if (
    error ||
    !created
  ) {

    if (
      uploadedImage
    ) {

      await deleteStoredProductImage(
        uploadedImage.path
      );

    }


    redirect(
      `/admin/produkty/novy?error=${encodeURIComponent(
        error?.message ||
        "Produkt se nepodařilo vytvořit."
      )}`
    );

  }



  /*
    Současný objednávkový systém
    ještě používá product_inventory.
  */

  const {
    error:
      inventoryError,
  } =
    await supabase
      .from(
        "product_inventory"
      )
      .upsert({

        product_slug:
          slug,

        stock,

        updated_at:
          new Date()
            .toISOString(),

      });


  if (
    inventoryError
  ) {

    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        created.id
      );


    if (
      uploadedImage
    ) {

      await deleteStoredProductImage(
        uploadedImage.path
      );

    }


    redirect(
      `/admin/produkty/novy?error=${encodeURIComponent(
        inventoryError.message
      )}`
    );

  }


  await supabase
    .from(
      "admin_audit_log"
    )
    .insert({

      admin_user_id:
        adminUser.userId,

      action:
        "CREATE_PRODUCT",

      entity_type:
        "product",

      entity_id:
        created.id,

      details: {

        slug,

        name,

        price,

        stock,

        image:
          !!uploadedImage,

      },

    });


  revalidatePath(
    "/admin"
  );


  revalidatePath(
    "/admin/produkty"
  );


  revalidatePath(
    "/"
  );


  revalidatePath(
    "/pokemon"
  );


  redirect(
    `/admin/produkty/${created.id}?saved=created`
  );

}



/*
  ===========================
  UPRAVIT PRODUKT
  ===========================
*/

export async function updateProduct(
  formData: FormData
) {

  const adminUser =
    await requireAdmin();


  const supabase =
    createAdminClient();


  const id =
    text(
      formData,
      "id"
    );


  const {
    data: existing,
  } =
    await supabase
      .from("products")
      .select("*")
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (!existing) {

    redirect(
      "/admin/produkty?error=Produkt nenalezen."
    );

  }


  const name =
    text(
      formData,
      "name"
    );


  const slug =
    slugify(
      text(
        formData,
        "slug"
      ) ||
      name
    );


  const category =
    text(
      formData,
      "category"
    );


  const uploadedImage =
    getUploadedImage(
      formData
    );


  const removeImage =
    text(
      formData,
      "remove_image"
    ) ===
    "true";


  if (
    !name ||
    !slug ||
    !Object.prototype
      .hasOwnProperty.call(
        categories,
        category
      )
  ) {

    if (
      uploadedImage
    ) {

      await deleteStoredProductImage(
        uploadedImage.path
      );

    }


    redirect(
      `/admin/produkty/${id}?error=invalid`
    );

  }



  /*
    =========================
    OBRÁZEK
    =========================
  */

  let nextImage =
    existing.image ||
    "";


  let nextImagePath:
    string |
    null =
      existing.image_path ||
      null;


  if (
    uploadedImage
  ) {

    nextImage =
      uploadedImage.url;


    nextImagePath =
      uploadedImage.path;

  } else if (
    removeImage
  ) {

    nextImage =
      "";


    nextImagePath =
      null;

  }



  const price =
    integer(
      formData,
      "price"
    );


  const stock =
    integer(
      formData,
      "stock"
    );


  const oldPriceRaw =
    text(
      formData,
      "old_price"
    );


  const oldPrice =
    oldPriceRaw
      ? Number(
          oldPriceRaw
        )
      : null;



  const updated = {

    slug,

    name,

    category,

    category_name:
      categories[
        category as keyof typeof categories
      ],

    set_name:
      text(
        formData,
        "set_name"
      ),

    price,

    old_price:
      oldPrice,

    stock,

    badge:
      text(
        formData,
        "badge"
      ) ||
      null,

    image:
      nextImage,

    image_path:
      nextImagePath,

    emoji:
      text(
        formData,
        "emoji"
      ) ||
      "🎴",

    short_description:
      text(
        formData,
        "short_description"
      ),

    description:
      text(
        formData,
        "description"
      ),

    contents:
      contentsFromForm(
        formData
      ),

    active:
      formData.get(
        "active"
      ) ===
      "on",

    featured:
      formData.get(
        "featured"
      ) ===
      "on",

    sort_order:
      integer(
        formData,
        "sort_order"
      ),

  };


  const {
    error,
  } =
    await supabase
      .from("products")
      .update(
        updated
      )
      .eq(
        "id",
        id
      );


  if (error) {

    if (
      uploadedImage
    ) {

      await deleteStoredProductImage(
        uploadedImage.path
      );

    }


    redirect(
      `/admin/produkty/${id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  }



  /*
    Po úspěšném DB update
    můžeme bezpečně odstranit
    původní obrázek.
  */

  if (
    existing.image_path &&
    existing.image_path !==
      nextImagePath
  ) {

    await deleteStoredProductImage(
      existing.image_path
    );

  }



  /*
    =========================
    LIVE SKLAD
    =========================
  */

  const {
    error:
      inventoryError,
  } =
    await supabase
      .from(
        "product_inventory"
      )
      .upsert({

        product_slug:
          slug,

        stock,

        updated_at:
          new Date()
            .toISOString(),

      });


  if (
    inventoryError
  ) {

    redirect(
      `/admin/produkty/${id}?error=${encodeURIComponent(
        inventoryError.message
      )}`
    );

  }



  /*
    Pokud se změnil slug,
    odstraníme starý inventory řádek.
  */

  if (
    existing.slug !==
    slug
  ) {

    await supabase
      .from(
        "product_inventory"
      )
      .delete()
      .eq(
        "product_slug",
        existing.slug
      );

  }



  await supabase
    .from(
      "admin_audit_log"
    )
    .insert({

      admin_user_id:
        adminUser.userId,

      action:
        "UPDATE_PRODUCT",

      entity_type:
        "product",

      entity_id:
        id,

      details: {

        before: {

          name:
            existing.name,

          price:
            existing.price,

          slug:
            existing.slug,

          image:
            existing.image,

        },

        after: {

          name,

          price,

          stock,

          slug,

          image:
            nextImage,

        },

      },

    });



  revalidatePath(
    "/admin"
  );


  revalidatePath(
    "/admin/produkty"
  );


  revalidatePath(
    `/admin/produkty/${id}`
  );


  revalidatePath(
    "/"
  );


  revalidatePath(
    "/pokemon"
  );


  revalidatePath(
    `/produkt/${slug}`
  );


  redirect(
    `/admin/produkty/${id}?saved=1`
  );

}



/*
  ===========================
  SKRÝT PRODUKT
  ===========================
*/

export async function hideProduct(
  formData: FormData
) {

  const adminUser =
    await requireAdmin();


  const supabase =
    createAdminClient();


  const id =
    text(
      formData,
      "id"
    );


  const {
    data: product,
  } =
    await supabase
      .from("products")
      .select(
        "id, name, slug"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (!product) {

    redirect(
      "/admin/produkty"
    );

  }


  await supabase
    .from("products")
    .update({
      active:
        false,
    })
    .eq(
      "id",
      id
    );


  await supabase
    .from(
      "admin_audit_log"
    )
    .insert({

      admin_user_id:
        adminUser.userId,

      action:
        "HIDE_PRODUCT",

      entity_type:
        "product",

      entity_id:
        id,

      details: {

        name:
          product.name,

        slug:
          product.slug,

      },

    });


  revalidatePath(
    "/admin/produkty"
  );


  revalidatePath(
    "/"
  );


  revalidatePath(
    "/pokemon"
  );


  redirect(
    "/admin/produkty?saved=hidden"
  );

}