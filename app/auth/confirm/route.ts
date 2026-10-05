
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createCustomerServerClient,
} from "../../../lib/supabase/customer-server";


export async function GET(
  request: NextRequest
) {
  const tokenHash =
    request.nextUrl.searchParams.get(
      "token_hash"
    );

  const type =
    request.nextUrl.searchParams.get(
      "type"
    );

  const loginUrl = new URL(
    "/prihlaseni",
    request.url
  );

  if (
    !tokenHash ||
    type !== "email"
  ) {
    loginUrl.searchParams.set(
      "verification",
      "failed"
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  const supabase =
    await createCustomerServerClient();

  const { error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

  if (error) {
    loginUrl.searchParams.set(
      "verification",
      "failed"
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.redirect(
    new URL(
      "/ucet",
      request.url
    )
  );
}