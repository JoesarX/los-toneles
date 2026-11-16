import { OPEN_STATUSES } from "@/lib/orders";
import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

const DAY_MS = 24 * 60 * 60 * 1000;

export const GET = async (req: NextRequest) => {
  const secret = process.env.CRON_SECRET;

  if (
    secret &&
    req.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - DAY_MS);
    const result = await prisma.orders.updateMany({
      where: {
        status: { in: OPEN_STATUSES },
        createdAt: { lt: cutoff },
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lt: cutoff } },
        ],
      },
      data: { status: "cancelled" },
    });

    return NextResponse.json({
      cancelled: result.count,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "No se pudieron cancelar las órdenes vencidas." },
      { status: 500 }
    );
  }
};
