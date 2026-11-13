"use client";

import { categories } from "@/data/categories";
import { site } from "@/data/site";
import { useCartHydrated } from "@/utils/useCartHydrated";
import { useCartStore } from "@/utils/store";
import {
  ChevronRight,
  Clock,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Phone,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/contact-us", label: "Contacto" },
];

const BrandMark = ({ className = "" }: { className?: string }) => (
  <span
    className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-tonel text-cream shadow-soft ${className}`}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M8 3c-1.4 2.8-2 5.8-2 9s.6 6.2 2 9h8c1.4-2.8 2-5.8 2-9s-.6-6.2-2-9H8Z" />
      <path d="M6.4 8h11.2M6.4 16h11.2M12 3v18" />
    </svg>
  </span>
);

const useCartCount = () => {
  const totalItems = useCartStore((state) => state.totalItems);
  const hydrated = useCartHydrated();

  return hydrated ? totalItems : 0;
};

const CartLink = ({ onClick }: { onClick?: () => void }) => {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      onClick={onClick}
      className="relative inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-terracotta-deep"
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">Carrito</span>
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-espresso">
        {count}
      </span>
    </Link>
  );
};

const SiteHeader = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.isAdmin;
  const initial = session?.user?.email?.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-tonel text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-1.5 text-center text-[10px] font-medium tracking-wide sm:justify-between sm:px-6 sm:text-[11px] lg:px-8">
          <p className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Pedidos en línea muy pronto · Visítanos en el local
          </p>
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 text-cream/80 transition hover:text-cream sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {site.phone}
          </a>
        </div>
      </div>

      <div className="border-b border-sand/80 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Los Toneles, inicio"
          >
            <BrandMark className="transition group-hover:-rotate-6" />
            <span className="leading-none">
              <span className="block font-display text-xl font-semibold tracking-tight text-tonel sm:text-2xl">
                Los Toneles
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-espresso/50">
                {site.tagline}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "text-tonel"
                    : "text-espresso/65 hover:text-tonel"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-terracotta transition-transform ${
                    isActive(link.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {session ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 rounded-full border border-tonel/20 px-3 py-2 text-sm font-semibold text-tonel transition hover:bg-sand"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-tonel text-sm font-bold text-cream"
                  title={session.user?.email ?? undefined}
                >
                  {initial}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-full p-2 text-espresso/60 transition hover:bg-sand hover:text-tonel"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-tonel transition hover:bg-sand"
              >
                <User className="h-4 w-4" />
                Iniciar sesión
              </Link>
            )}
            <CartLink />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full p-2.5 text-tonel transition hover:bg-sand"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <CartLink />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-espresso/45 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar menú"
          tabIndex={open ? 0 : -1}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-lift transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div className="flex items-center justify-between border-b border-sand px-5 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <BrandMark />
              <span className="font-display text-xl font-semibold text-tonel">
                Los Toneles
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-tonel transition hover:bg-sand"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <nav className="flex flex-col gap-1" aria-label="Principal móvil">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-lg font-semibold transition ${
                    isActive(link.href)
                      ? "bg-tonel text-cream"
                      : "text-espresso hover:bg-sand"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="mt-8 px-4 text-[11px] font-bold uppercase tracking-[0.22em] text-espresso/45">
              Categorías
            </p>
            <div className="mt-2 flex flex-col">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/menu/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-tonel transition hover:bg-sand"
                >
                  <span>{category.title}</span>
                  <ChevronRight className="h-4 w-4 text-espresso/40" />
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-sand/70 p-5">
              <p className="font-display text-lg font-semibold text-tonel">
                Visítanos
              </p>
              <div className="mt-3 space-y-3 text-sm text-espresso/75">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  {site.address}
                </p>
                <p className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  {site.hours}
                </p>
                <a
                  href={site.phoneHref}
                  className="flex items-start gap-2.5 font-semibold text-tonel"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  {site.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-sand p-5">
            {session ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tonel text-sm font-bold text-cream">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-tonel">
                      {session.user?.name ?? "Tu cuenta"}
                    </p>
                    <p className="truncate text-xs text-espresso/55">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-2 rounded-full border border-tonel/20 px-3 py-2 text-xs font-semibold text-tonel"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-tonel px-4 py-3 text-sm font-semibold text-cream"
              >
                <User className="h-4 w-4" />
                Iniciar sesión
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/products"
                onClick={() => setOpen(false)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-tonel/20 px-4 py-3 text-sm font-semibold text-tonel"
              >
                <LayoutDashboard className="h-4 w-4" />
                Administración
              </Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
};

export default SiteHeader;
