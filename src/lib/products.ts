import type { Product } from "@prisma/client";
import { prisma } from "@/utils/connect";
import type { ProductType } from "@/types/types";

export const toProduct = (row: Product): ProductType => {
  const options = Array.isArray(row.options)
    ? row.options
        .map((option) => {
          const value = option as {
            title?: unknown;
            additionalPrice?: unknown;
          };
          return {
            title: String(value.title ?? ""),
            additionalPrice: Number(value.additionalPrice ?? 0),
          };
        })
        .filter((option) => option.title.length > 0)
    : [];

  return {
    id: row.id,
    title: row.title,
    desc: row.desc,
    img: row.img ?? undefined,
    price: Number(row.price),
    isFeatured: row.isFeatured,
    isVisible: row.isVisible,
    isSoldOut: row.isSoldOut,
    catSlug: row.catSlug,
    options,
  };
};

const orderBy = [{ catSlug: "asc" as const }, { title: "asc" as const }];

export async function getFeaturedProducts(limit = 6): Promise<ProductType[]> {
  const featured = await prisma.product.findMany({
    where: { isVisible: true, isFeatured: true },
    orderBy,
    take: limit,
  });

  if (featured.length > 0) {
    return featured.map(toProduct);
  }

  const fallback = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy,
    take: limit,
  });

  return fallback.map(toProduct);
}

export async function getProductsByCategory(
  dbName: string
): Promise<ProductType[]> {
  const products = await prisma.product.findMany({
    where: { catSlug: dbName, isVisible: true },
    orderBy: [{ title: "asc" }],
  });

  return products.map(toProduct);
}

export async function getProductById(id: string): Promise<ProductType | null> {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || !product.isVisible) {
    return null;
  }

  return toProduct(product);
}

export async function getProductForAdmin(
  id: string
): Promise<ProductType | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  return product ? toProduct(product) : null;
}

export function getProductPriceLabel(product: ProductType): string {
  if (product.options && product.options.length > 0) {
    const lowest = Math.min(
      ...product.options.map((option) => option.additionalPrice)
    );
    return `Desde L. ${lowest.toFixed(2)}`;
  }

  return `L. ${product.price.toFixed(2)}`;
}
