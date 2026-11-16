"use client";

import type { ProductType } from "@/types/types";
import { useFavoritesStore } from "@/utils/favorites";
import { useFavoritesHydrated } from "@/utils/useFavoritesHydrated";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";

type Props = {
  products: ProductType[];
};

const FavoritesClient = ({ products }: Props) => {
  const hydrated = useFavoritesHydrated();
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const favorites = products.filter((product) =>
    favoriteIds.includes(product.id)
  );

  if (!hydrated) {
    return (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-[2rem] border border-sand bg-white/50"
          />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center sm:py-16">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sand text-terracotta">
          <Heart className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold text-tonel">
          Aún no tienes favoritos
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-espresso/60">
          Toca el corazón en cualquier platillo para guardarlo aquí y
          encontrarlo más rápido.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep"
        >
          <ShoppingBag className="h-4 w-4" />
          Explorar el menú
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm font-semibold text-espresso/55">
        {favorites.length}{" "}
        {favorites.length === 1 ? "platillo guardado" : "platillos guardados"}
      </p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 3}
          />
        ))}
      </div>
    </>
  );
};

export default FavoritesClient;
