import { getProductPriceLabel } from "@/lib/products";
import type { ProductType } from "@/types/types";
import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

type Props = {
  product: ProductType;
  priority?: boolean;
};

const ProductCard = ({ product, priority = false }: Props) => {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-sand bg-white/70 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-amber/60 hover:shadow-lift ${
        product.isSoldOut ? "opacity-80" : ""
      }`}
    >
      <FavoriteButton
        productId={product.id}
        productTitle={product.title}
        className="absolute right-4 top-4 z-10"
      />
      <Link href={`/product/${product.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sand/70 via-cream to-sand/40">
          {product.img ? (
            <Image
              src={product.img}
              alt={product.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-6 transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-espresso/40">
              Foto próximamente
            </div>
          )}

          {product.isFeatured && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-tonel shadow-sm backdrop-blur">
              <Star className="h-3 w-3 fill-amber text-amber" />
              Favorito
            </span>
          )}

          {product.isSoldOut && (
            <span className="absolute inset-x-4 bottom-4 rounded-full bg-terracotta/95 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur">
              Agotado por hoy
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            {product.catSlug}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-tonel">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-espresso/65">
            {product.desc}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-sand/80 pt-4">
            <span className="text-base font-bold text-tonel">
              {getProductPriceLabel(product)}
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-tonel text-cream transition duration-300 group-hover:bg-terracotta">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
