import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const envStatus = {
  postgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
  postgresUrl: Boolean(process.env.POSTGRES_URL),
  postgresDirectUrl: Boolean(process.env.POSTGRES_URL_NON_POOLING),
  nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
  googleAuth: Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
  blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  cloudinaryCloud: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
};

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "reachable",
      node: process.version,
      env: envStatus,
    });
  } catch (error) {
    console.error("[health] database check failed", error);

    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        node: process.version,
        env: envStatus,
      },
      { status: 500 }
    );
  }
}
