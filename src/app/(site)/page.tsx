import CategoryCard from "@/components/site/CategoryCard";
import FeaturedProducts from "@/components/site/FeaturedProducts";
import HeroCarousel from "@/components/site/HeroCarousel";
import { categories } from "@/data/categories";
import { site } from "@/data/site";
import {
  ArrowUpRight,
  Banknote,
  Clock,
  HeartHandshake,
  MapPin,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: UtensilsCrossed,
    title: "Elige tus platillos",
    text: "Explora el menú y arma tu pedido con tus favoritos de siempre.",
  },
  {
    icon: ShoppingBag,
    title: "Haz tu pedido",
    text: "Muy pronto podrás ordenar en línea desde tu teléfono en pocos pasos.",
  },
  {
    icon: Banknote,
    title: "Paga en efectivo",
    text: "Sin tarjetas ni complicaciones. Pagas al recoger tu pedido en el local.",
  },
];

const FeaturedSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <div className="h-8 w-56 animate-pulse rounded-full bg-sand" />
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-96 animate-pulse rounded-[2rem] border border-sand bg-white/50"
        />
      ))}
    </div>
  </div>
);

const HomePage = () => {
  return (
    <>
      <HeroCarousel />

      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <section className="bg-sand/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
              <span className="h-px w-10 bg-terracotta/60" />
              Nuestra carta
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight text-tonel sm:text-5xl">
              Un menú para cada antojo
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-espresso/65">
              Desde un plato fuerte hasta algo dulce para cerrar. Todo preparado
              con recetas de familia y el sazón de casa.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-sand bg-sand shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              <div className="absolute inset-0 bg-[url('/contactanosLosToneles.jpg')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-3xl border border-sand bg-cream px-6 py-4 shadow-lift sm:left-10">
              <p className="font-display text-4xl font-semibold text-tonel">
                50+
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/50">
                Años de historia
              </p>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
              <span className="h-px w-10 bg-terracotta/60" />
              Nuestra historia
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight text-tonel sm:text-5xl">
              El sabor de una familia, en cada plato
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-espresso/70">
              Los Toneles nació como un pequeño comedor con una idea sencilla:
              que cada persona que se sentara a la mesa se sintiera en casa.
              Más de cinco décadas después, seguimos cocinando con los mismos
              ingredientes, las mismas recetas y el mismo cariño.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { value: "50+", label: "Años sirviendo" },
                { value: "3", label: "Generaciones" },
                { value: "100%", label: "Hecho en casa" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-sand bg-white/60 px-4 py-4"
                >
                  <p className="font-display text-3xl font-semibold text-tonel">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/contact-us"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-tonel px-6 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-tonel-deep"
            >
              Visítanos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-tonel py-20 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-amber">
                <span className="h-px w-10 bg-amber/60" />
                Cómo pedir
              </p>
              <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Pronto, pedir será así de fácil
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-cream/70">
                Estamos trabajando para que puedas ordenar en línea y pagar en
                efectivo al recoger. Mientras tanto, visítanos en el local y
                disfruta de tu platillo favorito.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/75">
              <Sparkles className="h-4 w-4 text-amber" />
              Pedidos en línea muy pronto
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[2rem] border border-cream/10 bg-cream/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber text-espresso">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-4xl font-semibold text-cream/15">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/65">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-sand bg-white/60 p-6 md:col-span-2">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <HeartHandshake className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-tonel">
                  Aquí se come como en casa
                </p>
                <p className="mt-2 text-sm leading-relaxed text-espresso/65">
                  Cada plato sale de nuestra cocina con el mismo cuidado de
                  siempre. Por eso, más que clientes, tenemos familia.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-amber p-6 text-espresso">
            <Clock className="h-6 w-6" />
            <p className="mt-4 font-display text-2xl font-semibold">
              Horario de atención
            </p>
            <p className="mt-2 text-sm font-medium">{site.hours}</p>
            <p className="mt-4 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {site.address}
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
