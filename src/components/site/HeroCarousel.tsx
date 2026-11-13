"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const slides = [
  {
    id: "tipica",
    image: "/tonelesSlider1.jpeg",
    kicker: "Desde 1973",
    title: "La mejor comida típica de todo Tegucigalpa",
    description:
      "Baleadas, pastelitos y tajadas con el sabor que nos ha acompañado por más de 50 años.",
    primary: { href: "/menu", label: "Ver el menú" },
    secondary: { href: "/contact-us", label: "Conócenos" },
  },
  {
    id: "sabor",
    image: "/tonelesSlider2.jpg",
    kicker: "El sabor de siempre",
    title: "Con el mismo sabor y calidad de siempre",
    description:
      "Cada plato se prepara como en casa: ingredientes frescos, recetas de familia y mucho cariño.",
    primary: { href: "/menu", label: "Explorar platillos" },
    secondary: { href: "/contact-us", label: "Cómo llegar" },
  },
  {
    id: "historia",
    image: "/tonelesSlider3.jpg",
    kicker: "Más de 50 años",
    title: "Alimentando familias hondureñas",
    description:
      "Tres generaciones compartiendo la mesa con nosotros. Gracias por hacer de Los Toneles tu casa.",
    primary: { href: "/feedback", label: "Déjanos tu opinión" },
    secondary: { href: "/contact-us", label: "Contáctanos" },
  },
];

const HeroCarousel = () => {
  const [autoplay] = useState(() =>
    Autoplay({ delay: 6500, stopOnMouseEnter: true, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) {
      setSelected(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section
      className="relative isolate overflow-hidden bg-espresso"
      aria-roledescription="carrusel"
      aria-label="Bienvenida a Los Toneles"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className="relative h-[68svh] min-h-[540px] w-full max-w-full flex-[0_0_100%]"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${slides.length}`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/60 to-espresso/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent" />

              <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 pt-20 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber">
                    <span className="h-px w-10 bg-amber/70" />
                    {slide.kicker}
                  </p>
                  <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-cream/80 sm:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.primary.href}
                      className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-bold text-espresso shadow-lift transition hover:bg-amber-soft"
                    >
                      {slide.primary.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={slide.secondary.href}
                      className="inline-flex items-center gap-2 rounded-full border border-cream/35 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition hover:border-cream/70 hover:bg-cream/10"
                    >
                      {slide.secondary.label}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2" role="tablist" aria-label="Diapositivas">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={selected === index}
                aria-label={`Ir a la diapositiva ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selected === index
                    ? "w-10 bg-amber"
                    : "w-3 bg-cream/40 hover:bg-cream/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream backdrop-blur-sm transition hover:border-cream/70 hover:bg-cream/10"
              aria-label="Diapositiva anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream backdrop-blur-sm transition hover:border-cream/70 hover:bg-cream/10"
              aria-label="Siguiente diapositiva"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
