"use client";

import { categories } from "@/data/categories";
import type { CartItemType, OrderType, ProductType } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const productPrice = (product: ProductType) =>
  product.options && product.options.length > 0
    ? Math.min(...product.options.map((option) => option.additionalPrice))
    : product.price;

const lineKey = (item: CartItemType) =>
  item.optionTitle ? `${item.id}-${item.optionTitle}` : item.id;

const AdminRegisterPage = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [optionProduct, setOptionProduct] = useState<ProductType | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [lastOrder, setLastOrder] = useState<OrderType | null>(null);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ProductType[]>({
    queryKey: ["register-products"],
    queryFn: async () => {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar los productos.");
      return response.json();
    },
  });

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cashValue = cashGiven.trim() === "" ? 0 : Number(cashGiven);
  const cashValid = cashGiven.trim() !== "" && cashValue >= total;
  const change = cashValid ? cashValue - total : 0;

  const quickCash = useMemo(
    () =>
      Array.from(new Set([total, 50, 100, 200, 500, 1000]))
        .filter((value) => value >= total && value > 0)
        .sort((a, b) => a - b),
    [total]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todo" || product.catSlug === activeCategory;
      const matchesSearch =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.desc.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, activeCategory]);

  const addItem = (
    product: ProductType,
    option?: { title: string; additionalPrice: number }
  ) => {
    const price = option ? option.additionalPrice : product.price;
    const optionTitle = option?.title;
    const key = optionTitle ? `${product.id}-${optionTitle}` : product.id;

    setLastOrder(null);
    setCart((current) => {
      const existing = current.find((item) => lineKey(item) === key);
      if (existing) {
        return current.map((item) =>
          lineKey(item) === key
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: item.subtotal + price,
              }
            : item
        );
      }
      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          img: product.img,
          price,
          subtotal: price,
          quantity: 1,
          ...(optionTitle ? { optionTitle } : {}),
        },
      ];
    });
    setOptionProduct(null);
  };

  const addProduct = (product: ProductType) => {
    if (product.options && product.options.length > 0) {
      setOptionProduct(product);
      return;
    }
    addItem(product);
  };

  const changeQuantity = (item: CartItemType, delta: number) => {
    setCart((current) =>
      current.flatMap((line) => {
        if (lineKey(line) !== lineKey(item)) return [line];
        const quantity = line.quantity + delta;
        if (quantity <= 0) return [];
        return [
          {
            ...line,
            quantity,
            subtotal: line.price * quantity,
          },
        ];
      })
    );
  };

  const removeItem = (item: CartItemType) => {
    setCart((current) =>
      current.filter((line) => lineKey(line) !== lineKey(item))
    );
  };

  const resetSale = () => {
    setCart([]);
    setCustomerName("");
    setNotes("");
    setCashGiven("");
    setLastOrder(null);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const submitOrder = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: total,
          products: cart,
          status: "paid",
          source: "register",
          customerName,
          amountPaid: cashValue,
          changeGiven: change,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la venta.");
      }

      return (await response.json()) as OrderType;
    },
    onSuccess: (order) => {
      setLastOrder(order);
      setCart([]);
      setCustomerName("");
      setNotes("");
      setCashGiven("");
      toast.success("Venta registrada.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
            <span className="h-px w-8 bg-terracotta/60" />
            Caja
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Registradora
          </h1>
          <p className="mt-1 text-sm text-espresso/55">
            Registra una venta en efectivo en segundos.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-olive/20 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive">
          <Store className="h-4 w-4" />
          Solo efectivo
        </div>
      </div>

      {lastOrder && (
        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-olive/25 bg-olive/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-olive text-white">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-tonel">
                Cobrado {formatMoney(lastOrder.price)}
              </p>
              <p className="text-sm text-espresso/60">
                Cambio:{" "}
                <span className="font-bold text-olive">
                  {formatMoney(lastOrder.changeGiven ?? 0)}
                </span>
                {lastOrder.customerName
                  ? ` · ${lastOrder.customerName}`
                  : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetSale}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-tonel px-5 py-3 text-sm font-bold text-cream transition hover:bg-tonel-deep"
          >
            <RotateCcw className="h-4 w-4" />
            Nueva venta
          </button>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
        <section className="rounded-3xl border border-sand bg-white/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 rounded-2xl border border-sand bg-cream/70 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-espresso/35" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filteredProducts[0]) {
                  event.preventDefault();
                  addProduct(filteredProducts[0]);
                }
              }}
              placeholder="Buscar producto y presionar Enter para agregar..."
              autoFocus
              className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/35"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["Todo", ...categories.map((category) => category.dbName)].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeCategory === category
                      ? "bg-tonel text-cream"
                      : "border border-tonel/15 bg-white text-tonel hover:bg-sand"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          {isError ? (
            <div className="mt-4 rounded-2xl border border-terracotta/20 bg-terracotta/5 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-terracotta-deep">
                No se pudieron cargar los productos.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-tonel px-4 py-2 text-xs font-bold text-cream"
              >
                Reintentar
              </button>
            </div>
          ) : isLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl bg-sand/60"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-sand-deep px-4 py-10 text-center text-sm text-espresso/45">
              No encontramos productos con esa búsqueda.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white text-left transition hover:-translate-y-0.5 hover:border-terracotta/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full bg-gradient-to-br from-sand/60 to-cream">
                    {product.img ? (
                      <Image
                        src={product.img}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 180px"
                        className="object-contain p-3 transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-semibold text-espresso/35">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-tonel">
                      {product.title}
                    </p>
                    <div className="mt-auto pt-2">
                      <p className="text-sm font-bold text-terracotta">
                        {formatMoney(productPrice(product))}
                      </p>
                      {product.options && product.options.length > 0 && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-espresso/35">
                          Elegir opción
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-sand bg-white/80 p-5 shadow-sm lg:sticky lg:top-32">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-tonel">
              Venta actual
            </h2>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[11px] font-bold text-terracotta transition hover:text-terracotta-deep"
              >
                Vaciar
              </button>
            )}
          </div>

          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sand-deep px-4 py-8 text-center">
                <ShoppingBag className="mx-auto h-6 w-6 text-espresso/25" />
                <p className="mt-2 text-xs text-espresso/45">
                  Agrega productos para comenzar.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={lineKey(item)} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand/60">
                    {item.img ? (
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <ShoppingBag className="h-4 w-4 text-tonel/30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-tonel">
                      {item.title}
                    </p>
                    {item.optionTitle && (
                      <p className="truncate text-[10px] text-espresso/45">
                        {item.optionTitle}
                      </p>
                    )}
                    <p className="text-[11px] text-espresso/50">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand/70 text-tonel transition hover:bg-sand"
                      aria-label="Quitar uno"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-5 text-center text-xs font-bold text-tonel">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand/70 text-tonel transition hover:bg-sand"
                      aria-label="Agregar uno"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-espresso/35 transition hover:bg-terracotta/10 hover:text-terracotta"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-sand pt-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45">
              Total
            </span>
            <span className="font-display text-3xl font-semibold text-tonel">
              {formatMoney(total)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nombre del cliente (opcional)"
              className="w-full rounded-xl border border-sand bg-cream/60 px-3 py-2.5 text-sm text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta"
            />
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Nota (opcional)"
              className="w-full rounded-xl border border-sand bg-cream/60 px-3 py-2.5 text-sm text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="cash-given"
              className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45"
            >
              Efectivo recibido
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-sand bg-white px-3 py-2.5 focus-within:border-terracotta">
              <span className="text-sm font-bold text-espresso/40">L.</span>
              <input
                id="cash-given"
                type="text"
                inputMode="decimal"
                value={cashGiven}
                onChange={(event) =>
                  setCashGiven(event.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0.00"
                className="w-full bg-transparent text-lg font-bold text-tonel outline-none placeholder:text-espresso/25"
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {quickCash.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCashGiven(String(value))}
                  className="rounded-lg border border-tonel/15 py-2 text-xs font-bold text-tonel transition hover:bg-sand"
                >
                  {value === total ? "Exacto" : `L. ${value}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-sand/60 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-espresso/60">Cambio</span>
              <span
                className={`font-display text-2xl font-semibold ${
                  cashValid ? "text-olive" : "text-espresso/35"
                }`}
              >
                {formatMoney(cashValid ? change : 0)}
              </span>
            </div>
            {cashGiven.trim() !== "" && !cashValid && total > 0 && (
              <p className="mt-1 text-[11px] font-semibold text-terracotta">
                Falta {formatMoney(total - cashValue)} para cubrir el total.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => submitOrder.mutate()}
            disabled={
              cart.length === 0 || !cashValid || submitOrder.isPending
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta px-5 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4" />
                Cobrar y registrar
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-espresso/35">
            Enter agrega el primer producto de la búsqueda.
          </p>
        </aside>
      </div>

      {optionProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-cream p-5 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta">
                  Elegir opción
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-tonel">
                  {optionProduct.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOptionProduct(null)}
                className="rounded-full p-2 text-espresso/45 transition hover:bg-sand hover:text-tonel"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {optionProduct.options?.map((option) => (
                <button
                  key={option.title}
                  type="button"
                  onClick={() => addItem(optionProduct, option)}
                  className="flex w-full items-center justify-between rounded-2xl border border-sand bg-white px-4 py-3 text-left text-sm font-semibold text-tonel transition hover:border-terracotta/40 hover:bg-sand/40"
                >
                  <span>{option.title}</span>
                  <span className="text-terracotta">
                    {formatMoney(option.additionalPrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisterPage;
