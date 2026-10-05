import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "../../../../lib/supabase/server";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";


export const runtime =
  "nodejs";


const BUCKET =
  "product-images";


const MAX_FILE_SIZE =
  4 * 1024 * 1024;


const allowedTypes:
  Record<
    string,
    string
  > = {

    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",

  };


async function isAdmin() {

  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.auth
      .getClaims();


  const userId =
    data?.claims?.sub;


  if (
    error ||
    !userId
  ) {

    return false;

  }


  const admin =
    createAdminClient();


  const {
    data: adminRow,
    error: adminError,
  } =
    await admin
      .from("admin_users")
      .select("user_id")
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();


  return (
    !adminError &&
    !!adminRow
  );

}



function slugify(
  value: string
) {

  const result =
    value
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


  return (
    result ||
    "product"
  );

}



function isRealImage(
  buffer: Buffer,
  mime: string
) {

  if (
    mime ===
    "image/jpeg"
  ) {

    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );

  }


  if (
    mime ===
    "image/png"
  ) {

    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );

  }


  if (
    mime ===
    "image/webp"
  ) {

    return (
      buffer.length >= 12 &&
      buffer
        .toString(
          "ascii",
          0,
          4
        ) ===
        "RIFF" &&
      buffer
        .toString(
          "ascii",
          8,
          12
        ) ===
        "WEBP"
    );

  }


  return false;

}



export async function POST(
  request: Request
) {

  try {


    /*
      =========================
      ADMIN KONTROLA
      =========================
    */

    if (
      !(await isAdmin())
    ) {

      return NextResponse.json(
        {
          error:
            "Nemáš oprávnění k uploadu.",
        },
        {
          status: 401,
        }
      );

    }



    /*
      =========================
      FORM DATA
      =========================
    */

    const formData =
      await request.formData();


    const file =
      formData.get(
        "file"
      );


    const slug =
      slugify(
        String(
          formData.get(
            "slug"
          ) ||
          "product"
        )
      );



    if (
      !(file instanceof File) ||
      file.size === 0
    ) {

      return NextResponse.json(
        {
          error:
            "Nebyl vybrán obrázek.",
        },
        {
          status: 400,
        }
      );

    }



    /*
      =========================
      KONTROLA TYPU
      =========================
    */

    const extension =
      allowedTypes[
        file.type
      ];


    if (!extension) {

      return NextResponse.json(
        {
          error:
            "Povolené jsou pouze JPG, PNG a WebP obrázky.",
        },
        {
          status: 400,
        }
      );

    }



    /*
      =========================
      KONTROLA VELIKOSTI
      =========================
    */

    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      return NextResponse.json(
        {
          error:
            "Obrázek je příliš velký. Maximum jsou 4 MB.",
        },
        {
          status: 400,
        }
      );

    }



    /*
      =========================
      KONTROLA OBSAHU SOUBORU
      =========================

      Nekontrolujeme jen příponu,
      ale i základní podpis obrázku.
    */

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );


    if (
      !isRealImage(
        buffer,
        file.type
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Soubor nevypadá jako platný obrázek.",
        },
        {
          status: 400,
        }
      );

    }



    /*
      =========================
      STORAGE PATH
      =========================
    */

    const filename =
      `${crypto.randomUUID()}.${extension}`;


    const path =
      `${slug}/${filename}`;



    /*
      =========================
      UPLOAD
      =========================
    */

    const admin =
      createAdminClient();


    const {
      error: uploadError,
    } =
      await admin.storage
        .from(BUCKET)
        .upload(
          path,
          buffer,
          {

            contentType:
              file.type,

            cacheControl:
              "31536000",

            upsert:
              false,

          }
        );


    if (uploadError) {

      console.error(
        "PRODUCT IMAGE UPLOAD ERROR:",
        uploadError
      );


      return NextResponse.json(
        {
          error:
            "Obrázek se nepodařilo nahrát.",
        },
        {
          status: 500,
        }
      );

    }



    /*
      =========================
      PUBLIC URL
      =========================
    */

    const {
      data: publicData,
    } =
      admin.storage
        .from(BUCKET)
        .getPublicUrl(
          path
        );


    return NextResponse.json({

      success:
        true,

      url:
        publicData.publicUrl,

      path,

    });


  } catch (
    error
  ) {

    console.error(
      "PRODUCT IMAGE API ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Při uploadu nastala neočekávaná chyba.",
      },
      {
        status: 500,
      }
    );

  }

}