"use client";

import { useFavoritesStore } from "@/utils/favorites";
import { useFavoritesHydrated } from "@/utils/useFavoritesHydrated";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  productId: string;
  productTitle: string;
  className?: string;
};

const FavoriteButton = ({
  productId,
  productTitle,
  className = "",
}: Props) => {
  const hydrated = useFavoritesHydrated();
  const isFavorite = useFavoritesStore((state) =>
    state.ids.includes(productId)
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const active = hydrated && isFavorite;

  const handleToggle = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(productId);
    toast.info(
      active
        ? `${productTitle} eliminado de favoritos`
        : `${productTitle} agregado a favoritos`
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      title={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-cream/95 text-terracotta shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition ${active ? "fill-terracotta" : ""}`}
      />
    </button>
  );
};

export default FavoriteButton;
