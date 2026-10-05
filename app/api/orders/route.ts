
import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  createCustomerServerClient,
} from "../../../lib/supabase/customer-server";


type IncomingOrderItem = {
  slug: string;
  quantity: number;
};


type OrderRequest = {
  customer: {
    name: string;
    email: string;
    phone: string;
    street?: string;
    city?: string;
    zip?: string;
  };

  shipping: string;

  shippingPoint?: {
    id?: string;
    name?: string;
  };

  payment: string;

  items: IncomingOrderItem[];
};


function cleanText(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(
    0,
    maxLength
  );
}


function isValidEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


export async function POST(
  request: Request
) {
  try {
    /*
      ==========================
      SUPABASE
      ==========================
    */

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Server není správně nastavený.",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );


    /*
      ==========================
      REQUEST
      ==========================
    */

    const body: OrderRequest =
      await request.json();


    /*
      ==========================
      ZÁKAZNÍK
      ==========================
    */

    const customerName = cleanText(
      body.customer?.name,
      120
    );

    const customerEmail = cleanText(
      body.customer?.email,
      200
    ).toLowerCase();

    const customerPhone = cleanText(
      body.customer?.phone,
      40
    );

    const street = cleanText(
      body.customer?.street,
      200
    );

    const city = cleanText(
      body.customer?.city,
      120
    );

    const zip = cleanText(
      body.customer?.zip,
      20
    );

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí kontaktní údaje.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        {
          error:
            "E-mail nemá platný formát.",
        },
        {
          status: 400,
        }
      );
    }


    /*
      ==========================
      DOPRAVA
      ==========================
    */

    const shippingPrices: Record<
      string,
      number
    > = {
      pickup: 79,
      address: 109,
      personal: 0,
    };

    if (
      !Object.prototype.hasOwnProperty.call(
        shippingPrices,
        body.shipping
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Neplatný způsob dopravy.",
        },
        {
          status: 400,
        }
      );
    }

    const shipping =
      body.shipping;

    const shippingPrice =
      shippingPrices[shipping];

    if (
      shipping === "address" &&
      (!street || !city || !zip)
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí doručovací adresa.",
        },
        {
          status: 400,
        }
      );
    }

    const shippingPointId = cleanText(
      body.shippingPoint?.id,
      100
    );

    const shippingPointName = cleanText(
      body.shippingPoint?.name,
      300
    );


    /*
      ==========================
      PLATBA
      ==========================
    */

    const payment = cleanText(
      body.payment,
      30
    );

    if (
      payment !== "card" &&
      payment !== "cod"
    ) {
      return NextResponse.json(
        {
          error:
            "Neplatný způsob platby.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Comgate zatím není napojený.
      Kartové objednávky nepovolíme.
    */

    if (payment === "card") {
      return NextResponse.json(
        {
          error:
            "Platby kartou zatím nejsou aktivní.",
        },
        {
          status: 503,
        }
      );
    }


    /*
      ==========================
      POLOŽKY
      ==========================
    */

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Objednávka neobsahuje produkty.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.items.length > 50) {
      return NextResponse.json(
        {
          error:
            "Objednávka obsahuje příliš mnoho položek.",
        },
        {
          status: 400,
        }
      );
    }


    /*
      ==========================
      SLOUČENÍ DUPLICIT
      ==========================
    */

    const requestedItems =
      new Map<string, number>();

    for (const item of body.items) {
      if (
        !item ||
        typeof item.slug !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Objednávka obsahuje neplatnou položku.",
          },
          {
            status: 400,
          }
        );
      }

      const slug =
        item.slug.trim();

      if (!slug) {
        return NextResponse.json(
          {
            error:
              "Objednávka obsahuje neplatný produkt.",
          },
          {
            status: 400,
          }
        );
      }

      const previous =
        requestedItems.get(slug) || 0;

      const quantity =
        previous + item.quantity;

      if (!Number.isSafeInteger(quantity)) {
        return NextResponse.json(
          {
            error:
              "Neplatné množství produktu.",
          },
          {
            status: 400,
          }
        );
      }

      requestedItems.set(
        slug,
        quantity
      );
    }


    /*
      ==========================
      PRODUKTY Z DATABÁZE
      ==========================
    */

    const requestedSlugs =
      Array.from(
        requestedItems.keys()
      );

    const {
      data: databaseProducts,
      error: productsError,
    } = await supabase
      .from("products")
      .select(
        "slug, name, price, active"
      )
      .in(
        "slug",
        requestedSlugs
      )
      .eq(
        "active",
        true
      );

    if (productsError) {
      console.error(
        "ORDER PRODUCTS ERROR:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se ověřit produkty.",
        },
        {
          status: 500,
        }
      );
    }

    const verifiedItems: {
      slug: string;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    let productsPrice = 0;

    for (
      const [slug, quantity]
      of requestedItems
    ) {
      const product =
        databaseProducts?.find(
          (item) =>
            item.slug === slug
        );

      if (!product) {
        return NextResponse.json(
          {
            error:
              `Produkt "${slug}" neexistuje nebo není aktivní.`,
          },
          {
            status: 400,
          }
        );
      }

      const price =
        Number(product.price);

      if (
        !Number.isSafeInteger(price) ||
        price < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Neplatná cena produktu.",
          },
          {
            status: 500,
          }
        );
      }

      productsPrice +=
        price * quantity;

      verifiedItems.push({
        slug: product.slug,
        name: product.name,
        price,
        quantity,
      });
    }

    const finalPrice =
      productsPrice + shippingPrice;

    if (
      !Number.isSafeInteger(finalPrice) ||
      finalPrice < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Neplatná celková cena objednávky.",
        },
        {
          status: 400,
        }
      );
    }


    /*
      ==========================
      ČÍSLO OBJEDNÁVKY
      ==========================
    */

    const today = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const random = crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase();

    const orderNumber =
      `TCG-${today}-${random}`;


    /*
      ==========================
      ATOMICKÉ VYTVOŘENÍ OBJEDNÁVKY
      ==========================
    */

    const {
      data,
      error,
    } = await supabase.rpc(
      "create_order_with_stock_v2",
      {
        p_order_number:
          orderNumber,

        p_customer_name:
          customerName,

        p_customer_email:
          customerEmail,

        p_customer_phone:
          customerPhone,

        p_street:
          shipping === "address"
            ? street
            : "",

        p_city:
          shipping === "address"
            ? city
            : "",

        p_zip:
          shipping === "address"
            ? zip
            : "",

        p_shipping_method:
          shipping,

        p_shipping_point_id:
          shipping === "pickup"
            ? shippingPointId
            : "",

        p_shipping_point_name:
          shipping === "pickup"
            ? shippingPointName
            : "",

        p_payment_method:
          "cod",

        p_products_price:
          productsPrice,

        p_shipping_price:
          shippingPrice,

        p_total_price:
          finalPrice,

        p_items:
          verifiedItems,
      }
    );


    if (error) {
      console.error(
        "ORDER RPC ERROR:",
        error
      );

      if (
        error.message.includes(
          "OUT_OF_STOCK:"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Některý produkt už není v požadovaném množství skladem.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Objednávku se nepodařilo uložit.",
        },
        {
          status: 500,
        }
      );
    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    if (
      !result ||
      !result.order_number
    ) {
      return NextResponse.json(
        {
          error:
            "Objednávku se nepodařilo dokončit.",
        },
        {
          status: 500,
        }
      );
    }


    /*
      ==========================
      PŘIŘAZENÍ K ÚČTU
      ==========================

      Uživatelské ID nikdy nebereme
      z request body.

      Přihlášení ověří přímo Supabase.
    */

    try {
      const authClient =
        await createCustomerServerClient();

      const {
        data: { user },
        error: authError,
      } = await authClient.auth.getUser();

      if (!authError && user) {
        const {
          error: linkError,
        } = await supabase
          .from("orders")
          .update({
            customer_user_id:
              user.id,
          })
          .eq(
            "order_number",
            result.order_number
          )
          .is(
            "customer_user_id",
            null
          );

        if (linkError) {
          console.error(
            "ORDER ACCOUNT LINK ERROR:",
            linkError
          );
        }
      }
    } catch (linkError) {
      /*
        Objednávka už byla vytvořena.

        Chyba při přiřazení účtu
        nesmí zákazníka vést k tomu,
        aby objednávku poslal podruhé.
      */

      console.error(
        "ORDER ACCOUNT LINK CRASH:",
        linkError
      );
    }


    /*
      ==========================
      SOUKROMÝ ODKAZ NA OBJEDNÁVKU
      ==========================
    */

    const {
      data: createdOrder,
      error: tokenError,
    } = await supabase
      .from("orders")
      .select(
        "customer_token"
      )
      .eq(
        "order_number",
        result.order_number
      )
      .maybeSingle();

    if (tokenError) {
      console.error(
        "ORDER TOKEN ERROR:",
        tokenError
      );
    }


    /*
      ==========================
      ÚSPĚŠNÁ OBJEDNÁVKA
      ==========================
    */

    return NextResponse.json(
      {
        success: true,

        orderNumber:
          result.order_number,

        orderToken:
          createdOrder?.customer_token ||
          null,

        paymentMethod:
          "cod",

        paymentStatus:
          "pending",

        productsPrice,
        shippingPrice,
        finalPrice,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "ORDER API CRASH:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Neočekávaná chyba serveru.",
      },
      {
        status: 500,
      }
    );
  }
}