import ProductCard from "@/components/site/ProductCard";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/lib/products";
import { ArrowLeft, ArrowUpRight, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const current = getCategoryBySlug(category);

  if (!current) {
    return { title: "Menú" };
  }

  return {
    title: current.title,
    description: current.description,
  };
}

const CategoryPage = async ({ params }: Props) => {
  const { category } = await params;
  const current = getCategoryBySlug(category);

  if (!current) {
    notFound();
  }

  const products = await getProductsByCategory(current.dbName);

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/70 bg-gradient-to-b from-sand/60 to-cream">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-espresso/50">
            <Link href="/" className="transition hover:text-tonel">
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/menu" className="transition hover:text-tonel">
              Menú
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-tonel">{current.title}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
                <span className="h-px w-10 bg-terracotta/60" />
                {current.kicker}
              </p>
              <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-tonel sm:text-6xl">
                {current.title}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-espresso/65">
                {current.description}
              </p>
            </div>
            <p className="shrink-0 rounded-full border border-tonel/15 bg-white/60 px-4 py-2 text-sm font-semibold text-tonel">
              {products.length}{" "}
              {products.length === 1 ? "platillo" : "platillos"}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/menu/${item.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  item.slug === current.slug
                    ? "bg-tonel text-cream"
                    : "border border-tonel/15 bg-white/60 text-tonel hover:bg-sand"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-sand-deep bg-white/40 px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-tonel">
              <UtensilsCrossed className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold text-tonel">
              Muy pronto más delicias
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-espresso/60">
              Estamos actualizando esta categoría. Mientras tanto, explora el
              resto de nuestro menú.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-tonel px-5 py-3 text-sm font-bold text-cream transition hover:bg-tonel-deep"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al menú
            </Link>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-sand pt-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-tonel transition hover:text-terracotta"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver todas las categorías
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 text-sm font-bold text-tonel transition hover:text-terracotta"
          >
            ¿Tienes preguntas? Contáctanos
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default CategoryPage;
