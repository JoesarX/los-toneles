"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCartStore } from "./store";

const subscribe = (onStoreChange: () => void) =>
  useCartStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useCartStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export const useCartHydrated = () => {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
