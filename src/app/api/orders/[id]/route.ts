import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { isOrderStatus, toOrderType } from "@/lib/orders";
import { NextRequest, NextResponse } from "next/server";

// CHANGE THE STATUS OF AN ORDER
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
    const status =
      typeof body === "string" ? body : (body as { status?: unknown }).status;

    if (!isOrderStatus(status)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid order status." }),
        { status: 400 }
      );
    }

    const order = await prisma.orders.update({
      where: { id },
      data: { status },
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
