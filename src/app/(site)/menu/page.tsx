import CategoryCard from "@/components/site/CategoryCard";
import { categories } from "@/data/categories";
import { site } from "@/data/site";
import { Clock, Phone, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Explora el menú de Los Toneles: comida típica hondureña, bebidas bien frías y antojitos para completar.",
};

const MenuPage = () => {
  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/70 bg-gradient-to-b from-sand/60 to-cream">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
            <span className="h-px w-10 bg-terracotta/60" />
            Nuestra carta
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-tonel sm:text-5xl">
            Comida típica, sabor de casa
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-espresso/65 sm:text-base">
            Elige una categoría y descubre todo lo que tenemos para ti. Cada
            platillo se prepara al momento con ingredientes frescos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-sand bg-white/60 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tonel/10 text-tonel">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-tonel">
                ¿No sabes qué elegir?
              </p>
              <p className="mt-1 text-sm text-espresso/65">
                Escríbenos o visítanos y con gusto te recomendamos.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-tonel/20 px-4 py-2.5 text-sm font-semibold text-tonel transition hover:bg-sand"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-full bg-tonel px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-tonel-deep"
            >
              <Clock className="h-4 w-4" />
              Horarios y ubicación
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default MenuPage;
