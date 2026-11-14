import { toProduct } from "@/lib/products";
import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";

const categoryOrder: Record<string, number> = {
  Comida: 1,
  Bebida: 2,
  Otros: 3,
};

// FETCH FEATURED PRODUCTS
export const GET = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isVisible: true,
      },
    });

    products.sort(
      (a, b) =>
        (categoryOrder[a.catSlug] ?? 4) - (categoryOrder[b.catSlug] ?? 4) ||
        a.title.localeCompare(b.title)
    );

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
