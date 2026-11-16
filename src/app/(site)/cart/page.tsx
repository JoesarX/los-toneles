"use client";

import {
  BUSINESS_HOURS_LABEL,
  BUSINESS_TIME_ZONE,
  CLOSED_ORDER_MESSAGE,
  isWithinBusinessHours,
  nextBusinessOpening,
  SCHEDULE_OUTSIDE_HOURS_MESSAGE,
} from "@/lib/business-hours";
import { useCartHydrated } from "@/utils/useCartHydrated";
import { useCartStore } from "@/utils/store";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  Loader2,
  MessageSquareHeart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const toDateTimeInput = (date: Date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 16);
};

const CartPage = () => {
  const products = useCartStore((state) => state.products);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const plusOne = useCartStore((state) => state.plusOne);
  const minusOne = useCartStore((state) => state.minusOne);
  const clearCart = useCartStore((state) => state.clearCart);
  const mounted = useCartHydrated();
  const { status: authStatus } = useSession();
  const router = useRouter();
  const initialBusinessCheck = useRef(false);
  const [business, setBusiness] = useState<{
    isOpen: boolean;
    nextOpening: Date;
  } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"asap" | "later">("asap");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const updateBusinessState = () => {
      const now = new Date();
      const isOpen = isWithinBusinessHours(now);
      setBusiness({ isOpen, nextOpening: nextBusinessOpening(now) });

      if (!isOpen) {
        setScheduleMode("later");
        setScheduledFor(
          (current) =>
            current || toDateTimeInput(nextBusinessOpening(now))
        );
      } else if (!initialBusinessCheck.current) {
        setScheduleMode("asap");
      }

      initialBusinessCheck.current = true;
    };

    const initial = window.setTimeout(updateBusinessState, 0);
    const interval = window.setInterval(updateBusinessState, 60000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  const handleCheckout = async () => {
    if (authStatus !== "authenticated") {
      toast.info("Inicia sesión para confirmar tu pedido.");
      router.push("/login");
      return;
    }

    const name = customerName.trim();
    if (name.length < 2) {
      toast.error("Escribe tu nombre para identificar el pedido.");
      return;
    }

    if (business && !business.isOpen && scheduleMode !== "later") {
      toast.info(CLOSED_ORDER_MESSAGE);
      setScheduleMode("later");
      return;
    }

    let scheduledIso: string | undefined;
    if (scheduleMode === "later") {
      const date = new Date(scheduledFor);
      if (!scheduledFor || !Number.isFinite(date.getTime())) {
        toast.error("Selecciona una hora para tu pedido.");
        return;
      }
      if (date.getTime() <= Date.now()) {
        toast.error("La hora programada debe ser en el futuro.");
        return;
      }
      if (!isWithinBusinessHours(date)) {
        toast.error(SCHEDULE_OUTSIDE_HOURS_MESSAGE);
        return;
      }
      scheduledIso = date.toISOString();
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: totalPrice,
          products,
          customerName: name,
          ...(scheduledIso ? { scheduledFor: scheduledIso } : {}),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "No se pudo crear el pedido.");
      }

      clearCart();
      toast.success("Pedido enviado. Te esperamos.");
      router.push("/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el pedido."
      );
    } finally {
      setSubmitting(false);
    }
  };

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

            <div className="mt-5 space-y-3">
              {business && !business.isOpen && (
                <div className="rounded-2xl border border-amber/45 bg-amber/10 p-3.5">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-espresso">
                    <CalendarClock className="h-4 w-4 text-terracotta" />
                    Estamos cerrados
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-espresso/65">
                    Solo puedes dejar tu pedido programado. Atendemos{" "}
                    {BUSINESS_HOURS_LABEL}.
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-tonel">
                    Próxima opción:{" "}
                    {business.nextOpening.toLocaleString("es-HN", {
                      timeZone: BUSINESS_TIME_ZONE,
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              <label className="block">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/45">
                  <UserRound className="h-3.5 w-3.5" />
                  Nombre para el pedido
                </span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Ej. María López"
                  className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm text-espresso outline-none transition placeholder:text-espresso/30 focus:border-terracotta"
                />
              </label>

              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/45">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Hora de recogida
                </span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("asap")}
                    disabled={business?.isOpen === false}
                    title={
                      business?.isOpen === false
                        ? "Solo pedidos programados fuera de horario"
                        : undefined
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      scheduleMode === "asap" && business?.isOpen !== false
                        ? "border-tonel bg-tonel text-cream"
                        : "border-sand bg-white text-tonel hover:bg-sand/60"
                    } disabled:cursor-not-allowed disabled:border-sand disabled:bg-sand/40 disabled:text-espresso/35 disabled:hover:bg-sand/40`}
                  >
                    Lo antes posible
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("later")}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      scheduleMode === "later"
                        ? "border-tonel bg-tonel text-cream"
                        : "border-sand bg-white text-tonel hover:bg-sand/60"
                    }`}
                  >
                    Programar
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-espresso/45">
                  Horario: {BUSINESS_HOURS_LABEL}.
                </p>
                {scheduleMode === "later" && (
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-xs font-semibold text-tonel outline-none focus:border-terracotta"
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              {submitting ? "Enviando pedido..." : "Confirmar pedido"}
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
