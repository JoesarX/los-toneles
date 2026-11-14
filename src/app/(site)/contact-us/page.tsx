import { site } from "@/data/site";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Visítanos en Los Toneles, Tegucigalpa. Horario de atención y ubicación.",
};

const ContactPage = () => {
  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/70 bg-gradient-to-b from-sand/60 to-cream">
        <div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-olive/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-terracotta">
            <span className="h-px w-10 bg-terracotta/60" />
            Estamos cerca
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-tonel sm:text-5xl">
            Contáctanos
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-espresso/65 sm:text-base">
            ¿Quieres reservar, preguntar por un platillo o simplemente saber
            cómo llegar? Aquí tienes todo lo que necesitas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <a
              href={site.phoneHref}
              className="group flex items-start gap-4 rounded-3xl border border-sand bg-white/70 p-5 shadow-soft transition hover:border-terracotta/30"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <Phone className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/45">
                  Teléfono
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-tonel">
                  {site.phone}
                </p>
                <p className="mt-1 text-sm text-espresso/60">
                  Llámanos para consultar disponibilidad.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-espresso/30 transition group-hover:text-terracotta" />
            </a>

            <div className="flex items-start gap-4 rounded-3xl border border-sand bg-white/70 p-5 shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber/20 text-espresso">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/45">
                  Horario de atención
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-tonel">
                  {site.hours}
                </p>
                <p className="mt-1 text-sm text-espresso/60">
                  Abierto de lunes a sábado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-sand bg-white/70 p-5 shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-olive/10 text-olive">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/45">
                  Ubicación
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-tonel">
                  {site.address}
                </p>
                <a
                  href={site.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta transition hover:text-terracotta-deep"
                >
                  Cómo llegar
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-tonel p-6 text-cream">
              <UtensilsCrossed className="h-6 w-6 text-amber" />
              <p className="mt-3 font-display text-2xl font-semibold">
                ¿Prefieres ver el menú?
              </p>
              <p className="mt-1 text-sm text-cream/70">
                Explora nuestras categorías antes de venir.
              </p>
              <Link
                href="/menu"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-tonel transition hover:bg-amber"
              >
                Ver el menú
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-sand bg-white/70 p-2 shadow-soft">
            <iframe
              src={site.mapEmbed}
              title="Ubicación de Los Toneles en Tegucigalpa"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-[420px] w-full rounded-[2rem] border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
