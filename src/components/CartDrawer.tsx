"use client";

import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CartItemQuantity } from "@/components/cart/CartItemQuantity";
import { CartSyncIndicator } from "@/components/cart/CartSyncIndicator";
import { CheckoutButton } from "@/components/cart/CheckoutButton";

interface CartDrawerProps {
  isOpen: boolean;
  closeCart: () => void;
}

export default function CartDrawer({ isOpen, closeCart }: CartDrawerProps) {
  const { items, total, itemCount, isLoading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p / 100);

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
          "absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-black shadow-xl " +
          "transition-transform " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={closeCart} aria-label="Close" className="text-2xl">×</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded">
                    <Image
                      src={item.imageUrl || "/placeholder-product.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{item.productName}</div>
                    <div className="text-xs text-gray-500">
                      {item.variantAmount} {item.variantUnit}
                    </div>
                    <div className="mt-2">
                      <CartItemQuantity
                        itemId={item.id}
                        productId={item.productId}
                        variantId={item.variantId}
                        currentQuantity={item.quantity}
                        productName={item.productName}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
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
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <CartSyncIndicator />
          {session ? (
            <CheckoutButton className="w-full" />
          ) : (
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => {
                  closeCart();
                  router.push("/login");
                }}
              >
                Login to Checkout
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => {
                  closeCart();
                  router.push("/signup");
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
