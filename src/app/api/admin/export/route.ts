import type { CartItemType } from "@/types/types";
import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const dateTime = new Intl.DateTimeFormat("es-HN", {
  timeZone: "America/Tegucigalpa",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const escapeCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const parseDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

export const GET = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session?.user.isAdmin) {
    return NextResponse.json(
      { message: "You are not allowed!" },
      { status: 403 }
    );
  }

  try {
    const params = req.nextUrl.searchParams;
    const fromValue = params.get("from");
    const toValue = params.get("to");
    const from = parseDate(fromValue);
    const to = parseDate(toValue);

    if (fromValue && !from) {
      return NextResponse.json(
        { message: "Fecha inicial inválida." },
        { status: 400 }
      );
    }
    if (toValue && !to) {
      return NextResponse.json(
        { message: "Fecha final inválida." },
        { status: 400 }
      );
    }

    const where: Prisma.OrdersWhereInput = {};
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const orders = await prisma.orders.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        createdAt: true,
        price: true,
        status: true,
        source: true,
        customerName: true,
        userEmail: true,
        paymentMethod: true,
        amountPaid: true,
        changeGiven: true,
        scheduledFor: true,
        notes: true,
        products: true,
      },
    });

    const header = [
      "Orden",
      "Fecha",
      "Cliente",
      "Correo",
      "Origen",
      "Estado",
      "Pago",
      "Programado",
      "Articulos",
      "Total",
      "Recibido",
      "Cambio",
      "Notas",
    ];

    const rows = orders.map((order) => {
      const items = Array.isArray(order.products)
        ? (order.products as unknown as CartItemType[])
        : [];
      const itemText = items
        .map(
          (item) =>
            `${Math.max(1, Number(item.quantity) || 1)}x ${item.title}${
              item.optionTitle ? ` (${item.optionTitle})` : ""
            }`
        )
        .join(" | ");

      return [
        order.id,
        dateTime.format(order.createdAt),
        order.customerName || (order.source === "register" ? "Cliente en local" : ""),
        order.userEmail,
        order.source === "register" ? "Caja" : "En linea",
        order.status,
        order.paymentMethod,
        order.scheduledFor ? dateTime.format(order.scheduledFor) : "",
        itemText,
        Number(order.price),
        order.amountPaid === null ? "" : Number(order.amountPaid),
        order.changeGiven === null ? "" : Number(order.changeGiven),
        order.notes,
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const filename = `los-toneles-ordenes-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "No se pudo exportar el CSV." },
      { status: 500 }
    );
  }
};
