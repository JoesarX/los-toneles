import { randomUUID } from "crypto";
import type { CashSession } from "@prisma/client";
import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

type CashSummary = {
  id: string;
  startTime: string;
  startingCash: number;
  totalSales: number;
  orders: number;
  expectedCash: number;
  cashCollected: number;
  changeGiven: number;
  notes: string | null;
};

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const summarize = async (session: CashSession): Promise<CashSummary> => {
  const orders = await prisma.orders.findMany({
    where: {
      source: "register",
      status: "paid",
      createdAt: { gte: session.startTime },
    },
    select: {
      price: true,
      amountPaid: true,
      changeGiven: true,
    },
  });

  const totalSales = orders.reduce(
    (sum, order) => sum + toNumber(order.price),
    0
  );
  const cashCollected = orders.reduce(
    (sum, order) => sum + toNumber(order.amountPaid),
    0
  );
  const changeGiven = orders.reduce(
    (sum, order) => sum + toNumber(order.changeGiven),
    0
  );
  const startingCash = toNumber(session.startingCash);

  return {
    id: session.id,
    startTime: session.startTime.toISOString(),
    startingCash,
    totalSales,
    orders: orders.length,
    expectedCash: startingCash + totalSales,
    cashCollected,
    changeGiven,
    notes: session.notes,
  };
};

export const GET = async () => {
  const auth = await getAuthSession();

  if (!auth?.user.isAdmin) {
    return NextResponse.json(
      { message: "You are not allowed!" },
      { status: 403 }
    );
  }

  try {
    const active = await prisma.cashSession.findFirst({
      where: { isActive: true },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(
      { session: active ? await summarize(active) : null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "No se pudo consultar la caja." },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const auth = await getAuthSession();

  if (!auth?.user.isAdmin) {
    return NextResponse.json(
      { message: "You are not allowed!" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const action = body?.action;

    const user = auth.user.email
      ? await prisma.user.findUnique({ where: { email: auth.user.email } })
      : null;

    if (!user) {
      return NextResponse.json(
        { message: "No encontramos tu usuario de caja." },
        { status: 400 }
      );
    }

    const active = await prisma.cashSession.findFirst({
      where: { isActive: true },
      orderBy: { startTime: "desc" },
    });

    if (action === "open") {
      if (active) {
        return NextResponse.json(
          { message: "Ya hay una caja abierta." },
          { status: 409 }
        );
      }

      const startingCash = Number(body?.startingCash);
      if (!Number.isFinite(startingCash) || startingCash < 0) {
        return NextResponse.json(
          { message: "Fondo inicial inválido." },
          { status: 400 }
        );
      }

      const created = await prisma.cashSession.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          startingCash,
          notes:
            typeof body?.notes === "string" && body.notes.trim()
              ? body.notes.trim()
              : null,
        },
      });

      return NextResponse.json(
        { session: await summarize(created) },
        { status: 201 }
      );
    }

    if (action === "close") {
      if (!active) {
        return NextResponse.json(
          { message: "No hay una caja abierta." },
          { status: 404 }
        );
      }

      const endingCash = Number(body?.endingCash);
      if (!Number.isFinite(endingCash) || endingCash < 0) {
        return NextResponse.json(
          { message: "Efectivo contado inválido." },
          { status: 400 }
        );
      }

      const summary = await summarize(active);
      await prisma.cashSession.update({
        where: { id: active.id },
        data: {
          endTime: new Date(),
          endingCash,
          totalSales: summary.totalSales,
          isActive: false,
          notes:
            typeof body?.notes === "string" && body.notes.trim()
              ? body.notes.trim()
              : active.notes,
        },
      });

      return NextResponse.json({
        session: null,
        closed: {
          ...summary,
          endingCash,
          difference: endingCash - summary.expectedCash,
        },
      });
    }

    return NextResponse.json(
      { message: "Acción de caja inválida." },
      { status: 400 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "No se pudo actualizar la caja." },
      { status: 500 }
    );
  }
};
