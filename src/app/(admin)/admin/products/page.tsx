"use client";

import { categories } from "@/data/categories";
import type { ProductType } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

const formatMoney = (value: number) => `L. ${Number(value).toFixed(2)}`;

const priceLabel = (product: ProductType) => {
  if (product.options && product.options.length > 0) {
    const lowest = Math.min(
      ...product.options.map((option) => option.additionalPrice)
    );
    return `Desde ${formatMoney(lowest)}`;
  }
  return formatMoney(product.price);
};

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todo");

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<ProductType[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/products/admin", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("No se pudieron cargar los productos.");
      return response.json();
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<ProductType, "isVisible" | "isFeatured">>;
    }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el producto.");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Producto actualizado.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar el producto.");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Producto eliminado.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "Todo" || product.catSlug === category;
      const matchesSearch =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.desc.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  const visibleCount = products.filter((product) => product.isVisible).length;
  const featuredCount = products.filter((product) => product.isFeatured).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
            <span className="h-px w-8 bg-terracotta/60" />
            Catálogo
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-espresso/55">
            Administra el menú, visibilidad y destacados.
          </p>
        </div>
        <Link
          href="/admin/products/add-product"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: products.length },
          { label: "Visibles", value: visibleCount },
          { label: "Destacados", value: featuredCount },
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

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-sand bg-white/70 px-4 py-2.5">
          <Search className="h-4 w-4 text-espresso/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar producto..."
            className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/35"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todo", ...categories.map((item) => item.dbName)].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                category === item
                  ? "bg-tonel text-cream"
                  : "border border-tonel/15 bg-white/70 text-tonel hover:bg-sand"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="mt-8 rounded-2xl border border-terracotta/20 bg-terracotta/5 px-6 py-12 text-center">
          <p className="font-display text-2xl font-semibold text-terracotta-deep">
            No pudimos cargar los productos
          </p>
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-sand bg-white/50"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-sand-deep bg-white/40 px-6 py-16 text-center">
          <UtensilsCrossed className="h-8 w-8 text-espresso/25" />
          <p className="mt-3 font-display text-2xl font-semibold text-tonel">
            Sin productos
          </p>
          <p className="mt-1 text-sm text-espresso/50">
            Prueba otra búsqueda o agrega un producto nuevo.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => {
            const updating =
              updateProduct.isPending &&
              updateProduct.variables?.id === product.id;
            const deleting =
              deleteProduct.isPending &&
              deleteProduct.variables === product.id;

            return (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-sand bg-white/80 shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-sand/60 to-cream">
                  {product.img ? (
                    <Image
                      src={product.img}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-espresso/30">
                      Sin foto
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {product.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cream/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-tonel backdrop-blur">
                        <Star className="h-3 w-3 fill-amber text-amber" />
                        Destacado
                      </span>
                    )}
                    {!product.isVisible && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-espresso/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cream backdrop-blur">
                        <EyeOff className="h-3 w-3" />
                        Oculto
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-semibold text-tonel">
                        {product.title}
                      </h2>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-espresso/35">
                        {product.catSlug}
                        {product.options && product.options.length > 0
                          ? ` · ${product.options.length} opciones`
                          : ""}
                      </p>
                    </div>
                    {updating && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-terracotta" />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-espresso/55">
                    {product.desc}
                  </p>
                  <p className="mt-3 text-sm font-bold text-terracotta">
                    {priceLabel(product)}
                  </p>

                  <div className="mt-auto flex items-center gap-2 border-t border-sand/80 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct.mutate({
                          id: product.id,
                          data: { isVisible: !product.isVisible },
                        })
                      }
                      disabled={updating}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-tonel/15 text-tonel transition hover:bg-sand disabled:opacity-50"
                      title={
                        product.isVisible ? "Ocultar producto" : "Mostrar producto"
                      }
                    >
                      {product.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct.mutate({
                          id: product.id,
                          data: { isFeatured: !product.isFeatured },
                        })
                      }
                      disabled={updating}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-50 ${
                        product.isFeatured
                          ? "border-amber/40 bg-amber/15 text-terracotta"
                          : "border-tonel/15 text-tonel hover:bg-sand"
                      }`}
                      title={
                        product.isFeatured
                          ? "Quitar de destacados"
                          : "Hacer destacado"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          product.isFeatured ? "fill-amber text-amber" : ""
                        }`}
                      />
                    </button>

                    <Link
                      href={`/admin/products/edit-product/${product.id}`}
                      className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tonel text-cream transition hover:bg-tonel-deep"
                      title="Editar producto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`
                          )
                        ) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                      disabled={deleting}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-terracotta/20 text-terracotta transition hover:bg-terracotta/10 disabled:opacity-50"
                      title="Eliminar producto"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
