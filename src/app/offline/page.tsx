import { ArrowRight, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

const OfflinePage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 text-espresso">
      <div className="w-full max-w-md rounded-[2rem] border border-sand bg-white/75 p-8 text-center shadow-soft">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-tonel/10 text-tonel">
          <WifiOff className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-tonel">
          Sin conexión
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-espresso/65">
          No pudimos cargar esta página. Revisa tu internet e intenta de nuevo.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-tonel px-5 py-3 text-sm font-bold text-cream transition hover:bg-tonel-deep"
          >
            Volver al inicio
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-tonel/20 px-5 py-3 text-sm font-bold text-tonel transition hover:bg-sand"
          >
            Ver menú
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OfflinePage;
