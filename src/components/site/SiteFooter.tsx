import { sitesMenu } from "@/data/navigation";
import { site } from "@/data/site";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import InstallPwaButton from "./InstallPwaButton";

const SiteFooter = () => {
  return (
    <footer className="bg-tonel text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream/10 text-amber"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                className="h-6 w-6"
              >
                <path d="M8 3c-1.4 2.8-2 5.8-2 9s.6 6.2 2 9h8c1.4-2.8 2-5.8 2-9s-.6-6.2-2-9H8Z" />
                <path d="M6.4 8h11.2M6.4 16h11.2M12 3v18" />
              </svg>
            </span>
            <div>
              <p className="font-display text-2xl font-semibold">Los Toneles</p>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                Desde {site.since}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
            Más de 50 años alimentando familias en Tegucigalpa con el mismo
            sabor, la misma calidad y el cariño de siempre.
          </p>
          <p className="mt-6 font-display text-lg text-amber">
            Aquí se come como en casa.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cream/45">
            Explora
          </p>
          <ul className="mt-5 space-y-3">
            {sitesMenu.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-cream/80 transition hover:text-amber"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cream/45">
            Visítanos
          </p>
          <ul className="mt-5 space-y-4 text-sm text-cream/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <a
                href={site.mapLink}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-amber"
              >
                {site.address}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <span>{site.hours}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <a
                href={site.phoneHref}
                className="font-semibold transition hover:text-amber"
              >
                {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-cream/45 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Los Toneles. Todos los derechos
            reservados.
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <InstallPwaButton />
            <p>Hecho con cariño en Tegucigalpa, Honduras.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
