"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(session?.user.isAdmin ? "/admin/orders" : "/");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2.5rem] border border-sand bg-white/60 shadow-soft md:grid-cols-2">
        <div className="relative hidden min-h-[520px] md:block">
          <Image
            src="/loginPic1.jpg"
            alt="Interior de Los Toneles"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
            <p className="font-display text-3xl font-semibold leading-tight">
              Bienvenido a la mesa
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/70">
              Más de 50 años compartiendo el sabor de casa en Tegucigalpa.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
            <LockKeyhole className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold text-tonel">
            Inicia sesión
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-espresso/65">
            Accede para guardar tus pedidos y dejarnos tus comentarios. Si aún
            no tienes una cuenta, la crearemos por ti al iniciar sesión.
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-sand bg-white px-5 py-4 text-sm font-bold text-tonel shadow-sm transition hover:border-tonel/30 hover:bg-sand/40"
          >
            <Image
              src="/google.png"
              alt=""
              width={20}
              height={20}
              className="object-contain"
            />
            Continuar con Google
          </button>

          <p className="mt-6 text-xs leading-relaxed text-espresso/45">
            Al continuar, aceptas que usemos tu nombre y correo únicamente para
            gestionar tu cuenta dentro de Los Toneles.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
