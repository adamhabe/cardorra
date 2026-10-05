
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import CartButton from "./CartButton";

export default function SiteHeader() {
  const pathname = usePathname();

  const menuRef = useRef<HTMLDetailsElement>(null);

  // Při přechodu na jinou stránku zavřeme menu.
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  }, [pathname]);

  // Admin a přihlášení mají vlastní rozvržení.
  const hideHeader =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/prihlaseni" ||
    pathname.startsWith("/prihlaseni/") ||
    pathname === "/registrace" ||
    pathname.startsWith("/registrace/");

  if (hideHeader) {
    return null;
  }

  function closeMenu() {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  }

  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">

        {/* LEVÁ STRANA */}

        <div className="siteHeaderLeft">

          <details
            className="siteMenu"
            ref={menuRef}
          >
            <summary
              className="siteMenuButton"
              aria-label="Otevřít hlavní menu"
            >
              <span />
              <span />
              <span />
            </summary>

            <nav
              className="siteMenuPanel"
              aria-label="Hlavní menu obchodu"
            >
              <div className="siteMenuHeading">
                KARETNÍ HRY
              </div>

              <Link
                href="/pokemon"
                className="siteMenuItem"
                onClick={closeMenu}
              >
                <span>Pokémon TCG</span>
                <span className="siteMenuArrow">→</span>
              </Link>

              <div className="siteMenuItem siteMenuComing">
                <span>Disney Lorcana</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>One Piece</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>Riftbound</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>Yu-Gi-Oh!</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>Magic: The Gathering</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuDivider" />

              <div className="siteMenuHeading">
                DALŠÍ SORTIMENT
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>Příslušenství</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <Link
                href="/darkove-poukazy"
                className="siteMenuItem"
                onClick={closeMenu}
              >
                <span>Dárkové poukazy</span>
                <span className="siteMenuArrow">→</span>
              </Link>

              <div className="siteMenuItem siteMenuComing">
                <span>Novinky</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>

              <div className="siteMenuItem siteMenuComing">
                <span>Předobjednávky</span>
                <span className="siteMenuBadge">BRZY</span>
              </div>
            </nav>
          </details>

          <Link
            href="/"
            className="siteBrand"
            onClick={closeMenu}
          >
            CARDORRA
          </Link>

        </div>

        {/* PRAVÁ STRANA */}

        <CartButton />

      </div>
    </header>
  );
}