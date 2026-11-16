import type { Orders } from "@prisma/client";
import type { CartItemType, OrderType } from "@/types/types";

export const ORDER_STATUSES = [
  "pending",
  "ready",
  "paid",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; description: string }
> = {
  pending: {
    label: "Pendiente",
    description: "Pedido recibido, en preparación.",
  },
  ready: {
    label: "Listo",
    description: "Pedido listo para entregar.",
  },
  paid: {
    label: "Pagado",
    description: "Pedido entregado y cobrado.",
  },
  cancelled: {
    label: "Cancelado",
    description: "Pedido cancelado, no cuenta en métricas.",
  },
};

export const OPEN_STATUSES: OrderStatus[] = ["pending", "ready"];

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" &&
  (ORDER_STATUSES as readonly string[]).includes(value);

export const toOrderType = (order: Orders): OrderType => ({
  id: order.id,
  userEmail: order.userEmail,
  price: Number(order.price),
  products: Array.isArray(order.products)
    ? (order.products as unknown as CartItemType[])
    : [],
  status: order.status,
  createdAt: order.createdAt,
  scheduledFor: order.scheduledFor,
  intent_id: order.intent_id ?? undefined,
  source: order.source,
  customerName: order.customerName,
  amountPaid:
    order.amountPaid === null ? null : Number(order.amountPaid),
  changeGiven:
    order.changeGiven === null ? null : Number(order.changeGiven),
  paymentMethod: order.paymentMethod,
  notes: order.notes,
});
