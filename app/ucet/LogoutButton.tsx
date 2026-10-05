
"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createBrowserClient,
} from "@supabase/ssr";


export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);


  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL!;

      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

      const supabase =
        createBrowserClient(
          supabaseUrl,
          supabaseKey
        );

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/");
      router.refresh();

    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      setLoading(false);

      alert(
        "Odhlášení se nepodařilo. " +
        "Zkus to prosím znovu."
      );
    }
  }


  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading
        ? "Odhlašuji..."
        : "Odhlásit se"}
    </button>
  );
}