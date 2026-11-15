"use client";

import { categories } from "@/data/categories";
import type { CartItemType, OrderType, ProductType } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Globe,
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
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const orderTime = (value: Date | string) =>
  new Date(value).toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const IncomingOrderToast = ({ order }: { order: OrderType }) => {
  const itemCount = (order.products ?? []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <div className="min-w-0">
      <p className="font-display text-base font-semibold leading-tight text-tonel">
        Nuevo pedido en línea
      </p>
      <p className="mt-1 text-xs text-espresso/60">
        {order.customerName || order.userEmail || "Cliente"} ·{" "}
        {formatMoney(order.price)}
      </p>
      <p className="mt-0.5 text-[11px] text-espresso/45">
        {itemCount} {itemCount === 1 ? "artículo" : "artículos"} ·{" "}
        {orderTime(order.createdAt)}
      </p>
      <Link
        href="/admin/orders"
        className="mt-2 inline-flex items-center gap-1 rounded-full bg-tonel px-3 py-1.5 text-[11px] font-bold text-cream transition hover:bg-tonel-deep"
      >
        Ver en órdenes
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

const productPrice = (product: ProductType) => {
  const value =
    product.options && product.options.length > 0
      ? Math.min(...product.options.map((option) => Number(option.additionalPrice)))
      : Number(product.price);

  return Number.isFinite(value) ? value : 0;
};

const lineKey = (item: CartItemType) =>
  item.optionTitle ? `${item.id}-${item.optionTitle}` : item.id;

const categoryOrder = new Map(
  categories.map((category, index) => [category.dbName, index])
);

const HONDURAS_BILLS = [1, 5, 10, 20, 50, 100, 500];

const AdminRegisterPage = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [optionProduct, setOptionProduct] = useState<ProductType | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [billCounts, setBillCounts] = useState<Record<number, number>>({});
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

  const {
    data: onlineOrders,
    isSuccess: onlineOrdersLoaded,
    isError: onlineOrdersError,
    refetch: refetchOnlineOrders,
  } = useQuery<OrderType[]>({
    queryKey: ["register-online-orders"],
    queryFn: async () => {
      const response = await fetch(
        "/api/orders?source=online&open=true&limit=20",
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error("No se pudieron cargar los pedidos en línea.");
      }
      return response.json();
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const seenOnlineOrders = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!onlineOrdersLoaded || !onlineOrders) return;

    const currentIds = new Set(onlineOrders.map((order) => order.id));

    if (seenOnlineOrders.current === null) {
      seenOnlineOrders.current = currentIds;
      return;
    }

    const newOrders = onlineOrders.filter(
      (order) => !seenOnlineOrders.current?.has(order.id)
    );

    newOrders.forEach((order) => {
      toast.info(<IncomingOrderToast order={order} />, {
        toastId: `online-order-${order.id}`,
        autoClose: 9000,
      });
    });

    seenOnlineOrders.current = new Set([
      ...seenOnlineOrders.current,
      ...currentIds,
    ]);
  }, [onlineOrders, onlineOrdersLoaded]);

  const openOnlineOrders = onlineOrders ?? [];
  const pendingOnlineOrders = openOnlineOrders.filter(
    (order) => order.status === "pending"
  );
  const readyOnlineOrders = openOnlineOrders.filter(
    (order) => order.status === "ready"
  );

  const total = cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const cartItemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  const cashValue = cashGiven.trim() === "" ? 0 : Number(cashGiven);
  const cashValid = cashGiven.trim() !== "" && cashValue >= total;
  const change = cashValid ? cashValue - total : 0;

  const addBill = (bill: number) => {
    setBillCounts((current) => ({
      ...current,
      [bill]: (current[bill] ?? 0) + 1,
    }));
    setCashGiven((current) => {
      const value = current.trim() === "" ? 0 : Number(current);
      const safeValue = Number.isFinite(value) ? value : 0;
      return String(
        Math.max(0, Math.round((safeValue + bill) * 100) / 100)
      );
    });
  };

  const removeBill = (bill: number) => {
    setBillCounts((current) => {
      const count = current[bill] ?? 0;
      if (count <= 0) return current;

      const next = { ...current };
      if (count === 1) {
        delete next[bill];
      } else {
        next[bill] = count - 1;
      }
      return next;
    });
    setCashGiven((current) => {
      const value = current.trim() === "" ? 0 : Number(current);
      const safeValue = Number.isFinite(value) ? value : 0;
      return String(
        Math.max(0, Math.round((safeValue - bill) * 100) / 100)
      );
    });
  };

  const clearCash = () => {
    setBillCounts({});
    setCashGiven("");
  };

  const setExactCash = () => {
    setBillCounts({});
    setCashGiven(total > 0 ? String(total) : "");
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((product) => {
        const matchesCategory =
          activeCategory === "Todo" || product.catSlug === activeCategory;
        const matchesSearch =
          !term ||
          product.title.toLowerCase().includes(term) ||
          product.desc.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const categoryDifference =
          (categoryOrder.get(a.catSlug) ?? 99) -
          (categoryOrder.get(b.catSlug) ?? 99);

        if (categoryDifference !== 0) return categoryDifference;

        return a.title.localeCompare(b.title, "es");
      });
  }, [products, search, activeCategory]);

  const addItem = (
    product: ProductType,
    option?: { title: string; additionalPrice: number }
  ) => {
    const price = Number(
      option ? option.additionalPrice : product.price
    );
    const safePrice = Number.isFinite(price) ? price : 0;
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
                subtotal: Number(item.subtotal || 0) + safePrice,
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
          price: safePrice,
          subtotal: safePrice,
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
            subtotal: Number(line.price) * quantity,
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
    setBillCounts({});
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
      setBillCounts({});
      toast.success("Venta registrada.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="md:-mx-6 md:-my-6 md:flex md:h-[100dvh] md:flex-col md:overflow-hidden md:px-4 md:py-3 lg:-mx-8 lg:px-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tonel text-amber">
            <Store className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-tight text-tonel">
              Registradora
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/40">
              Los Toneles · Caja
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-olive/20 bg-olive/10 px-3 py-1.5 text-[10px] font-semibold text-olive sm:inline-flex">
            <Banknote className="h-3.5 w-3.5" />
            Solo efectivo
          </span>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-full bg-tonel px-3 py-2 text-[11px] font-bold text-cream transition hover:bg-tonel-deep"
          >
            Salir
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <section className="mt-3 flex shrink-0 items-center gap-3 rounded-2xl border border-sand bg-white/75 p-2.5 shadow-sm">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              pendingOnlineOrders.length > 0
                ? "bg-terracotta/10 text-terracotta"
                : "bg-olive/10 text-olive"
            }`}
          >
            <Globe className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/40">
              Pedidos en línea
            </p>
            <p className="truncate text-xs font-bold text-tonel">
              {pendingOnlineOrders.length} por preparar ·{" "}
              {readyOnlineOrders.length} listos
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {onlineOrdersError ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-terracotta/20 bg-terracotta/5 px-2.5 py-1.5">
              <p className="truncate text-[10px] font-semibold text-terracotta-deep">
                No pudimos consultar los pedidos en línea.
              </p>
              <button
                type="button"
                onClick={() => refetchOnlineOrders()}
                className="shrink-0 rounded-full bg-tonel px-2.5 py-1 text-[9px] font-bold text-cream"
              >
                Reintentar
              </button>
            </div>
          ) : !onlineOrdersLoaded ? (
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 w-40 shrink-0 animate-pulse rounded-lg bg-sand/60"
                />
              ))}
            </div>
          ) : openOnlineOrders.length === 0 ? (
            <p className="truncate rounded-lg border border-dashed border-sand-deep px-2.5 py-2 text-[10px] text-espresso/45">
              Sin pedidos abiertos. Los nuevos aparecerán aquí y como
              notificación.
            </p>
          ) : (
            <div className="no-scrollbar flex gap-2 overflow-x-auto overscroll-contain">
              {openOnlineOrders.map((order) => {
                const itemCount = (order.products ?? []).reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
                  0
                );
                const isReady = order.status === "ready";

                return (
                  <div
                    key={order.id}
                    className={`w-40 shrink-0 rounded-lg border px-2 py-1.5 ${
                      isReady
                        ? "border-amber/35 bg-amber/5"
                        : "border-sand bg-cream/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate text-[10px] font-bold text-tonel">
                        {order.customerName ||
                          order.userEmail ||
                          "Cliente en línea"}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                          isReady
                            ? "bg-amber/15 text-espresso/65"
                            : "bg-terracotta/10 text-terracotta-deep"
                        }`}
                      >
                        {isReady ? "Listo" : "Pend."}
                      </span>
                    </div>
                    <p className="truncate text-[9px] text-espresso/50">
                      #{order.id.slice(-5).toUpperCase()} ·{" "}
                      {orderTime(order.createdAt)} · {formatMoney(order.price)} ·{" "}
                      {itemCount} art.
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-tonel/15 bg-white px-2.5 py-1.5 text-[10px] font-bold text-tonel transition hover:bg-sand"
        >
          Sala
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </section>

      <div className="mt-3 grid min-h-0 flex-1 items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-0 flex-col rounded-2xl border border-sand bg-white/70 p-3">
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-sand bg-cream/70 px-3 py-2">
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
              placeholder="Buscar producto y presionar Enter..."
              autoFocus
              className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/35"
            />
          </div>

          <div className="no-scrollbar mt-2 flex shrink-0 gap-1.5 overflow-x-auto pb-0.5">
            {["Todo", ...categories.map((category) => category.dbName)].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
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

          <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {isError ? (
              <div className="rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-6 text-center">
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
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[74px] animate-pulse rounded-xl bg-sand/60"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-sand-deep px-4 py-6 text-center text-sm text-espresso/45">
                No encontramos productos con esa búsqueda.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="group flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-sand bg-white p-2 text-left transition hover:border-terracotta/40 hover:shadow-md"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-sand/60 to-cream">
                      {product.img ? (
                        <Image
                          src={product.img}
                          alt={product.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5 transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] font-semibold text-espresso/35">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-[11px] font-bold leading-tight text-tonel">
                        {product.title}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-bold text-terracotta">
                          {formatMoney(productPrice(product))}
                        </p>
                        {product.options && product.options.length > 0 ? (
                          <span className="shrink-0 rounded-full bg-sand px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-espresso/45">
                            Opc.
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                            <Plus className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col rounded-2xl border border-sand bg-white/80 p-3 shadow-sm">
          <div className="flex shrink-0 items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold leading-tight text-tonel">
                Venta actual
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-espresso/40">
                {cartItemCount} {cartItemCount === 1 ? "artículo" : "artículos"}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[10px] font-bold text-terracotta transition hover:text-terracotta-deep"
              >
                Vaciar
              </button>
            )}
          </div>

          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {cart.length === 0 ? (
              lastOrder ? (
                <div className="rounded-xl border border-olive/25 bg-olive/10 p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-olive text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-tonel">
                        Cobrado {formatMoney(lastOrder.price)}
                      </p>
                      <p className="truncate text-[10px] text-espresso/60">
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
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-tonel px-3 py-2 text-[11px] font-bold text-cream transition hover:bg-tonel-deep"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Nueva venta
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-sand-deep px-4 py-6 text-center">
                  <ShoppingBag className="mx-auto h-5 w-5 text-espresso/25" />
                  <p className="mt-2 text-[11px] text-espresso/45">
                    Agrega productos para comenzar.
                  </p>
                </div>
              )
            ) : (
              cart.map((item) => (
                <div key={lineKey(item)} className="flex items-start gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand/60">
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
                    <p className="text-[11px] font-semibold text-espresso/50">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-sand/70 text-tonel transition hover:bg-sand"
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
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-sand/70 text-tonel transition hover:bg-sand"
                      aria-label="Agregar uno"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-espresso/35 transition hover:bg-terracotta/10 hover:text-terracotta"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 shrink-0 border-t border-sand pt-2">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/45">
                  Total
                </p>
                <p className="font-display text-2xl font-semibold leading-tight text-tonel">
                  {formatMoney(total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/45">
                  Cambio
                </p>
                <p
                  className={`font-display text-lg font-semibold leading-tight ${
                    cashValid ? "text-olive" : "text-espresso/35"
                  }`}
                >
                  {formatMoney(cashValid ? change : 0)}
                </p>
              </div>
            </div>
            {cashGiven.trim() !== "" && !cashValid && total > 0 && (
              <p className="text-[10px] font-semibold text-terracotta">
                Falta {formatMoney(total - cashValue)} para cubrir el total.
              </p>
            )}
          </div>

          <div className="mt-2 grid shrink-0 grid-cols-2 gap-1.5">
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Cliente"
              aria-label="Nombre del cliente"
              className="min-w-0 rounded-lg border border-sand bg-cream/60 px-2.5 py-2 text-xs text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta"
            />
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Nota"
              aria-label="Nota de la venta"
              className="min-w-0 rounded-lg border border-sand bg-cream/60 px-2.5 py-2 text-xs text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta"
            />
          </div>

          <div className="mt-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="cash-given"
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/45"
              >
                Efectivo recibido
              </label>
              {cashGiven.trim() !== "" && (
                <button
                  type="button"
                  onClick={clearCash}
                  className="text-[9px] font-bold text-terracotta transition hover:text-terracotta-deep"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-sand bg-white px-2.5 py-2 focus-within:border-terracotta">
              <span className="text-xs font-bold text-espresso/40">L.</span>
              <input
                id="cash-given"
                type="text"
                inputMode="decimal"
                value={cashGiven}
                onChange={(event) => {
                  setBillCounts({});
                  setCashGiven(event.target.value.replace(/[^0-9.]/g, ""));
                }}
                placeholder="0.00"
                className="w-full bg-transparent text-base font-bold text-tonel outline-none placeholder:text-espresso/25"
              />
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {HONDURAS_BILLS.map((bill) => {
                const count = billCounts[bill] ?? 0;

                return (
                  <div
                    key={bill}
                    className={`flex h-8 overflow-hidden rounded-md border transition ${
                      count > 0
                        ? "border-terracotta/40 bg-terracotta/10"
                        : "border-tonel/15 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => addBill(bill)}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-0.5 whitespace-nowrap px-1 text-[10px] font-bold transition hover:bg-sand/70 ${
                        count > 0 ? "text-terracotta-deep" : "text-tonel"
                      }`}
                      aria-label={`Sumar billete de ${bill} lempiras`}
                    >
                      <span>L.{bill}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-terracotta px-1 text-[8px] text-white">
                          ×{count}
                        </span>
                      )}
                    </button>
                    {count > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBill(bill)}
                        className="w-4 shrink-0 border-l border-terracotta/20 text-[11px] font-bold text-terracotta transition hover:bg-terracotta/15"
                        aria-label={`Quitar billete de ${bill} lempiras`}
                      >
                        −
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={setExactCash}
                disabled={total <= 0}
                className="flex h-8 items-center justify-center rounded-md border border-olive/25 bg-olive/10 text-[10px] font-bold text-olive transition hover:bg-olive/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Exacto
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => submitOrder.mutate()}
            disabled={
              cart.length === 0 || !cashValid || submitOrder.isPending
            }
            className="mt-2 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-terracotta px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-50"
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
          <p className="mt-1 hidden text-center text-[10px] text-espresso/35 xl:block">
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
