"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./catalog";
type Item = { product: Product; quantity: number };
export const useCart = create<{
  items: Item[];
  favorites: string[];
  add: (p: Product) => void;
  quantity: (id: string, n: number) => void;
  clear: () => void;
  favorite: (id: string) => void;
}>()(
  persist(
    (set) => ({
      items: [],
      favorites: [],
      add: (p) =>
        set((s) => {
          const found = s.items.find((i) => i.product.id === p.id);
          return {
            items: found
              ? s.items.map((i) =>
                  i.product.id === p.id
                    ? {
                        product: p,
                        quantity: Math.min(p.stock, i.quantity + 1),
                      }
                    : i,
                )
              : [...s.items, { product: p, quantity: 1 }],
          };
        }),
      quantity: (id, n) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.product.id === id
                ? { ...i, quantity: Math.min(i.product.stock, Math.max(0, n)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      favorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
    }),
    { name: "infiniti-seller-cart-v1" },
  ),
);
