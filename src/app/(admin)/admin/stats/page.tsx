"use client";

import { orderStatusMeta, type OrderStatus } from "@/lib/orders";
import type {
  StatBreakdown,
  StatsRangeKey,
  StatsResponse,
} from "@/types/stats";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  Clock,
  Globe,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

const moneyFormatter = new Intl.NumberFormat("es-HN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-HN");

const formatMoney = (value: number) =>
  `L. ${moneyFormatter.format(Number(value) || 0)}`;

const formatNumber = (value: number) =>
  numberFormatter.format(Number(value) || 0);

const formatPercent = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const rangeOptions: { key: StatsRangeKey; label: string }[] = [
  { key: "day", label: "24 horas" },
  { key: "week", label: "7 días" },
  { key: "month", label: "30 días" },
  { key: "year", label: "1 año" },
  { key: "all", label: "Todo" },
  { key: "custom", label: "Personalizado" },
];

const statusClasses: Record<string, string> = {
  pending: "bg-terracotta/10 text-terracotta-deep",
  ready: "bg-amber/15 text-espresso/65",
  paid: "bg-olive/10 text-olive",
  cancelled: "bg-espresso/5 text-espresso/45",
};

const toneClasses: Record<string, string> = {
  tonel: "bg-tonel/10 text-tonel",
  terracotta: "bg-terracotta/10 text-terracotta",
  olive: "bg-olive/10 text-olive",
  amber: "bg-amber/15 text-espresso/65",
  espresso: "bg-espresso/5 text-espresso/55",
};

const ChangeBadge = ({ value }: { value: number | null }) => {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-espresso/35">
        Sin comparación
      </span>
    );
  }

  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
        positive ? "text-olive" : "text-terracotta"
      }`}
    >
      <Icon className="h-3 w-3" />
      {formatPercent(value)}
      <span className="font-semibold text-espresso/35">vs. anterior</span>
    </span>
  );
};

const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "tonel",
  change,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  change?: number | null;
}) => (
  <div className="rounded-3xl border border-sand bg-white/75 p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/40">
        {label}
      </p>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-3 font-display text-3xl font-semibold leading-none text-tonel">
      {value}
    </p>
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className="text-[11px] text-espresso/45">{hint}</p>
      {change !== undefined && <ChangeBadge value={change} />}
    </div>
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-3xl border border-sand bg-white/75 p-4 shadow-sm sm:p-5 ${className}`}
  >
    <div>
      <h2 className="font-display text-xl font-semibold text-tonel">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-espresso/45">{subtitle}</p>}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const EmptyBlock = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-2xl border border-dashed border-sand-deep px-4 py-8 text-center text-xs text-espresso/40">
    {children}
  </p>
);

