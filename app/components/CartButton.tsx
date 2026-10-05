
"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useCart,
} from "./CartProvider";


export default function CartButton() {
  const pathname = usePathname();

  const {
    totalItems,
    cartLoaded,
  } = useCart();


  return (
    <div className="siteHeaderActions">

      {/* ÚČET */}

      <Link
        href="/ucet"
        className="siteActionButton"
        aria-label="Můj účet"
        aria-current={
          pathname === "/ucet"
            ? "page"
            : undefined
        }
        title="Můj účet"
      >

        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >

          <circle
            cx="12"
            cy="8"
            r="4"
          />

          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />

        </svg>

      </Link>


      {/* KOŠÍK */}

      <Link
        href="/kosik"
        className="siteActionButton siteCartButton"
        aria-label={
          cartLoaded
            ? `Košík, ${totalItems} produktů`
            : "Košík"
        }
        aria-current={
          pathname === "/kosik"
            ? "page"
            : undefined
        }
        title="Košík"
      >

        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >

          <path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h8.9a2 2 0 0 0 2-1.6L22 8H6" />

          <circle
            cx="10"
            cy="20"
            r="1"
          />

          <circle
            cx="19"
            cy="20"
            r="1"
          />

        </svg>


        {cartLoaded &&
          totalItems > 0 && (

          <span className="siteCartCount">

            {totalItems > 99
              ? "99+"
              : totalItems}

          </span>

        )}

      </Link>

    </div>
  );
}