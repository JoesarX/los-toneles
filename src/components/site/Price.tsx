"use client";

import { ProductType } from "@/types/types";
import { useCartStore } from "@/utils/store";
import { Banknote, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const Price = ({ product }: { product: ProductType }) => {
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const hasOptions = (product.options?.length ?? 0) > 0;
  const unitPrice = hasOptions
    ? product.options![selected].additionalPrice
    : product.price;
  const total = unitPrice * quantity;
  const optionTitle = hasOptions ? product.options![selected].title : undefined;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      title: product.title,
      img: product.img,
      price: unitPrice,
      subtotal: total,
      ...(optionTitle ? { optionTitle } : {}),
      quantity,
    });
    toast.success(`${product.title} agregado al carrito`);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-3">
        <span className="font-display text-4xl font-semibold text-tonel">
          L. {total.toFixed(2)}
        </span>
        {quantity > 1 && (
          <span className="pb-1 text-sm font-medium text-espresso/55">
            L. {unitPrice.toFixed(2)} c/u
          </span>
        )}
      </div>

      {hasOptions && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/50">
            Elige una opción
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.options!.map((option, index) => {
              const active = selected === index;
              return (
                <button
                  key={option.title}
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-pressed={active}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "border-tonel bg-tonel text-cream shadow-soft"
                      : "border-sand bg-white/60 text-tonel hover:border-tonel/40 hover:bg-sand/50"
                  }`}
                >
                  <span>{option.title}</span>
                  <span className={active ? "text-amber" : "text-espresso/55"}>
                    L. {option.additionalPrice.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center justify-between rounded-2xl border border-sand bg-white/60 px-2 py-2 sm:w-44">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-tonel transition hover:bg-sand disabled:opacity-40"
            disabled={quantity === 1}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center text-lg font-bold text-tonel">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-tonel transition hover:bg-sand"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-terracotta px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-deep"
        >
          <ShoppingBag className="h-4 w-4" />
          Agregar al carrito
        </button>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-espresso/55">
        <Banknote className="h-4 w-4 text-olive" />
        Pago en efectivo al recoger tu pedido en el local.
      </p>
    </div>
  );
};

export default Price;
