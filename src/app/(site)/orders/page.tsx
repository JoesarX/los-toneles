"use client";

import type { OrderType } from "@/types/types";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Loader2,
  PackageOpen,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber/20 text-espresso" },
  preparing: {
    label: "En preparación",
    className: "bg-terracotta/15 text-terracotta-deep",
  },
  delivered: { label: "Entregado", className: "bg-olive/15 text-olive" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

const getStatus = (status: string) =>
  statusStyles[status.toLowerCase()] ?? {
    label: status,
    className: "bg-sand text-tonel",
  };

const OrdersPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    let active = true;

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("No pudimos cargar tus pedidos.");
        }
        const data: OrderType[] = await response.json();
        if (active) {
          setOrders(data);
        }
      } catch (fetchError) {
        if (active) {
          console.error(fetchError);
          setError("No pudimos cargar tus pedidos. Intenta de nuevo.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
            <span className="h-px w-10 bg-terracotta/60" />
            Mi cuenta
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Mis pedidos
          </h1>
          <p className="mt-2 text-sm text-espresso/60">
            Revisa el estado y el detalle de tus pedidos anteriores.
          </p>
        </div>
        {!loading && orders.length > 0 && (
          <p className="rounded-full border border-tonel/15 bg-white/60 px-4 py-2 text-sm font-semibold text-tonel">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-3xl border border-sand bg-white/50"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-sand-deep bg-white/40 px-6 py-16 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-terracotta" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-tonel">
            Algo salió mal
          </h2>
          <p className="mt-2 text-sm text-espresso/60">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-sand-deep bg-white/40 px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sand text-tonel">
            <PackageOpen className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold text-tonel">
            Aún no tienes pedidos
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-espresso/60">
            Muy pronto podrás ordenar en línea. Mientras tanto, visítanos y
            disfruta de tu platillo favorito en el local.
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
        <div className="mt-10 space-y-4">
          {orders.map((order) => {
            const status = getStatus(order.status);
            const products = order.products ?? [];

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-sand bg-white/70 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-sand/30 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-tonel">
                      <ReceiptText className="h-4 w-4 text-terracotta" />
                      Pedido #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-espresso/55">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString("es-HN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    {products.length > 0 ? (
                      products.map((item, index) => (
                        <div
                          key={`${order.id}-${item.id}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand/60">
                            {item.img ? (
                              <Image
                                src={item.img}
                                alt={item.title}
                                width={48}
                                height={48}
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-tonel/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-tonel">
                              {item.title}
                            </p>
                            <p className="text-xs text-espresso/55">
                              {item.quantity} × {formatMoney(item.price)}
                              {item.optionTitle ? ` · ${item.optionTitle}` : ""}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-tonel">
                            {formatMoney(item.subtotal)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-espresso/55">
                        Este pedido no tiene artículos registrados.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-4 border-t border-sand pt-4 md:min-w-48 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/45">
                        Total
                      </p>
                      <p className="mt-1 font-display text-3xl font-semibold text-tonel">
                        {formatMoney(order.price)}
                      </p>
                    </div>
                    <p className="inline-flex items-center gap-2 text-xs font-medium text-olive">
                      <Banknote className="h-4 w-4" />
                      Pago en efectivo
                    </p>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-sand bg-white/50 p-5 sm:flex-row">
            <p className="text-sm text-espresso/60">
              Los pedidos en línea estarán disponibles muy pronto.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm font-bold text-tonel transition hover:text-terracotta"
            >
              Ver el menú
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
