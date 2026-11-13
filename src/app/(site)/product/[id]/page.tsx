import Price from "@/components/site/Price";
import ProductCard from "@/components/site/ProductCard";
import { getCategoryBySlug } from "@/data/categories";
import {
  getProductById,
  getProductsByCategory,
} from "@/lib/products";
import { ArrowLeft, Banknote, ChefHat, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Producto" };
  }

  return {
    title: product.title,
    description: product.desc,
  };
}

const SingleProductPage = async ({ params }: Props) => {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.catSlug);
  const related = category
    ? (await getProductsByCategory(category.dbName))
        .filter((item) => item.id !== product.id)
        .slice(0, 3)
    : [];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-espresso/50">
          <Link href="/" className="transition hover:text-tonel">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/menu" className="transition hover:text-tonel">
            Menú
          </Link>
          {category && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={`/menu/${category.slug}`}
                className="transition hover:text-tonel"
              >
                {category.title}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-tonel">{product.title}</span>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-sand bg-gradient-to-br from-sand/80 via-cream to-sand/40 shadow-soft">
            {product.img ? (
              <Image
                src={product.img}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8 sm:p-12"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-espresso/40">
                Foto próximamente
              </div>
            )}

            {product.isFeatured && (
              <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-tonel shadow-sm backdrop-blur">
                <Star className="h-3 w-3 fill-amber text-amber" />
                Favorito de la casa
              </span>
            )}
          </div>

          <div className="lg:py-6">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  href={`/menu/${category.slug}`}
                  className="rounded-full bg-tonel/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-tonel transition hover:bg-tonel/15"
                >
                  {category.title}
                </Link>
              )}
              <span className="rounded-full bg-olive/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-olive">
                Hecho al momento
              </span>
            </div>

            <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] text-tonel sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-espresso/70">
              {product.desc}
            </p>

            <Price product={product} />

            <div className="mt-8 grid gap-3 border-t border-sand pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
                <div>
                  <p className="text-sm font-bold text-tonel">Pago en efectivo</p>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/60">
                    Sin tarjetas. Pagas al recoger tu pedido.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                <div>
                  <p className="text-sm font-bold text-tonel">
                    Preparado al momento
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/60">
                    Ingredientes frescos y recetas de familia.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-tonel transition hover:text-terracotta"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al menú
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-sand/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
                  <span className="h-px w-10 bg-terracotta/60" />
                  También te puede gustar
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-tonel sm:text-4xl">
                  Más de {category?.title.toLowerCase() ?? "la carta"}
                </h2>
              </div>
              {category && (
                <Link
                  href={`/menu/${category.slug}`}
                  className="hidden rounded-full border border-tonel/20 px-4 py-2 text-sm font-bold text-tonel transition hover:bg-tonel hover:text-cream sm:inline-flex"
                >
                  Ver categoría
                </Link>
              )}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default SingleProductPage;
