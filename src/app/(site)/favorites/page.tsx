import FavoritesClient from "@/components/site/FavoritesClient";
import { getVisibleProducts } from "@/lib/products";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos",
  description:
    "Tus platillos favoritos de Los Toneles, listos para pedir en un solo lugar.",
};

const FavoritesPage = async () => {
  const products = await getVisibleProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
        <span className="h-px w-10 bg-terracotta/60" />
        Mi cuenta
      </p>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-4xl font-semibold text-tonel sm:text-5xl">
          Favoritos
        </h1>
        <Heart className="h-8 w-8 fill-terracotta/15 text-terracotta" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-espresso/60">
        Guarda tus platillos de siempre para pedirlos sin buscar entre todo el
        menú.
      </p>

      <FavoritesClient products={products} />
    </section>
  );
};

export default FavoritesPage;
