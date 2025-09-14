"use client";

import React, { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  const { status } = useSession();
  const router = useRouter();

  const totalPaise = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;
  }, [cart]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p / 100);

  const handleCheckout = () => {
    closeCart();
    if (status === "authenticated") {
      router.push("/checkout");
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      className={
        "fixed inset-0 z-50 transition" +
        (isOpen ? " visible" : " invisible")
      }
      aria-hidden={!isOpen}
    >
      <div
        className={
          "absolute inset-0 bg-black/40 transition-opacity " +
          (isOpen ? "opacity-100" : "opacity-0")
        }
        onClick={closeCart}
      />
      <aside
        className={
          "absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl " +
          "transition-transform " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={closeCart} aria-label="Close" className="text-2xl">×</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-200px)]">
          {!cart ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : cart?.items.length ? (
            cart.items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded">
                    <Image
                      src={item.variant.product.images?.[0] || "/placeholder-product.jpg"}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{item.variant.product.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.variant.amount} {item.variant.unit}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <div className="w-8 text-center">{item.quantity}</div>
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">Your cart is empty</Card>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between text-base">
            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
            <span className="font-semibold">{formatPrice(totalPaise)}</span>
          </div>
          <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
        </div>
      </aside>
    </div>
  );
}
