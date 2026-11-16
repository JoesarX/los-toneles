import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { isOrderStatus, toOrderType } from "@/lib/orders";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// UPDATE THE STATUS OR CONTENTS OF AN ORDER
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getAuthSession();

  if (!session?.user.isAdmin) {
    return new NextResponse(
      JSON.stringify({ message: "You are not allowed!" }),
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data: Prisma.OrdersUpdateInput = {};

    if (typeof body === "string") {
      if (!isOrderStatus(body)) {
        return new NextResponse(
          JSON.stringify({ message: "Invalid order status." }),
          { status: 400 }
        );
      }
      data.status = body;
    } else if (body && typeof body === "object") {
      const input = body as Record<string, unknown>;

      if (input.status !== undefined) {
        if (!isOrderStatus(input.status)) {
          return new NextResponse(
            JSON.stringify({ message: "Invalid order status." }),
            { status: 400 }
          );
        }
        data.status = input.status;
      }

      if (input.products !== undefined) {
        if (!Array.isArray(input.products)) {
          return new NextResponse(
            JSON.stringify({ message: "Invalid order items." }),
            { status: 400 }
          );
        }
        data.products = input.products as Prisma.InputJsonValue[];
      }

      if (input.price !== undefined) {
        const price = Number(input.price);
        if (!Number.isFinite(price) || price < 0) {
          return new NextResponse(
            JSON.stringify({ message: "Invalid order total." }),
            { status: 400 }
          );
        }
        data.price = price;
      }

      if (input.customerName !== undefined) {
        data.customerName =
          typeof input.customerName === "string" &&
          input.customerName.trim()
            ? input.customerName.trim()
            : null;
      }

      if (input.notes !== undefined) {
        data.notes =
          typeof input.notes === "string" && input.notes.trim()
            ? input.notes.trim()
            : null;
      }

      for (const field of ["amountPaid", "changeGiven"] as const) {
        if (input[field] !== undefined) {
          if (input[field] === null) {
            data[field] = null;
            continue;
          }
          const value = Number(input[field]);
          if (!Number.isFinite(value) || value < 0) {
            return new NextResponse(
              JSON.stringify({ message: `Invalid ${field}.` }),
              { status: 400 }
            );
          }
          data[field] = value;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Nothing to update." }),
        { status: 400 }
      );
    }

    const order = await prisma.orders.update({
      where: { id },
      data,
    });

    return new NextResponse(JSON.stringify(toOrderType(order)), {
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};
