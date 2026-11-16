"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Search,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "recent" | "oldest" | "web" | "food";

interface Comment {
  id: string;
  createdAt: string;
  userEmail: string;
  title: string;
  comment: string;
  ratingWeb: number;
  ratingFood: number;
}

const commentsPerPage = 8;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-3.5 w-3.5 ${
          value > index ? "fill-amber text-amber" : "text-espresso/15"
        }`}
      />
    ))}
  </span>
);

const average = (values: number[]) =>
  values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const AdminCommentsPage = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery<Comment[]>({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const response = await fetch("/api/comments", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar los comentarios.");
      return response.json();
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = comments.filter(
      (item) =>
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.comment.toLowerCase().includes(term) ||
        item.userEmail.toLowerCase().includes(term)
    );

    return [...result].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "web":
          return b.ratingWeb - a.ratingWeb;
        case "food":
          return b.ratingFood - a.ratingFood;
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [comments, search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / commentsPerPage));
  const safePage = Math.min(page, totalPages);
  const currentComments = filtered.slice(
    (safePage - 1) * commentsPerPage,
    safePage * commentsPerPage
  );

  return (
    <div>
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
          <span className="h-px w-8 bg-terracotta/60" />
          Opiniones
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
          Comentarios
        </h1>
        <p className="mt-1 text-sm text-espresso/55">
          Lo que los clientes dicen de la experiencia y la comida.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Comentarios", value: String(comments.length) },
          {
            label: "Prom. web",
            value: average(comments.map((item) => item.ratingWeb)).toFixed(1),
          },
          {
            label: "Prom. comida",
            value: average(comments.map((item) => item.ratingFood)).toFixed(1),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-sand bg-white/70 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-espresso/40">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-tonel">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-sand bg-white/70 px-4 py-2.5">
          <Search className="h-4 w-4 text-espresso/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por título, comentario o correo..."
            className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/35"
          />
        </div>
        <select
          value={sortKey}
          onChange={(event) => {
            setSortKey(event.target.value as SortKey);
            setPage(1);
          }}
          className="rounded-2xl border border-sand bg-white/70 px-4 py-2.5 text-sm font-semibold text-tonel outline-none focus:border-terracotta"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="web">Mejor calificación web</option>
          <option value="food">Mejor calificación comida</option>
        </select>
      </div>

      {isError ? (
        <div className="mt-8 rounded-2xl border border-terracotta/20 bg-terracotta/5 px-6 py-10 text-center">
          <p className="font-display text-2xl font-semibold text-terracotta-deep">
            No pudimos cargar los comentarios
          </p>
        </div>
      ) : isLoading ? (
        <div className="mt-6 flex items-center justify-center rounded-3xl border border-sand bg-white/50 py-12 text-tonel">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center">
          <MessageSquare className="h-8 w-8 text-espresso/25" />
          <p className="mt-3 font-display text-2xl font-semibold text-tonel">
            Sin comentarios
          </p>
          <p className="mt-1 text-sm text-espresso/50">
            Prueba otra búsqueda o espera nuevas opiniones.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {currentComments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-3xl border border-sand bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl font-semibold text-tonel">
                      {comment.title}
                    </h2>
                    <p className="mt-0.5 truncate text-[11px] text-espresso/45">
                      {comment.userEmail} · {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tonel text-xs font-bold text-cream">
                    {comment.userEmail.charAt(0).toUpperCase()}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-espresso/70">
                  {comment.comment}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-sand/80 pt-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/40">
                      Web
                    </p>
                    <Stars value={comment.ratingWeb} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/40">
                      Comida
                    </p>
                    <Stars value={comment.ratingFood} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sand bg-white/70 text-tonel transition hover:bg-sand disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                      pageNumber === safePage
                        ? "bg-tonel text-cream"
                        : "border border-sand bg-white/70 text-tonel hover:bg-sand"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sand bg-white/70 text-tonel transition hover:bg-sand disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCommentsPage;
