"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  variant: {
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
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      // For now, we'll remove and re-add the item with new quantity
      // In a real app, you'd have a PATCH endpoint for this
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast.error("Session expired. Please refresh the page.");
        return;
      }

      // Remove the item
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId }),
      });

      // Add it back with new quantity
      if (newQuantity > 0) {
        const item = cart?.items.find(i => i.id === itemId);
        if (item) {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              variantId: item.variant.id,
              qty: newQuantity,
            }),
          });
        }
      }

      await fetchCart();
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Error updating quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast.error("Session expired. Please refresh the page.");
        return;
      }

      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId }),
      });

      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Error removing item");
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

  const getTotalPrice = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const getTotalItems = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
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

  if (!cart || cart.items.length === 0) {
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
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {item.variant.product.images.length > 0 ? (
                      <Image
                        src={item.variant.product.images[0]}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.variant.product.slug}`}
                      className="font-semibold text-lg hover:text-blue-600 transition-colors"
                    >
                      {item.variant.product.name}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatUnit(item.variant.unit, item.variant.amount)}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(item.unitPrice)}
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
                        max={item.variant.stock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        disabled={updating === item.id}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.variant.stock}
                      >
                        +
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
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
                  <span>Items ({getTotalItems()})</span>
                  <span>{formatPrice(getTotalPrice())}</span>
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
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
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
