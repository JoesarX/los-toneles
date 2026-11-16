"use client";

import { useSession } from "next-auth/react";
import {
  Heart,
  Loader2,
  LockKeyhole,
  MessageSquareHeart,
  Send,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
};

const StarRating = ({ value, onChange, label }: StarRatingProps) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/50">
      {label}
    </p>
    <div className="mt-2 flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const active = value >= rating;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            aria-label={`${label}: ${rating} de 5 estrellas`}
            aria-pressed={active}
            className="rounded-lg p-1 transition hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition ${
                active
                  ? "fill-amber text-amber"
                  : "fill-transparent text-espresso/20"
              }`}
            />
          </button>
        );
      })}
    </div>
  </div>
);

const FeedbackPage = () => {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [ratingWeb, setRatingWeb] = useState(0);
  const [ratingFood, setRatingFood] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title || !comment || ratingWeb === 0 || ratingFood === 0) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          comment,
          ratingWeb,
          ratingFood,
          userEmail: session?.user.email,
        }),
      });

      if (res.ok) {
        toast.success("¡Gracias! Tu comentario ha sido enviado.");
        setTitle("");
        setComment("");
        setRatingWeb(0);
        setRatingFood(0);
      } else {
        const error = await res.json();
        toast.error(error.message ?? "No pudimos enviar tu comentario.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ha ocurrido un error al enviar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

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
            Tu opinión
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-tonel sm:text-5xl">
            Déjanos tu comentario
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-espresso/65 sm:text-base">
            Nos ayuda a seguir mejorando. Cuéntanos cómo fue tu experiencia con
            la comida y con nuestro sitio web.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2.5rem] bg-tonel p-6 text-cream sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream/10 text-amber">
              <MessageSquareHeart className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">
              Cada comentario cuenta
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              Leemos todas las opiniones con atención. Tu experiencia nos ayuda
              a mantener lo que funciona y mejorar lo que podemos hacer mejor.
            </p>

            <div className="mt-6 space-y-5 border-t border-cream/10 pt-6">
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                <div>
                  <p className="text-sm font-bold">Nos importa tu privacidad</p>
                  <p className="mt-1 text-xs leading-relaxed text-cream/60">
                    Tus comentarios no se publican. Los usamos únicamente para
                    mejorar nuestro servicio.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
                <div>
                  <p className="text-sm font-bold">Solo para clientes</p>
                  <p className="mt-1 text-xs leading-relaxed text-cream/60">
                    Inicia sesión para que podamos identificar tu visita.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-sand bg-white/70 p-6 shadow-soft sm:p-7">
            {status === "unauthenticated" ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-tonel">
                  <LockKeyhole className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-display text-3xl font-semibold text-tonel">
                  Inicia sesión para opinar
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-espresso/60">
                  Así podemos asociar tu comentario a tu visita y darte un mejor
                  seguimiento.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="title"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/50"
                  >
                    Título
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="En pocas palabras, ¿cómo fue tu experiencia?"
                    className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/50"
                  >
                    Comentario
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={5}
                    placeholder="Cuéntanos qué te gustó y qué podemos mejorar..."
                    className="mt-2 w-full resize-none rounded-2xl border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none transition placeholder:text-espresso/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <StarRating
                    value={ratingWeb}
                    onChange={setRatingWeb}
                    label="Nuestro sitio web"
                  />
                  <StarRating
                    value={ratingFood}
                    onChange={setRatingFood}
                    label="Nuestra comida"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar comentario
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-espresso/45">
                  Responderás como {session?.user?.name ?? "cliente"}.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeedbackPage;
