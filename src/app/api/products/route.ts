import { toProduct } from "@/lib/products";
import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";

//* Get all visible products
export const GET = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        {
          catSlug: "asc",
        },
        {
          title: "asc",
        },
      ],
    });
    const response = new NextResponse(
      JSON.stringify(products.map(toProduct)),
      { status: 200 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Algo salio mal con el fetch de los productos!" }),
      { status: 500 }
    );
  }
};
