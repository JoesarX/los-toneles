"use client";

import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Calculator,
  ClipboardList,
  ExternalLink,
  LogOut,
  MessageSquareHeart,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/orders", label: "Órdenes", icon: ClipboardList },
  { href: "/admin/register", label: "Caja", icon: Calculator },
  { href: "/admin/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/admin/products", label: "Productos", icon: UtensilsCrossed },
  { href: "/admin/feedback", label: "Comentarios", icon: MessageSquareHeart },
];

const AdminNavBar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const initial = session?.user?.email?.charAt(0).toUpperCase() ?? "A";

  if (pathname === "/admin/register") return null;

  return (
    <header className="border-b border-tonel-deep/60 bg-tonel text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/admin/orders" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream/10 text-amber">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-semibold">
                Los Toneles
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                Administración
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-full border border-cream/15 px-3 py-2 text-xs font-semibold text-cream/75 transition hover:border-cream/40 hover:text-cream sm:inline-flex"
            >
              Ver sitio
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {status === "loading" ? (
              <span className="h-8 w-8 animate-pulse rounded-full bg-cream/10" />
            ) : (
              <>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/10 text-xs font-bold text-amber"
                  title={session?.user?.email ?? "Administrador"}
                >
                  {initial}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full p-2 text-cream/60 transition hover:bg-cream/10 hover:text-cream"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <nav
          className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto pb-3"
          aria-label="Administración"
        >
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-cream text-tonel"
                    : "text-cream/65 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AdminNavBar;
