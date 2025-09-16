/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export type CartProductVariant = {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
};

export type CartItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  variant: CartProductVariant;
  createdAt?: string;
};

export type CartState = {
  id?: string;
  sessionId: string;
  items: CartItem[];
  updatedAt?: string;
};

type CartContextValue = {
  cart: CartState | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_ITEMS_KEY = "cartItems";
const CART_SESSION_ID_KEY = "sessionId";

function ensureSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(CART_SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const sessionId = ensureSessionId();
    // Load items from localStorage optimistically
    try {
      const cached = localStorage.getItem(CART_ITEMS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCart({ sessionId, items: parsed.items || [] });
      } else {
        setCart({ sessionId, items: [] });
      }
    } catch {
      setCart({ sessionId, items: [] });
    }
  }, []);

  // When user becomes authenticated, sync local cart items to server
  useEffect(() => {
    if (status !== "authenticated" || !cart) return;

    const sync = async () => {
      try {
        const sessionId = cart.sessionId || ensureSessionId();
        // Push all local items to server (server should merge/aggregate)
        for (const item of cart.items) {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, variantId: item.variant.id, qty: item.quantity }),
          });
        }
        // toast.success("Cart synced"); // disabled per request
      } catch {
        // ignore sync errors to avoid blocking UI
      }
    };
    void sync();
  }, [status, cart]);

  const persist = (next: CartState) => {
    setCart(next);
    try {
      localStorage.setItem(CART_ITEMS_KEY, JSON.stringify({ items: next.items }));
    } catch {
      // ignore
    }
  };

  const refresh = async () => {
    // No GET endpoint; rely on localStorage snapshot
    try {
      const sessionId = cart?.sessionId || ensureSessionId();
      const cached = localStorage.getItem(CART_ITEMS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCart({ sessionId, items: parsed.items || [] });
      }
    } catch {
      // ignore
    }
  };

  const addItem = async (variantId: string, quantity: number = 1) => {
    const sessionId = cart?.sessionId || ensureSessionId();
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, variantId, qty: quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      const data = await res.json();
      const items = data.items || data.cart?.items || [];
      persist({ sessionId, items });
      // Keep drawer closed per UX request
      // toast.success("Added to cart");
    } catch (e: any) {
      toast.error(e?.message || "Could not add to cart");
    }
  };

  const removeItem = async (itemId: string) => {
    const sessionId = cart?.sessionId || ensureSessionId();
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      const data = await res.json();
      const items = data.items || data.cart?.items || [];
      persist({ sessionId, items });
      toast.success("Removed item");
    } catch (e: any) {
      toast.error(e?.message || "Could not remove item");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId);
    const sessionId = cart?.sessionId || ensureSessionId();
    const variantId = cart?.items.find(i => i.id === itemId)?.variant.id;
    if (!variantId) return;
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId }),
      });
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, variantId, qty: quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      const data = await res.json();
      const items = data.items || data.cart?.items || [];
      persist({ sessionId, items });
      toast.success("Quantity updated");
    } catch (e: any) {
      toast.error(e?.message || "Could not update quantity");
    }
  };

  const clearCart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_ITEMS_KEY);
      localStorage.removeItem(CART_SESSION_ID_KEY);
    }
    setCart(null);
  };

  const value = useMemo<CartContextValue>(() => ({
    cart,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    updateQuantity,
    refresh,
    clearCart,
  }), [cart, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
