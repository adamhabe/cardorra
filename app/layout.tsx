
import type { Metadata } from "next";

import "./globals.css";
import "./header-actions.css";

import {
  CartProvider,
} from "./components/CartProvider";

import SiteHeader from "./components/SiteHeader";

export const metadata: Metadata = {
  title: "Cardorra | Pokémon TCG",

  description:
    "Cardorra – Pokémon TCG produkty pro hráče a sběratele.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        <CartProvider>

          <SiteHeader />

          {children}

        </CartProvider>
      </body>
    </html>
  );
}