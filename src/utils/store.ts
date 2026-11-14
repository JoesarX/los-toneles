import { ActionTypes, CartItemType, CartType } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_STATE = {
  products: [],
  totalItems: 0,
  totalPrice: 0,
};

const itemKey = (item: CartItemType) =>
  item.optionTitle ? `${item.id}-${item.optionTitle}` : item.id;

const normalizeItem = (item: CartItemType): CartItemType => {
  const price = Number(item.price);
  const quantity = Number(item.quantity);
  const subtotal = Number(item.subtotal);
  const safePrice = Number.isFinite(price) ? price : 0;
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  return {
    ...item,
    price: safePrice,
    quantity: safeQuantity,
    subtotal: Number.isFinite(subtotal) ? subtotal : safePrice * safeQuantity,
  };
};

export const useCartStore = create(
  persist<CartType & ActionTypes>(
    (set, get) => ({
      products: INITIAL_STATE.products,
      totalItems: INITIAL_STATE.totalItems,
      totalPrice: INITIAL_STATE.totalPrice,
      addToCart(item) {
        const normalized = normalizeItem(item);
        const products = get().products;
        const uniqueIdentifier = itemKey(normalized);
        const productInState = products.find(
          (product) => uniqueIdentifier === itemKey(product)
        );

        if (productInState) {
          const existingQuantity = Number(productInState.quantity) || 0;
          const existingSubtotal = Number(productInState.subtotal) || 0;
          const updatedProducts = products.map((product) =>
            uniqueIdentifier === itemKey(product)
              ? {
                  ...normalized,
                  quantity: normalized.quantity + existingQuantity,
                  subtotal: normalized.subtotal + existingSubtotal,
                }
              : product
          );
          set((state) => ({
            products: updatedProducts,
            totalItems:
              Number(state.totalItems || 0) + normalized.quantity,
            totalPrice:
              Number(state.totalPrice || 0) + normalized.subtotal,
          }));
        } else {
          set((state) => ({
            products: [...state.products, normalized],
            totalItems:
              Number(state.totalItems || 0) + normalized.quantity,
            totalPrice:
              Number(state.totalPrice || 0) + normalized.subtotal,
          }));
        }
      },
      clearCart: () => set({ ...INITIAL_STATE }),
      removeFromCart(item) {
        const uniqueIdentifier = itemKey(item);

        set((state) => ({
          products: state.products.filter(
            (product) => uniqueIdentifier !== itemKey(product)
          ),
          totalItems:
            Number(state.totalItems || 0) - (Number(item.quantity) || 0),
          totalPrice:
            Number(state.totalPrice || 0) - (Number(item.subtotal) || 0),
        }));
      },
      plusOne(item) {
        const uniqueIdentifier = itemKey(item);

        set((state) => ({
          products: state.products.map((product) => {
            if (uniqueIdentifier !== itemKey(product)) return product;
            const quantity = Number(product.quantity) || 1;
            const subtotal = Number(product.subtotal) || 0;
            return {
              ...product,
              quantity: quantity + 1,
              subtotal: subtotal + subtotal / quantity,
            };
          }),
          totalItems: Number(state.totalItems || 0) + 1,
          totalPrice:
            Number(state.totalPrice || 0) +
            (Number(item.subtotal) || 0) / (Number(item.quantity) || 1),
        }));
      },
      minusOne(item) {
        const uniqueIdentifier = itemKey(item);

        set((state) => {
          const updatedProducts = state.products.map((product) => {
            if (uniqueIdentifier !== itemKey(product)) return product;
            const quantity = Number(product.quantity) || 1;
            const subtotal = Number(product.subtotal) || 0;
            return {
              ...product,
              quantity: quantity - 1,
              subtotal: subtotal - subtotal / quantity,
            };
          });

          return {
            products: updatedProducts.filter(
              (product) => Number(product.quantity) > 0
            ),
            totalItems: Number(state.totalItems || 0) - 1,
            totalPrice:
              Number(state.totalPrice || 0) -
              (Number(item.subtotal) || 0) / (Number(item.quantity) || 1),
          };
        });
      },
    }),
    { name: "cart", skipHydration: true }
  )
);
