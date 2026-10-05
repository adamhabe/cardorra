"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function AdminNav() {

  const pathname =
    usePathname();


  function getClass(
    path: string
  ) {

    const active =
      path === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(path);


    return active
      ? "adminMenuItem active"
      : "adminMenuItem";

  }


  return (
    <nav className="adminMenu">

      <Link
        href="/admin"
        className={getClass("/admin")}
      >
        <span>⌂</span>
        Dashboard
      </Link>


      <Link
        href="/admin/produkty"
        className={getClass(
          "/admin/produkty"
        )}
      >
        <span>◇</span>
        Produkty
      </Link>


      <Link
        href="/admin/objednavky"
        className={getClass(
          "/admin/objednavky"
        )}
      >
        <span>▤</span>
        Objednávky
      </Link>

    </nav>
  );
}