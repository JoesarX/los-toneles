"use client";

import { categories } from "@/data/categories";
import type { ProductType } from "@/types/types";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type OptionInput = { title: string; additionalPrice: number };

type Props = {
  mode: "add" | "edit";
  product?: ProductType;
};

const ProductForm = ({ mode, product }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState(product?.title ?? "");
  const [desc, setDesc] = useState(product?.desc ?? "");
  const [price, setPrice] = useState(
    product ? String(product.price) : ""
  );
  const [catSlug, setCatSlug] = useState(product?.catSlug ?? "Comida");
  const [img, setImg] = useState(product?.img ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isVisible, setIsVisible] = useState(product?.isVisible ?? true);
  const [options, setOptions] = useState<OptionInput[]>(product?.options ?? []);
  const [optionTitle, setOptionTitle] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAddOption = () => {
    const cleanTitle = optionTitle.trim();
    const value = Number(optionPrice);

    if (!cleanTitle) {
      toast.error("La opción necesita un nombre.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("La opción necesita un precio válido.");
      return;
    }
    if (options.some((option) => option.title === cleanTitle)) {
      toast.error("Ya existe una opción con ese nombre.");
      return;
    }

    setOptions((current) => [
      ...current,
      { title: cleanTitle, additionalPrice: value },
    ]);
    setOptionTitle("");
    setOptionPrice("");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen.");
      input.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 4 MB.");
      input.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        throw new Error(data?.message ?? "No se pudo subir la imagen.");
      }

      setImg(data.url);
      toast.success("Imagen subida.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo subir la imagen."
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (!desc.trim() || desc.trim().length < 10) {
      toast.error("La descripción debe tener al menos 10 caracteres.");
      return;
    }

    const numericPrice = Number(price);
    if (
      options.length === 0 &&
      (!Number.isFinite(numericPrice) || numericPrice <= 0)
    ) {
      toast.error("Agrega un precio o al menos una opción.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        mode === "add"
          ? "/api/products/admin"
          : `/api/products/${product?.id}`,
        {
          method: mode === "add" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            desc: desc.trim(),
            price: Number.isFinite(numericPrice) ? numericPrice : 0,
            catSlug,
            img: img.trim() || null,
            isFeatured,
            isVisible,
            options,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "No se pudo guardar el producto.");
      }

      toast.success(
        mode === "add" ? "Producto agregado." : "Producto actualizado."
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Algo salió mal."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-tonel transition hover:text-terracotta"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a productos
          </Link>
          <h1 className="mt-2 font-display text-4xl font-semibold text-tonel sm:text-5xl">
            {mode === "add" ? "Nuevo producto" : "Editar producto"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Guardando..." : "Guardar producto"}
        </button>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-sand bg-white/70 p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-tonel">
              Información
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45"
                >
                  Título
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Orden de baleadas"
                  className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-terracotta"
                />
              </div>

              <div>
                <label
                  htmlFor="desc"
                  className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45"
                >
                  Descripción
                </label>
                <textarea
                  id="desc"
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                  rows={3}
                  placeholder="Describe el producto para el menú..."
                  className="mt-2 w-full resize-none rounded-xl border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-terracotta"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45"
                  >
                    Precio base
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-3 focus-within:border-terracotta">
                    <span className="text-sm font-bold text-espresso/35">L.</span>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-sm font-semibold text-tonel outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/45"
                  >
                    Categoría
                  </label>
                  <select
                    id="category"
                    value={catSlug}
                    onChange={(event) => setCatSlug(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm font-semibold text-tonel outline-none transition focus:border-terracotta"
                  >
                    {categories.map((category) => (
                      <option key={category.dbName} value={category.dbName}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-sand bg-white/70 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-tonel">
                  Opciones
                </h2>
                <p className="mt-1 text-xs text-espresso/50">
                  Usa el precio final de cada opción, no un extra.
                </p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-[11px] font-bold text-tonel">
                {options.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {options.map((option) => (
                <div
                  key={option.title}
                  className="flex items-center justify-between gap-3 rounded-xl border border-sand bg-cream/50 px-4 py-2.5"
                >
                  <span className="text-sm font-semibold text-tonel">
                    {option.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-terracotta">
                      L. {option.additionalPrice.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOptions((current) =>
                          current.filter((item) => item.title !== option.title)
                        )
                      }
                      className="text-espresso/35 transition hover:text-terracotta"
                      aria-label={`Eliminar opción ${option.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <input
                value={optionTitle}
                onChange={(event) => setOptionTitle(event.target.value)}
                placeholder="Nombre de la opción"
                className="rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-terracotta"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={optionPrice}
                onChange={(event) => setOptionPrice(event.target.value)}
                placeholder="Precio"
                className="rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-terracotta"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-tonel px-4 py-2.5 text-xs font-bold text-cream transition hover:bg-tonel-deep"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-sand bg-white/70 p-5">
            <h2 className="font-display text-xl font-semibold text-tonel">
              Imagen
            </h2>
            <div className="relative mt-3 aspect-square overflow-hidden rounded-2xl border border-sand bg-gradient-to-br from-sand/60 to-cream">
              {img.trim() ? (
                <Image
                  src={img.trim()}
                  alt="Vista previa"
                  fill
                  sizes="320px"
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-espresso/30">
                  <ImageIcon className="h-8 w-8" />
                  <p className="mt-2 text-xs font-semibold">Sin imagen</p>
                </div>
              )}
            </div>
            <label
              className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tonel px-4 py-2.5 text-xs font-bold text-cream transition hover:bg-tonel-deep ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Subiendo..." : "Subir imagen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            <input
              value={img}
              onChange={(event) => setImg(event.target.value)}
              placeholder="URL de la imagen o /temporary/foto.png"
              className="mt-2 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-xs outline-none focus:border-terracotta"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-espresso/45">
              Sube un archivo (máx. 4 MB) o pega una URL. Las imágenes se
              guardan en Vercel Blob.
            </p>
          </section>

          <section className="rounded-3xl border border-sand bg-white/70 p-5">
            <h2 className="font-display text-xl font-semibold text-tonel">
              Publicación
            </h2>
            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-sand bg-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-tonel">Visible</p>
                  <p className="text-[11px] text-espresso/45">
                    Aparece en el menú.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(event) => setIsVisible(event.target.checked)}
                  className="h-5 w-5 accent-terracotta"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-sand bg-cream/50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-tonel">Destacado</p>
                  <p className="text-[11px] text-espresso/45">
                    Aparece en la página principal.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) => setIsFeatured(event.target.checked)}
                  className="h-5 w-5 accent-terracotta"
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
