"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[2rem] border border-sand bg-white/70 p-8 text-center shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
          Algo salió mal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-tonel">
          No pudimos cargar esta página
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-espresso/60">
          Vuelve a intentarlo. Si el problema continúa, visítanos o llámanos.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-espresso/35">
            Código: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-white transition hover:bg-terracotta-deep"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-tonel/20 px-5 py-3 text-sm font-bold text-tonel transition hover:bg-sand"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
