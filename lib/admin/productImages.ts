import "server-only";

import {
  createAdminClient,
} from "../supabase/admin";


const BUCKET =
  "product-images";


function isSafePath(
  path: string
) {

  return (
    !!path &&
    path.length <= 500 &&
    !path.includes("..") &&
    !path.startsWith("/")
  );

}


export async function deleteStoredProductImage(
  path:
    string |
    null |
    undefined
) {

  if (
    !path ||
    !isSafePath(path)
  ) {

    return;

  }


  const admin =
    createAdminClient();


  const {
    error,
  } =
    await admin.storage
      .from(BUCKET)
      .remove([
        path,
      ]);


  if (error) {

    console.error(
      "PRODUCT IMAGE DELETE ERROR:",
      error
    );

  }

}