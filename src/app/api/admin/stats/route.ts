import {
  OPEN_STATUSES,
  ORDER_STATUSES,
  orderStatusMeta,
  type OrderStatus,
} from "@/lib/orders";
import type { CartItemType } from "@/types/types";
import {
  STATS_RANGES,
  type StatBreakdown,
  type StatCustomer,
  type StatProduct,
  type StatsRangeKey,
  type StatsResponse,
  type StatTimelinePoint,
} from "@/types/stats";
import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

const TZ = "America/Tegucigalpa";
const HN_OFFSET_MS = -6 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const dateShort = new Intl.DateTimeFormat("es-HN", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
});

const dateLong = new Intl.DateTimeFormat("es-HN", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthShort = new Intl.DateTimeFormat("es-HN", {
  timeZone: TZ,
  month: "short",
  year: "2-digit",
});

const hourShort = new Intl.DateTimeFormat("es-HN", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type StatsOrder = {
  id: string;
  createdAt: Date;
  price: unknown;
  status: string;
  source: string;
  products: unknown;
  paymentMethod: string | null;
  customerName: string | null;
  userEmail: string | null;
  amountPaid: unknown;
  changeGiven: unknown;
};

type ResolvedRange = {
  key: StatsRangeKey;
  from: Date | null;
  to: Date;
  previousFrom: Date | null;
  previousTo: Date | null;
  label: string;
};

type Bucket = {
  key: string;
  label: string;
  start: Date;
};

class BadRangeError extends Error {}

const pad = (value: number) => String(value).padStart(2, "0");

const shifted = (date: Date) =>
  new Date(date.getTime() + HN_OFFSET_MS);

const localParts = (date: Date) => {
  const shiftedDate = shifted(date);
  return {
    year: shiftedDate.getUTCFullYear(),
    month: shiftedDate.getUTCMonth(),
    day: shiftedDate.getUTCDate(),
    hour: shiftedDate.getUTCHours(),
    weekday: shiftedDate.getUTCDay(),
  };
};

const utcFromLocal = (
  year: number,
  month: number,
  day: number,
  hour = 0
) => new Date(Date.UTC(year, month, day, hour) - HN_OFFSET_MS);

const localDateKey = (date: Date) => {
  const { year, month, day } = localParts(date);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
};

const localMonthKey = (date: Date) => {
  const { year, month } = localParts(date);
  return `${year}-${pad(month + 1)}`;
};

const localHour = (date: Date) => localParts(date).hour;

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const itemsOf = (order: StatsOrder) =>
  Array.isArray(order.products)
    ? (order.products as unknown as CartItemType[])
    : [];

const itemQuantity = (item: CartItemType) =>
  Math.max(1, Math.round(toNumber(item.quantity, 1)));

const itemRevenue = (item: CartItemType) => {
  const quantity = itemQuantity(item);
  return toNumber(item.subtotal, toNumber(item.price, 0) * quantity);
};

const parseDateStart = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = utcFromLocal(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    shifted(date).getUTCMonth() !== month - 1 ||
    shifted(date).getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const resolveRange = (params: URLSearchParams): ResolvedRange => {
  const requested = params.get("range") ?? "week";
  const key = (STATS_RANGES as readonly string[]).includes(requested)
    ? (requested as StatsRangeKey)
    : "week";
  const now = new Date();

  if (key === "all") {
    return {
      key,
      from: null,
      to: now,
      previousFrom: null,
      previousTo: null,
      label: "Todo el tiempo",
    };
  }

  let from: Date;
  let to = now;

  if (key === "custom") {
    const fromParam = params.get("from");
    const toParam = params.get("to");
    const parsedFrom = parseDateStart(fromParam);
    const parsedTo = parseDateStart(toParam);

    if (!parsedFrom || !parsedTo) {
      throw new BadRangeError("Invalid custom date range.");
    }

    from = parsedFrom;
    to = new Date(parsedTo.getTime() + DAY_MS);

    if (from >= to) {
      throw new BadRangeError(
        "The start date must be before the end date."
      );
    }
  } else {
    const today = localParts(now);
    const startOfToday = utcFromLocal(
      today.year,
      today.month,
      today.day
    );

    if (key === "day") {
      from = new Date(now.getTime() - DAY_MS);
    } else {
      const calendarDays = key === "week" ? 6 : key === "month" ? 29 : 364;
      from = new Date(
        startOfToday.getTime() - calendarDays * DAY_MS
      );
    }
  }

  const duration = to.getTime() - from.getTime();
  const previousTo = from;
  const previousFrom = new Date(from.getTime() - duration);

  const labels: Record<Exclude<StatsRangeKey, "custom">, string> = {
    day: "Últimas 24 horas",
    week: "Últimos 7 días",
    month: "Últimos 30 días",
    year: "Últimos 365 días",
    all: "Todo el tiempo",
  };

  const label =
    key === "custom"
      ? `${dateLong.format(from)} – ${dateLong.format(
          new Date(to.getTime() - 1)
        )}`
      : labels[key];

  return {
    key,
    from,
    to,
    previousFrom,
    previousTo,
    label,
  };
};

const buildBuckets = (
  start: Date,
  end: Date,
  granularity: "hour" | "day" | "month",
  includeDateInHour: boolean
): Bucket[] => {
  const buckets: Bucket[] = [];

  if (granularity === "hour") {
    const parts = localParts(start);
    let cursor = utcFromLocal(
      parts.year,
      parts.month,
      parts.day,
      parts.hour
    );

    while (cursor < end) {
      buckets.push({
        key: `${localDateKey(cursor)}-${pad(localHour(cursor))}`,
        label: includeDateInHour
          ? `${dateShort.format(cursor)} ${hourShort.format(cursor)}`
          : hourShort.format(cursor),
        start: cursor,
      });
      cursor = new Date(cursor.getTime() + HOUR_MS);
    }

    return buckets;
  }

  if (granularity === "day") {
    const parts = localParts(start);
    let cursor = utcFromLocal(parts.year, parts.month, parts.day);

    while (cursor < end) {
      buckets.push({
        key: localDateKey(cursor),
        label: dateShort.format(cursor),
        start: cursor,
      });
      cursor = new Date(cursor.getTime() + DAY_MS);
    }

    return buckets;
  }

  const parts = localParts(start);
  let year = parts.year;
  let month = parts.month;

  while (true) {
    const cursor = utcFromLocal(year, month, 1);
    if (cursor >= end) break;

    buckets.push({
      key: localMonthKey(cursor),
      label: monthShort.format(cursor),
      start: cursor,
    });

    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return buckets;
};

const percentChange = (
  current: number,
  previous: number | null
): number | null => {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const paymentLabel = (method: string | null) => {
  if (!method) return "No especificado";
  if (method === "cash") return "Efectivo";
  if (method === "card") return "Tarjeta";
  if (method === "transfer") return "Transferencia";
  return method;
};

const sourceLabel = (source: string) =>
  source === "register" ? "Caja" : "En línea";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();

  if (!session?.user.isAdmin) {
    return NextResponse.json(
      { message: "You are not allowed!" },
      { status: 403 }
    );
  }

  try {
    const range = resolveRange(req.nextUrl.searchParams);

    const [orders, previousPaidOrders] = await Promise.all([
      prisma.orders.findMany({
        where: range.from
          ? { createdAt: { gte: range.from, lt: range.to } }
          : { createdAt: { lt: range.to } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          price: true,
          status: true,
          source: true,
          products: true,
          paymentMethod: true,
          customerName: true,
          userEmail: true,
          amountPaid: true,
          changeGiven: true,
        },
      }),
      range.previousFrom && range.previousTo
        ? prisma.orders.findMany({
            where: {
              createdAt: {
                gte: range.previousFrom,
                lt: range.previousTo,
              },
              status: "paid",
            },
            select: { price: true },
          })
        : Promise.resolve(null),
    ]);

    const typedOrders = orders as StatsOrder[];
    const paidOrders = typedOrders.filter(
      (order) => order.status === "paid"
    );

    const revenue = paidOrders.reduce(
      (sum, order) => sum + toNumber(order.price),
      0
    );
    const totalOrders = typedOrders.length;
    const cancelledOrders = typedOrders.filter(
      (order) => order.status === "cancelled"
    ).length;
    const openOrders = typedOrders.filter((order) =>
      OPEN_STATUSES.includes(order.status as OrderStatus)
    ).length;

    let itemsSold = 0;
    let cashCollected = 0;
    let changeGiven = 0;
    let onlineRevenue = 0;
    let registerRevenue = 0;

    for (const order of paidOrders) {
      if (order.source === "register") {
        registerRevenue += toNumber(order.price);
        cashCollected += toNumber(order.amountPaid);
        changeGiven += toNumber(order.changeGiven);
      } else {
        onlineRevenue += toNumber(order.price);
      }

      for (const item of itemsOf(order)) {
        itemsSold += itemQuantity(item);
      }
    }

    const customerKeys = new Set<string>();
    const customerMap = new Map<string, StatCustomer>();

    for (const order of paidOrders) {
      const email = order.userEmail;
      const name = order.customerName || email || "Cliente en local";
      const key = email
        ? `email:${email}`
        : order.customerName
          ? `name:${order.customerName.toLowerCase()}`
          : "local";
      customerKeys.add(key);

      const current =
        customerMap.get(key) ??
        ({
          key,
          name,
          email,
          orders: 0,
          revenue: 0,
        } satisfies StatCustomer);

      current.orders += 1;
      current.revenue += toNumber(order.price);
      customerMap.set(key, current);
    }

    const statusBreakdown: StatBreakdown[] = ORDER_STATUSES.map(
      (status) => {
        const matching = typedOrders.filter(
          (order) => order.status === status
        );
        return {
          key: status,
          label: orderStatusMeta[status].label,
          orders: matching.length,
          revenue:
            status === "paid"
              ? matching.reduce(
                  (sum, order) => sum + toNumber(order.price),
                  0
                )
              : 0,
        };
      }
    );

    const sourceMap = new Map<string, StatBreakdown>();
    for (const order of typedOrders) {
      const key = order.source === "register" ? "register" : "online";
      const current =
        sourceMap.get(key) ??
        ({
          key,
          label: sourceLabel(key),
          orders: 0,
          revenue: 0,
        } satisfies StatBreakdown);

      current.orders += 1;
      if (order.status === "paid") {
        current.revenue += toNumber(order.price);
      }
      sourceMap.set(key, current);
    }

    const sourceBreakdown = ["online", "register"]
      .map((key) => sourceMap.get(key))
      .filter((item): item is StatBreakdown => Boolean(item));

    const paymentMap = new Map<string, StatBreakdown>();
    for (const order of paidOrders) {
      const key = order.paymentMethod ?? "unspecified";
      const current =
        paymentMap.get(key) ??
        ({
          key,
          label: paymentLabel(order.paymentMethod),
          orders: 0,
          revenue: 0,
        } satisfies StatBreakdown);

      current.orders += 1;
      current.revenue += toNumber(order.price);
      paymentMap.set(key, current);
    }

    const paymentBreakdown = [...paymentMap.values()].sort(
      (a, b) => b.revenue - a.revenue
    );

    const productMap = new Map<
      string,
      StatProduct & { orderIds: Set<string> }
    >();

    for (const order of paidOrders) {
      const productsInOrder = new Set<string>();

      for (const item of itemsOf(order)) {
        const id = String(item.id ?? item.title ?? "unknown");
        const title = String(item.title ?? "Producto");
        const revenueForItem = itemRevenue(item);
        const quantity = itemQuantity(item);
        const current =
          productMap.get(id) ??
          ({
            id,
            title,
            quantity: 0,
            revenue: 0,
            orders: 0,
            orderIds: new Set<string>(),
          } satisfies StatProduct & { orderIds: Set<string> });

        current.quantity += quantity;
        current.revenue += revenueForItem;
        current.orderIds.add(order.id);
        productMap.set(id, current);
        productsInOrder.add(id);
      }

      for (const id of productsInOrder) {
        const product = productMap.get(id);
        if (product) product.orders = product.orderIds.size;
      }
    }

    const topProducts = [...productMap.values()]
      .map(({ orderIds, ...product }) => ({
        ...product,
        orders: orderIds.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orders: 0,
      revenue: 0,
    }));
    const weekdayMap = new Map<number, StatBreakdown>();

    for (const order of paidOrders) {
      const parts = localParts(order.createdAt);
      hourly[parts.hour].orders += 1;
      hourly[parts.hour].revenue += toNumber(order.price);

      const current =
        weekdayMap.get(parts.weekday) ??
        ({
          key: String(parts.weekday),
          label: weekdayLabels[parts.weekday],
          orders: 0,
          revenue: 0,
        } satisfies StatBreakdown);

      current.orders += 1;
      current.revenue += toNumber(order.price);
      weekdayMap.set(parts.weekday, current);
    }

    const weekdays = weekdayLabels.map((label, index) => {
      const current = weekdayMap.get(index);
      return (
        current ?? {
          key: String(index),
          label,
          orders: 0,
          revenue: 0,
        }
      );
    });

    const earliestOrder = typedOrders.length
      ? new Date(
          Math.min(
            ...typedOrders.map((order) =>
              new Date(order.createdAt).getTime()
            )
          )
        )
      : null;
    const timelineStart =
      range.from ?? earliestOrder ?? new Date(range.to.getTime() - 30 * DAY_MS);
    const timelineSpan = range.to.getTime() - timelineStart.getTime();
    const granularity =
      range.key === "day" || timelineSpan <= 2 * DAY_MS
        ? "hour"
        : timelineSpan <= 62 * DAY_MS
          ? "day"
          : "month";

    const buckets = buildBuckets(
      timelineStart,
      range.to,
      granularity,
      timelineSpan > DAY_MS
    );
    const timelineMap = new Map<
      string,
      { orders: number; revenue: number }
    >();

    for (const order of paidOrders) {
      const key =
        granularity === "hour"
          ? `${localDateKey(order.createdAt)}-${pad(
              localHour(order.createdAt)
            )}`
          : granularity === "day"
            ? localDateKey(order.createdAt)
            : localMonthKey(order.createdAt);

      const current = timelineMap.get(key) ?? {
        orders: 0,
        revenue: 0,
      };
      current.orders += 1;
      current.revenue += toNumber(order.price);
      timelineMap.set(key, current);
    }

    const timeline: StatTimelinePoint[] = buckets.map((bucket) => {
      const current = timelineMap.get(bucket.key);
      return {
        key: bucket.key,
        label: bucket.label,
        orders: current?.orders ?? 0,
        revenue: current?.revenue ?? 0,
      };
    });

    const topCustomers = [...customerMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const recentOrders = typedOrders.slice(0, 8).map((order) => {
      const items = itemsOf(order);
      return {
        id: order.id,
        label:
          order.customerName ||
          order.userEmail ||
          (order.source === "register" ? "Cliente en local" : "Cliente"),
        source: order.source,
        status: order.status,
        price: toNumber(order.price),
        createdAt: order.createdAt.toISOString(),
        items: items.reduce(
          (sum, item) => sum + itemQuantity(item),
          0
        ),
      };
    });

    const previousRevenue = previousPaidOrders
      ? previousPaidOrders.reduce(
          (sum, order) => sum + toNumber(order.price),
          0
        )
      : null;
    const previousPaidOrderCount = previousPaidOrders
      ? previousPaidOrders.length
      : null;

    const fromIso = range.from
      ? range.from.toISOString()
      : earliestOrder
        ? earliestOrder.toISOString()
        : null;

    const payload: StatsResponse = {
      range: {
        key: range.key,
        label: range.label,
        from: fromIso,
        to: range.to.toISOString(),
        previousFrom: range.previousFrom?.toISOString() ?? null,
        previousTo: range.previousTo?.toISOString() ?? null,
      },
      summary: {
        revenue,
        paidOrders: paidOrders.length,
        totalOrders,
        averageOrderValue:
          paidOrders.length > 0 ? revenue / paidOrders.length : 0,
        itemsSold,
        uniqueCustomers: customerKeys.size,
        openOrders,
        cancelledOrders,
        cashCollected,
        changeGiven,
        onlineRevenue,
        registerRevenue,
        previousRevenue,
        revenueChangePct: percentChange(revenue, previousRevenue),
        previousPaidOrders: previousPaidOrderCount,
        ordersChangePct: percentChange(
          paidOrders.length,
          previousPaidOrderCount
        ),
      },
      statusBreakdown,
      sourceBreakdown,
      paymentBreakdown,
      timeline,
      topProducts,
      hourly,
      weekdays,
      topCustomers,
      recentOrders,
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof BadRangeError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    console.log(error);
    return NextResponse.json(
      { message: "No se pudieron calcular las estadísticas." },
      { status: 500 }
    );
  }
}