const TimelineChart = ({ data }: { data: StatsResponse }) => {
  const max = Math.max(...data.timeline.map((point) => point.revenue), 1);
  const labelStep = Math.max(1, Math.ceil(data.timeline.length / 12));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-espresso/45">
          Ingresos por periodo
        </p>
        <p className="text-[11px] font-bold text-tonel">
          {formatMoney(data.summary.revenue)}
        </p>
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto pb-1">
        <div className="flex h-56 min-w-full items-end gap-1">
          {data.timeline.map((point, index) => {
            const height =
              point.revenue > 0
                ? Math.max((point.revenue / max) * 100, 3)
                : 1;
            return (
              <div
                key={point.key}
                className="flex min-w-9 flex-1 flex-col items-center justify-end gap-1.5"
              >
                <div className="flex h-44 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-9 rounded-t-lg transition hover:opacity-80 ${
                      point.revenue > 0
                        ? "bg-gradient-to-t from-terracotta to-amber"
                        : "bg-sand-deep/60"
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${point.label}: ${formatMoney(
                      point.revenue
                    )} · ${point.orders} órdenes`}
                  />
                </div>
                <span className="h-4 text-[9px] font-semibold text-espresso/40">
                  {index % labelStep === 0 ||
                  index === data.timeline.length - 1
                    ? point.label
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {data.timeline.every((point) => point.orders === 0) && (
        <p className="mt-2 text-center text-[11px] text-espresso/35">
          Sin ventas pagadas en este periodo.
        </p>
      )}
    </div>
  );
};

const BreakdownList = ({
  items,
  metric,
}: {
  items: StatBreakdown[];
  metric: "orders" | "revenue";
}) => {
  const max = Math.max(...items.map((item) => item[metric]), 1);

  if (items.length === 0) {
    return <EmptyBlock>Sin datos en este periodo.</EmptyBlock>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-espresso/70">
              {item.label}
            </span>
            <span className="font-bold text-tonel">
              {metric === "revenue"
                ? formatMoney(item.revenue)
                : formatNumber(item.orders)}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand/80">
            <div
              className="h-full rounded-full bg-terracotta/70"
              style={{
                width: `${Math.max((item[metric] / max) * 100, 2)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[10px] text-espresso/40">
            {metric === "revenue"
              ? `${formatNumber(item.orders)} órdenes`
              : formatMoney(item.revenue)}
          </p>
        </div>
      ))}
    </div>
  );
};

const BreakdownCard = ({
  title,
  subtitle,
  items,
  metric,
  className = "",
}: {
  title: string;
  subtitle?: string;
  items: StatBreakdown[];
  metric: "orders" | "revenue";
  className?: string;
}) => (
  <SectionCard title={title} subtitle={subtitle} className={className}>
    <BreakdownList items={items} metric={metric} />
  </SectionCard>
);

const StatsDashboard = ({ data }: { data: StatsResponse }) => {
  const { summary } = data;
  const cancelledRate =
    summary.totalOrders > 0
      ? (summary.cancelledOrders / summary.totalOrders) * 100
      : 0;
  const maxProductRevenue = Math.max(
    ...data.topProducts.map((product) => product.revenue),
    1
  );
  const maxHourlyOrders = Math.max(
    ...data.hourly.map((hour) => hour.orders),
    1
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos"
          value={formatMoney(summary.revenue)}
          hint={`${formatNumber(summary.paidOrders)} órdenes pagadas`}
          icon={Wallet}
          tone="olive"
          change={summary.revenueChangePct}
        />
        <StatCard
          label="Ticket promedio"
          value={formatMoney(summary.averageOrderValue)}
          hint="por orden pagada"
          icon={Receipt}
          tone="terracotta"
        />
        <StatCard
          label="Artículos vendidos"
          value={formatNumber(summary.itemsSold)}
          hint="unidades en órdenes pagadas"
          icon={Package}
          tone="amber"
        />
        <StatCard
          label="Clientes únicos"
          value={formatNumber(summary.uniqueCustomers)}
          hint="con al menos una compra"
          icon={Users}
          tone="tonel"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Órdenes pagadas"
          value={formatNumber(summary.paidOrders)}
          hint={`${formatNumber(summary.totalOrders)} totales`}
          icon={ShoppingBag}
          change={summary.ordersChangePct}
        />
        <StatCard
          label="Órdenes abiertas"
          value={formatNumber(summary.openOrders)}
          hint="pendientes o listas"
          icon={Clock}
          tone="terracotta"
        />
        <StatCard
          label="Canceladas"
          value={formatNumber(summary.cancelledOrders)}
          hint={`${cancelledRate.toFixed(1)}% del total`}
          icon={XCircle}
          tone="espresso"
        />
        <StatCard
          label="Efectivo cobrado"
          value={formatMoney(summary.cashCollected)}
          hint={`Cambio: ${formatMoney(summary.changeGiven)}`}
          icon={Banknote}
          tone="olive"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Ventas en el tiempo"
          subtitle={data.range.label}
        >
          <TimelineChart data={data} />
        </SectionCard>

        <SectionCard
          title="Origen de ingresos"
          subtitle="Órdenes pagadas"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-tonel/5 p-4">
                <div className="flex items-center gap-2 text-tonel">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    En línea
                  </span>
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-tonel">
                  {formatMoney(summary.onlineRevenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-terracotta/5 p-4">
                <div className="flex items-center gap-2 text-terracotta-deep">
                  <Store className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    Caja
                  </span>
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-tonel">
                  {formatMoney(summary.registerRevenue)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-tonel">
                Órdenes por origen
              </p>
              <div className="mt-3">
                <BreakdownList
                  items={data.sourceBreakdown}
                  metric="orders"
                />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BreakdownCard
          title="Métodos de pago"
          subtitle="Solo órdenes pagadas"
          items={data.paymentBreakdown}
          metric="revenue"
        />
        <BreakdownCard
          title="Estados"
          subtitle="Todas las órdenes del periodo"
          items={data.statusBreakdown}
          metric="orders"
        />
        <BreakdownCard
          title="Ventas por día"
          subtitle="Distribución semanal"
          items={data.weekdays}
          metric="revenue"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Productos más vendidos"
          subtitle="Ordenados por ingresos"
        >
          {data.topProducts.length === 0 ? (
            <EmptyBlock>Sin productos vendidos en este periodo.</EmptyBlock>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product, index) => {
                return (
                  <div key={product.id}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-tonel/5 text-[11px] font-bold text-tonel">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-xs font-bold text-tonel">
                            {product.title}
                          </p>
                          <p className="shrink-0 text-xs font-bold text-terracotta">
                            {formatMoney(product.revenue)}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-espresso/40">
                          <span>
                            {formatNumber(product.quantity)} unidades ·{" "}
                            {formatNumber(product.orders)} órdenes
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-terracotta to-amber"
                            style={{
                              width: `${Math.max(
                                (product.revenue / maxProductRevenue) * 100,
                                2
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Mejores clientes"
          subtitle="Por ingresos pagados"
        >
          {data.topCustomers.length === 0 ? (
            <EmptyBlock>Sin clientes con compras pagadas.</EmptyBlock>
          ) : (
            <div className="space-y-2">
              {data.topCustomers.map((customer, index) => (
                <div
                  key={customer.key}
                  className="flex items-center gap-3 rounded-2xl border border-sand/70 bg-cream/50 px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-tonel/5 text-[11px] font-bold text-tonel">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-tonel">
                      {customer.name}
                    </p>
                    <p className="truncate text-[10px] text-espresso/40">
                      {customer.email || "Sin correo"} ·{" "}
                      {formatNumber(customer.orders)} órdenes
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-terracotta">
                    {formatMoney(customer.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Horas más activas"
        subtitle="Órdenes pagadas por hora local"
      >
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {data.hourly.map((hour) => {
            const intensity = hour.orders / maxHourlyOrders;
            return (
              <div
                key={hour.hour}
                className={`rounded-xl border border-sand/70 px-1.5 py-2 text-center ${
                  intensity > 0.45 ? "text-white" : "text-espresso/55"
                }`}
                style={{
                  backgroundColor:
                    hour.orders > 0
                      ? `rgba(201, 97, 63, ${0.12 + intensity * 0.72})`
                      : undefined,
                }}
                title={`${String(hour.hour).padStart(2, "0")}:00 · ${
                  hour.orders
                } órdenes · ${formatMoney(hour.revenue)}`}
              >
                <p className="text-[9px] font-bold">
                  {String(hour.hour).padStart(2, "0")}
                </p>
                <p className="text-[10px] font-semibold">{hour.orders}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Órdenes recientes"
        subtitle="Últimos movimientos del periodo"
      >
        {data.recentOrders.length === 0 ? (
          <EmptyBlock>Sin órdenes en este periodo.</EmptyBlock>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-sand text-[10px] font-bold uppercase tracking-wide text-espresso/35">
                  <th className="pb-2 pr-3">Orden</th>
                  <th className="pb-2 pr-3">Cliente</th>
                  <th className="pb-2 pr-3">Origen</th>
                  <th className="pb-2 pr-3">Artículos</th>
                  <th className="pb-2 pr-3">Estado</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const meta =
                    orderStatusMeta[order.status as OrderStatus];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-sand/60 text-xs last:border-0"
                    >
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-espresso/45">
                        #{order.id.slice(-5).toUpperCase()}
                      </td>
                      <td className="max-w-40 truncate py-2.5 pr-3 font-semibold text-tonel">
                        {order.label}
                      </td>
                      <td className="py-2.5 pr-3 text-espresso/55">
                        {order.source === "register" ? "Caja" : "En línea"}
                      </td>
                      <td className="py-2.5 pr-3 text-espresso/55">
                        {formatNumber(order.items)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            statusClasses[order.status] ??
                            "bg-espresso/5 text-espresso/50"
                          }`}
                        >
                          {meta?.label ?? order.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-tonel">
                        {formatMoney(order.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

const AdminStatsPage = () => {
  const today = new Date();
  const [range, setRange] = useState<StatsRangeKey>("week");
  const [customFrom, setCustomFrom] = useState(
    toInputDate(new Date(today.getTime() - 29 * DAY_MS))
  );
  const [customTo, setCustomTo] = useState(toInputDate(today));

  const customInvalid =
    range === "custom" &&
    (!customFrom || !customTo || customFrom > customTo);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery<StatsResponse>({
    queryKey: ["admin-stats", range, customFrom, customTo],
    queryFn: async () => {
      const params = new URLSearchParams({ range });
      if (range === "custom") {
        params.set("from", customFrom);
        params.set("to", customTo);
      }

      const response = await fetch(`/api/admin/stats?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las estadísticas.");
      }

      return response.json();
    },
    enabled: !customInvalid,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
            <span className="h-px w-8 bg-terracotta/60" />
            Panel de control
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Estadísticas
          </h1>
          <p className="mt-1 text-sm text-espresso/55">
            Ventas, productos, clientes y rendimiento del negocio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-tonel/15 bg-white/70 px-4 py-2.5 text-xs font-bold text-tonel transition hover:bg-sand"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-sand bg-white/75 p-3 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {rangeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                range === option.key
                  ? "bg-tonel text-cream"
                  : "text-tonel/65 hover:bg-sand"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {range === "custom" && (
          <div className="mt-3 flex flex-col gap-2 border-t border-sand pt-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-espresso/40">
              Desde
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="rounded-xl border border-sand bg-cream/60 px-3 py-2 text-xs font-semibold text-tonel outline-none focus:border-terracotta"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-espresso/40">
              Hasta
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(event) => setCustomTo(event.target.value)}
                className="rounded-xl border border-sand bg-cream/60 px-3 py-2 text-xs font-semibold text-tonel outline-none focus:border-terracotta"
              />
            </label>
            {customInvalid && (
              <p className="pb-2 text-[11px] font-semibold text-terracotta">
                La fecha inicial debe ser anterior o igual a la final.
              </p>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sand/70 pt-3 text-[10px] font-semibold text-espresso/35">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {data?.range.label ?? "Selecciona un periodo"}
          </span>
          {dataUpdatedAt > 0 && (
            <span>
              Actualizado{" "}
              {new Date(dataUpdatedAt).toLocaleTimeString("es-HN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isError ? (
          <div className="rounded-3xl border border-terracotta/20 bg-terracotta/5 px-6 py-12 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-terracotta/40" />
            <p className="mt-3 font-display text-2xl font-semibold text-terracotta-deep">
              No pudimos cargar las estadísticas
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl border border-sand bg-white/50"
              />
            ))}
            <div className="col-span-full flex items-center justify-center gap-2 py-8 text-xs font-semibold text-espresso/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando estadísticas...
            </div>
          </div>
        ) : data ? (
          <StatsDashboard data={data} />
        ) : (
          <EmptyBlock>
            Selecciona un rango de fechas válido para ver estadísticas.
          </EmptyBlock>
        )}
      </div>
    </div>
  );
};

export default AdminStatsPage;
