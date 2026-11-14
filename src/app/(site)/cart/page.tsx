"use client";

import { useCartHydrated } from "@/utils/useCartHydrated";
import { useCartStore } from "@/utils/store";
import {
  ArrowRight,
  Banknote,
  MessageSquareHeart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const CartPage = () => {
  const products = useCartStore((state) => state.products);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const plusOne = useCartStore((state) => state.plusOne);
  const minusOne = useCartStore((state) => state.minusOne);
  const clearCart = useCartStore((state) => state.clearCart);
  const mounted = useCartHydrated();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
            <span className="h-px w-10 bg-terracotta/60" />
            Tu pedido
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Carrito
          </h1>
          <p className="mt-2 text-sm text-espresso/60">
            {mounted && totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? "artículo" : "artículos"} listos para ordenar`
              : "Revisa tus platillos antes de continuar."}
          </p>
        </div>

        {mounted && products.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-tonel/15 px-4 py-2 text-xs font-bold text-tonel transition hover:border-terracotta/40 hover:text-terracotta"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Vaciar carrito
          </button>
        )}
      </div>

      {!mounted ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-3xl border border-sand bg-white/50"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-3xl border border-sand bg-white/50" />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center sm:py-16">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sand text-tonel">
            <ShoppingBag className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold text-tonel">
            Tu carrito está vacío
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-espresso/60">
            Explora el menú y agrega tus platillos favoritos. Estamos seguros de
            que algo te va a antojar.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep"
          >
            Explorar el menú
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {products.map((item) => {
              const key = `${item.id}${item.optionTitle ? `-${item.optionTitle}` : ""}`;
              return (
                <article
                  key={key}
                  className="flex flex-col gap-4 rounded-3xl border border-sand bg-white/70 p-4 shadow-soft sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sand/60">
                      {item.img ? (
                        <Image
                          src={item.img}
                          alt={item.title}
                          width={96}
                          height={96}
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-tonel/40" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-semibold text-tonel">
                        {item.title}
                      </h2>
                      {item.optionTitle && (
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-espresso/45">
                          {item.optionTitle}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-espresso/60">
                        {formatMoney(item.price)} c/u
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center rounded-2xl border border-sand bg-cream/60 p-1">
                      <button
                        type="button"
                        onClick={() => minusOne(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-tonel transition hover:bg-sand"
                        aria-label={`Quitar una unidad de ${item.title}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-tonel">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => plusOne(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-tonel transition hover:bg-sand"
                        aria-label={`Agregar una unidad de ${item.title}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="w-24 text-right">
                      <p className="text-base font-bold text-tonel">
                        {formatMoney(item.subtotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-espresso/40 transition hover:bg-terracotta/10 hover:text-terracotta"
                      aria-label={`Eliminar ${item.title} del carrito`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-sand bg-white/70 p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-semibold text-tonel">
              Resumen
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-espresso/65">
                <span>Subtotal ({totalItems} artículos)</span>
                <span className="font-semibold text-tonel">
                  {formatMoney(totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-espresso/65">
                <span>Servicio</span>
                <span className="font-semibold text-olive">Incluido</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between border-t border-sand pt-5">
              <span className="text-sm font-bold uppercase tracking-wide text-espresso/60">
                Total
              </span>
              <span className="font-display text-3xl font-semibold text-tonel">
                {formatMoney(totalPrice)}
              </span>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-olive/10 p-4 text-olive">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                Aceptamos únicamente efectivo. Pagas al recoger tu pedido en el
                local.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-tonel/40 px-6 py-4 text-sm font-bold text-cream"
            >
              Pedidos en línea muy pronto
            </button>

            <Link
              href="/feedback"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-tonel/20 px-6 py-3 text-sm font-bold text-tonel transition hover:bg-sand"
            >
              <MessageSquareHeart className="h-4 w-4" />
              Dinos qué piensas
            </Link>

            <Link
              href="/menu"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-tonel transition hover:text-terracotta"
            >
              Seguir explorando el menú
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;
