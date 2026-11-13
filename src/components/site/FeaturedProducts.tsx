import { getFeaturedProducts } from "@/lib/products";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const FeaturedProducts = async () => {
  const products = await getFeaturedProducts(6);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
            <span className="h-px w-10 bg-terracotta/60" />
            Lo más pedido
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight text-tonel sm:text-5xl">
            Los favoritos de la casa
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-espresso/65">
            Los platillos que han conquistado a varias generaciones. Preparados
            al momento, con el sabor de siempre.
          </p>
        </div>

        <Link
          href="/menu"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-tonel/20 px-5 py-3 text-sm font-bold text-tonel transition hover:bg-tonel hover:text-cream"
        >
          Ver todo el menú
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 3}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
