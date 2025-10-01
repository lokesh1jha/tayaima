"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { CartSyncIndicator } from "@/components/cart/CartSyncIndicator";
import { CheckoutButton } from "@/components/cart/CheckoutButton";

export default function CartPage() {
  const { items, total, itemCount, isLoading, updateCartItem, removeFromCart } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      updateCartItem({ itemId, quantity: newQuantity });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      removeFromCart(itemId);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price / 100);
  };

  const formatUnit = (unit: string, amount: number) => {
    const unitMap: { [key: string]: string } = {
      PIECE: "piece",
      KG: "kg",
      G: "g",
      LITER: "L",
      ML: "ml",
      OTHER: "unit"
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      item.imageUrl.includes('.s3.') || item.imageUrl.includes('amazonaws.com') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.productId}`}
                      className="font-semibold text-lg hover:text-blue-600 transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatUnit(item.variantUnit, item.variantAmount)}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.maxStock || 999}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        disabled={updating === item.id}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= (item.maxStock || 999)}
                      >
                        +
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <CartSyncIndicator />
                <CheckoutButton className="w-full" />
                <Link href="/products" className="block">
                  <Button variant="secondary" className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
