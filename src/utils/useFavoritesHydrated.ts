"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useFavoritesStore } from "./favorites";

const subscribe = (onStoreChange: () => void) =>
  useFavoritesStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useFavoritesStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export const useFavoritesHydrated = () => {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
