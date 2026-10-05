"use server";

import {
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";

import {
  createAdminClient,
} from "../../../../lib/supabase/admin";


function validToken(
  token: string
) {

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    token
  );

}


export async function requestCancellation(
  token: string,
  formData: FormData
) {

  if (
    !validToken(token)
  ) {

    redirect(
      "/"
    );

  }


  const reason =
    String(
      formData.get(
        "reason"
      ) || ""
    )
      .trim()
      .slice(
        0,
        500
      );


  if (
    reason.length < 3
  ) {

    redirect(
      `/objednavka/moje/${token}?error=reason`
    );

  }


  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase.rpc(
      "request_order_cancellation",
      {

        p_customer_token:
          token,

        p_reason:
          reason,

      }
    );


  if (error) {

    console.error(
      "CANCELLATION REQUEST ERROR:",
      error
    );


    if (
      error.message.includes(
        "CANCELLATION_NOT_ALLOWED"
      )
    ) {

      redirect(
        `/objednavka/moje/${token}?error=not-allowed`
      );

    }


    if (
      error.message.includes(
        "REQUEST_ALREADY_RESOLVED"
      )
    ) {

      redirect(
        `/objednavka/moje/${token}?error=resolved`
      );

    }


    redirect(
      `/objednavka/moje/${token}?error=request`
    );

  }


  revalidatePath(
    `/objednavka/moje/${token}`
  );


  revalidatePath(
    "/admin/objednavky"
  );


  redirect(
    `/objednavka/moje/${token}?requested=1`
  );

}