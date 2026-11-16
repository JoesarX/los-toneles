import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  ids: string[];
  toggleFavorite: (id: string) => void;
};

export const useFavoritesStore = create(
  persist<FavoritesState>(
    (set) => ({
      ids: [],
      toggleFavorite: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((favoriteId) => favoriteId !== id)
            : [...state.ids, id],
        })),
    }),
    { name: "favorites", skipHydration: true }
  )
);
