"use client";

import {
  OPEN_STATUSES,
  ORDER_STATUSES,
  orderStatusMeta,
  type OrderStatus,
} from "@/lib/orders";
import type { OrderType } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Check,
  Clock,
  Globe,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Store,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const columns: {
  status: OrderStatus;
  accent: string;
  dot: string;
}[] = [
  {
    status: "pending",
    accent: "border-t-terracotta",
    dot: "bg-terracotta",
  },
  { status: "ready", accent: "border-t-amber", dot: "bg-amber" },
  { status: "paid", accent: "border-t-olive", dot: "bg-olive" },
  {
    status: "cancelled",
    accent: "border-t-espresso/30",
    dot: "bg-espresso/30",
  },
];

const isToday = (value: Date | string) => {
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const timeLabel = (value: Date | string) =>
  new Date(value).toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const statusAction = (
  status: OrderStatus
): { next: OrderStatus; label: string } | null => {
  if (status === "pending") return { next: "ready", label: "Marcar listo" };
  if (status === "ready") return { next: "paid", label: "Cobrar" };
  if (status === "cancelled")
    return { next: "pending", label: "Reactivar" };
  if (status === "paid") return { next: "pending", label: "Reabrir" };
  return null;
};

const OrderCard = ({
  order,
  onChange,
  pendingStatus,
}: {
  order: OrderType;
  onChange: (status: OrderStatus) => void;
  pendingStatus?: OrderStatus;
}) => {
  const meta = orderStatusMeta[order.status as OrderStatus];
  const action = statusAction(order.status as OrderStatus);
  const items = order.products ?? [];
  const visibleItems = items.slice(0, 3);
  const isRegister = order.source === "register";
  const title =
    order.customerName ||
    (isRegister ? "Cliente en local" : order.userEmail) ||
    "Cliente";

  return (
    <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-tonel">{title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-espresso/45">
            <Clock className="h-3 w-3" />
            {timeLabel(order.createdAt)}
            <span aria-hidden="true">·</span>
            <span className="font-mono">
              #{order.id.slice(-5).toUpperCase()}
            </span>
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isRegister
              ? "bg-tonel/10 text-tonel"
              : "bg-terracotta/10 text-terracotta-deep"
          }`}
        >
          {isRegister ? (
            <Store className="h-3 w-3" />
          ) : (
            <Globe className="h-3 w-3" />
          )}
          {isRegister ? "Caja" : "En línea"}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-sand/70 pt-3">
        {visibleItems.length > 0 ? (
          visibleItems.map((item, index) => (
            <div
              key={`${order.id}-${item.id}-${index}`}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <span className="min-w-0 text-espresso/70">
                <span className="font-bold text-tonel">{item.quantity}×</span>{" "}
                {item.title}
                {item.optionTitle ? (
                  <span className="block pl-5 text-[10px] text-espresso/45">
                    {item.optionTitle}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold text-espresso/60">
                {formatMoney(item.subtotal)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-espresso/45">Sin artículos registrados.</p>
        )}
        {items.length > 3 && (
          <p className="text-[11px] font-semibold text-espresso/45">
            +{items.length - 3} más
          </p>
        )}
      </div>

      {order.notes && (
        <p className="mt-2 rounded-xl bg-amber/10 px-3 py-2 text-[11px] leading-relaxed text-espresso/60">
          {order.notes}
        </p>
      )}

      <div className="mt-3 flex items-end justify-between border-t border-sand/70 pt-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/40">
            Total
          </p>
          <p className="font-display text-xl font-semibold text-tonel">
            {formatMoney(order.price)}
          </p>
          {isRegister && order.changeGiven !== null && order.changeGiven !== undefined && (
            <p className="mt-0.5 text-[11px] text-espresso/45">
              Recibido {formatMoney(order.amountPaid ?? 0)} · Cambio{" "}
              {formatMoney(order.changeGiven)}
            </p>
          )}
        </div>
        {meta && (
          <span className="text-[10px] font-semibold text-espresso/35">
            {meta.label}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {action && (
          <button
            type="button"
            onClick={() => onChange(action.next)}
            disabled={pendingStatus === action.next}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-60 ${
              order.status === "ready"
                ? "bg-olive text-white hover:bg-olive/90"
                : order.status === "cancelled"
                  ? "border border-tonel/15 text-tonel hover:bg-sand"
                  : "bg-tonel text-cream hover:bg-tonel-deep"
            }`}
          >
            {pendingStatus === action.next ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : order.status === "ready" ? (
              <Banknote className="h-3.5 w-3.5" />
            ) : order.status === "cancelled" ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {action.label}
          </button>
        )}

        {order.status !== "cancelled" ? (
          <button
            type="button"
            onClick={() => onChange("cancelled")}
            disabled={pendingStatus === "cancelled"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-terracotta/20 text-terracotta transition hover:bg-terracotta/10 disabled:opacity-60"
            aria-label="Cancelar pedido"
            title="Cancelar pedido"
          >
            {pendingStatus === "cancelled" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange("pending")}
            disabled={pendingStatus === "pending"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-tonel/15 text-tonel transition hover:bg-sand disabled:opacity-60"
            aria-label="Reactivar pedido"
            title="Reactivar pedido"
          >
            {pendingStatus === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </article>
  );
};

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | undefined>();
  const [pendingOrderId, setPendingOrderId] = useState<string | undefined>();

  const { data: orders = [], isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    useQuery<OrderType[]>({
      queryKey: ["admin-orders"],
      queryFn: async () => {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudieron cargar las órdenes.");
        return response.json();
      },
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar la orden.");
      return response.json();
    },
    onMutate: ({ id, status }) => {
      setPendingOrderId(id);
      setPendingStatus(status);
    },
    onSuccess: () => {
      toast.success("Orden actualizada.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setPendingOrderId(undefined);
      setPendingStatus(undefined);
    },
  });

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = order.status as OrderStatus;
      const inWindow =
        showHistory || isToday(order.createdAt) || OPEN_STATUSES.includes(status);
      if (!inWindow) return false;
      if (!term) return true;
      const haystack = [
        order.customerName,
        order.userEmail,
        order.id,
        order.notes,
        ...(order.products ?? []).map((item) => item.title),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, search, showHistory]);

  const todayOrders = orders.filter((order) => isToday(order.createdAt));
  const paidToday = todayOrders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + Number(order.price), 0);
  const openCount = orders.filter((order) =>
    OPEN_STATUSES.includes(order.status as OrderStatus)
  ).length;
  const readyCount = orders.filter((order) => order.status === "ready").length;
  const cancelledToday = todayOrders.filter(
    (order) => order.status === "cancelled"
  ).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
            <span className="h-px w-8 bg-terracotta/60" />
            Sala de órdenes
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Órdenes
          </h1>
          <p className="mt-1 text-sm text-espresso/55">
            Pedidos en línea y de caja en un solo lugar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-tonel/15 bg-white/70 px-4 py-2.5 text-xs font-bold text-tonel transition hover:bg-sand"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-tonel/15 bg-white/70 px-4 py-2.5 text-xs font-bold text-tonel">
            <input
              type="checkbox"
              checked={showHistory}
              onChange={(event) => setShowHistory(event.target.checked)}
              className="h-3.5 w-3.5 accent-terracotta"
            />
            Histórico
          </label>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Abiertas",
            value: openCount,
            hint: `${readyCount} listas`,
            className: "text-tonel",
          },
          {
            label: "Cobrado hoy",
            value: formatMoney(paidToday),
            hint: "solo órdenes pagadas",
            className: "text-olive",
          },
          {
            label: "Pendientes hoy",
            value: todayOrders.filter((o) => o.status === "pending").length,
            hint: "por preparar",
            className: "text-terracotta",
          },
          {
            label: "Canceladas hoy",
            value: cancelledToday,
            hint: "fuera de métricas",
            className: "text-espresso/60",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-sand bg-white/70 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/40">
              {stat.label}
            </p>
            <p className={`mt-1 font-display text-2xl font-semibold ${stat.className}`}>
              {stat.value}
            </p>
            <p className="text-[11px] text-espresso/40">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-sand bg-white/70 px-4 py-2.5">
        <Search className="h-4 w-4 text-espresso/35" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por cliente, correo, número o platillo..."
          className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/35"
        />
        {dataUpdatedAt > 0 && (
          <span className="hidden shrink-0 text-[10px] font-semibold text-espresso/35 sm:block">
            {new Date(dataUpdatedAt).toLocaleTimeString("es-HN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {isError ? (
        <div className="mt-8 rounded-2xl border border-terracotta/20 bg-terracotta/5 px-6 py-10 text-center">
          <p className="font-display text-2xl font-semibold text-terracotta-deep">
            No pudimos cargar las órdenes
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-tonel px-5 py-2.5 text-sm font-bold text-cream"
          >
            Reintentar
          </button>
        </div>
      ) : isLoading ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {ORDER_STATUSES.map((status) => (
            <div
              key={status}
              className="h-52 animate-pulse rounded-2xl border border-sand bg-white/50"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnOrders = visibleOrders.filter(
              (order) => order.status === column.status
            );
            const meta = orderStatusMeta[column.status];

            return (
              <section
                key={column.status}
                className={`rounded-2xl border border-sand border-t-4 bg-sand/30 p-3 ${column.accent}`}
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                    <h2 className="text-sm font-bold text-tonel">{meta.label}</h2>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-espresso/50">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
                  {columnOrders.length > 0 ? (
                    columnOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onChange={(status) =>
                          updateStatus.mutate({ id: order.id, status })
                        }
                        pendingStatus={
                          pendingOrderId === order.id
                            ? pendingStatus
                            : undefined
                        }
                      />
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-sand-deep/60 px-3 py-8 text-center text-xs text-espresso/40">
                      Sin órdenes
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
