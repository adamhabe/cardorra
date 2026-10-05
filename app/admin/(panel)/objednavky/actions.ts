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
  isOrderStatus,
} from "../../../../lib/admin/orders";


function text(
  formData: FormData,
  name: string,
  maxLength: number
) {

  return String(
    formData.get(name) ||
    ""
  )
    .trim()
    .slice(
      0,
      maxLength
    );

}


export async function updateOrder(
  formData: FormData
) {

  const currentAdmin =
    await requireAdmin();


  const orderId =
    text(
      formData,
      "order_id",
      100
    );


  const status =
    text(
      formData,
      "status",
      50
    );


  const adminNote =
    text(
      formData,
      "admin_note",
      5000
    );


  const trackingNumber =
    text(
      formData,
      "tracking_number",
      200
    );


  const statusNote =
    text(
      formData,
      "status_note",
      500
    );


  if (
    !orderId ||
    !isOrderStatus(status)
  ) {

    redirect(
      "/admin/objednavky?error=invalid"
    );

  }


  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase.rpc(
      "admin_update_order",
      {

        p_order_id:
          orderId,

        p_new_status:
          status,

        p_admin_note:
          adminNote,

        p_tracking_number:
          trackingNumber,

        p_status_note:
          statusNote,

        p_admin_user_id:
          currentAdmin.userId,

      }
    );


  if (error) {

    console.error(
      "ADMIN ORDER UPDATE ERROR:",
      error
    );


    redirect(
      `/admin/objednavky/${orderId}?error=save`
    );

  }


  revalidatePath(
    "/admin"
  );


  revalidatePath(
    "/admin/objednavky"
  );


  revalidatePath(
    `/admin/objednavky/${orderId}`
  );


  redirect(
    `/admin/objednavky/${orderId}?saved=1`
  );

}
export async function cancelOrder(
  formData: FormData
) {

  const currentAdmin =
    await requireAdmin();


  const orderId =
    String(
      formData.get(
        "order_id"
      ) || ""
    ).trim();


  const reason =
    String(
      formData.get(
        "cancel_reason"
      ) || ""
    )
      .trim()
      .slice(
        0,
        500
      );


  if (!orderId) {

    redirect(
      "/admin/objednavky?error=invalid"
    );

  }


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "admin_cancel_order",
      {

        p_order_id:
          orderId,

        p_reason:
          reason,

        p_admin_user_id:
          currentAdmin.userId,

      }
    );


  if (error) {

    console.error(
      "ADMIN CANCEL ORDER ERROR:",
      error
    );


    if (
      error.message.includes(
        "ORDER_ALREADY_FULFILLED"
      )
    ) {

      redirect(
        `/admin/objednavky/${orderId}?error=already-fulfilled`
      );

    }


    redirect(
      `/admin/objednavky/${orderId}?error=cancel`
    );

  }


  revalidatePath(
    "/"
  );


  revalidatePath(
    "/pokemon"
  );


  revalidatePath(
    "/admin"
  );


  revalidatePath(
    "/admin/produkty"
  );


  revalidatePath(
    "/admin/objednavky"
  );


  revalidatePath(
    `/admin/objednavky/${orderId}`
  );


  const refundRequired =
    data?.refund_required ===
    true;


  if (refundRequired) {

    redirect(
      `/admin/objednavky/${orderId}?cancelled=1&refund=pending`
    );

  }


  redirect(
    `/admin/objednavky/${orderId}?cancelled=1`
  );

}

export async function rejectCancellationRequest(
  formData: FormData
) {

  const currentAdmin =
    await requireAdmin();


  const orderId =
    String(
      formData.get(
        "order_id"
      ) || ""
    ).trim();


  const note =
    String(
      formData.get(
        "reject_note"
      ) || ""
    )
      .trim()
      .slice(
        0,
        500
      );


  if (!orderId) {

    redirect(
      "/admin/objednavky?error=invalid"
    );

  }


  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase.rpc(
      "admin_reject_cancellation_request",
      {

        p_order_id:
          orderId,

        p_note:
          note,

        p_admin_user_id:
          currentAdmin.userId,

      }
    );


  if (error) {

    console.error(
      "REJECT CANCELLATION ERROR:",
      error
    );


    redirect(
      `/admin/objednavky/${orderId}?error=reject`
    );

  }


  revalidatePath(
    "/admin/objednavky"
  );


  revalidatePath(
    `/admin/objednavky/${orderId}`
  );


  redirect(
    `/admin/objednavky/${orderId}?saved=rejected`
  );

}