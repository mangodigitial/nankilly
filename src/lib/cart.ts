"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // unique combo of product+options
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  category: string;
  unitPrice: number; // pence
  quantity: number;
  sizeName?: string;
  fabricName?: string;
  personalisation?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
  count: () => number;
}

function makeId(item: Omit<CartItem, "id">) {
  return [item.productId, item.sizeName, item.fabricName, item.personalisation]
    .filter(Boolean)
    .join("-");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = makeId(item);
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        })),

      clearCart: () => set({ items: [] }),

      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      deliveryFee: () => 599, // flat £5.99
      total: () => get().subtotal() + get().deliveryFee(),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "nankilly-cart" }
  )
);
