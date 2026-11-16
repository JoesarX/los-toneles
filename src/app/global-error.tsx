"use client";

import { RotateCcw } from "lucide-react";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-[#FAF3E7] px-4 font-sans text-[#2A1E17]">
        <div className="w-full max-w-lg rounded-[2rem] border border-[#E6D6BE] bg-white/70 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#C9613F]">
            Algo salió mal
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[#1E3A5F]">
            No pudimos cargar el sitio
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#2A1E17]/60">
            Vuelve a intentarlo en unos segundos.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-[11px] text-[#2A1E17]/35">
              Código: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#C9613F] px-5 py-3 text-sm font-bold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
