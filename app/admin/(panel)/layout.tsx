import Link from "next/link";

import type {
  ReactNode,
} from "react";

import {
  requireAdmin,
} from "../../../lib/admin/requireAdmin";

import {
  logout,
} from "../actions";

import AdminNav from "./AdminNav";


export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {

  const admin =
    await requireAdmin();


  return (
    <div className="adminShell">

      <aside className="adminSidebar">

        <div>

          <Link
            href="/admin"
            className="adminSidebarBrand"
          >
            TCG<span>VAULT</span>
          </Link>

          <div className="adminSidebarLabel">
            ADMIN PANEL
          </div>

        </div>


        <AdminNav />


        <div className="adminSidebarBottom">

          <div className="adminAccount">

            <div className="adminAvatar">
              A
            </div>

            <div>

              <strong>
                Admin
              </strong>

              <span>
                {admin.email}
              </span>

            </div>

          </div>


          <form action={logout}>

            <button
              type="submit"
              className="adminLogout"
            >
              Odhlásit se
            </button>

          </form>

        </div>

      </aside>


      <div className="adminContent">

        <header className="adminTopbar">

          <div>

            <span className="adminTopLabel">
              TCG VAULT
            </span>

            <strong>
              Administrace
            </strong>

          </div>


          <Link
            href="/"
            target="_blank"
            className="adminOpenShop"
          >
            Otevřít shop ↗
          </Link>

        </header>


        {children}

      </div>

    </div>
  );
}