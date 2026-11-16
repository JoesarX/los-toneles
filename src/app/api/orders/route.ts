import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import {
  CLOSED_ORDER_MESSAGE,
  isWithinBusinessHours,
  SCHEDULE_OUTSIDE_HOURS_MESSAGE,
} from "@/lib/business-hours";
import {
  isOrderStatus,
  OPEN_STATUSES,
  toOrderType,
} from "@/lib/orders";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// FETCH ORDERS
export const GET = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated!" }),
      { status: 401 }
    );
  }

  try {
    const params = req.nextUrl.searchParams;
    const source = params.get("source");
    const statusParam = params.get("status");
    const openOnly = params.get("open") === "true";
    const requestedLimit = Number(params.get("limit"));
    const take =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 200)
        : undefined;

    const filters: Prisma.OrdersWhereInput = {};
    if (source) filters.source = source;
    if (statusParam && isOrderStatus(statusParam)) {
      filters.status = statusParam;
    }
    if (openOnly) {
      filters.status = { in: OPEN_STATUSES };
    }

    const orders = await prisma.orders.findMany({
      where: session.user.isAdmin
        ? filters
        : {
            ...filters,
            userEmail: session.user.email ?? "__none__",
          },
      orderBy: { createdAt: "desc" },
      take,
    });

    const response = new NextResponse(
      JSON.stringify(orders.map(toOrderType)),
      { status: 200 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};

// CREATE ORDER
export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated!" }),
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const isAdmin = session.user.isAdmin === true;
    const isRegister = isAdmin && body.source === "register";
    const source = isRegister ? "register" : "online";
    const userEmail = isRegister ? null : session.user.email ?? null;

    if (!isRegister && !userEmail) {
      return new NextResponse(
        JSON.stringify({ message: "Missing user email." }),
        { status: 400 }
      );
    }

    const products = Array.isArray(body.products) ? body.products : [];
    const price = Number(body.price);

    if (!Number.isFinite(price) || price < 0) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid order total." }),
        { status: 400 }
      );
    }

    const status =
      isAdmin && isOrderStatus(body.status) ? body.status : "pending";
    const amountPaid = isRegister ? Number(body.amountPaid) : null;
    const changeGiven = isRegister ? Number(body.changeGiven) : null;

    let scheduledFor: Date | null = null;
    if (
      !isRegister &&
      typeof body.scheduledFor === "string" &&
      body.scheduledFor.trim()
    ) {
      const parsed = new Date(body.scheduledFor);
      if (!Number.isFinite(parsed.getTime()) || parsed.getTime() <= Date.now()) {
        return new NextResponse(
          JSON.stringify({
            message: "La hora programada debe ser en el futuro.",
          }),
          { status: 400 }
        );
      }
      if (!isWithinBusinessHours(parsed)) {
        return new NextResponse(
          JSON.stringify({ message: SCHEDULE_OUTSIDE_HOURS_MESSAGE }),
          { status: 400 }
        );
      }
      scheduledFor = parsed;
    }

    if (!isRegister && !scheduledFor && !isWithinBusinessHours(new Date())) {
      return new NextResponse(
        JSON.stringify({ message: CLOSED_ORDER_MESSAGE }),
        { status: 400 }
      );
    }

    const order = await prisma.orders.create({
      data: {
        price,
        products,
        status,
        source,
        userEmail,
        scheduledFor,
        customerName:
          typeof body.customerName === "string" && body.customerName.trim()
            ? body.customerName.trim()
            : null,
        amountPaid: Number.isFinite(amountPaid) ? amountPaid : null,
        changeGiven: Number.isFinite(changeGiven) ? changeGiven : null,
        paymentMethod: isRegister ? "cash" : body.paymentMethod ?? null,
        notes:
          typeof body.notes === "string" && body.notes.trim()
            ? body.notes.trim()
            : null,
      },
    });

    return new NextResponse(JSON.stringify(toOrderType(order)), {
      status: 201,
    });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};
