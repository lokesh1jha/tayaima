"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { AlertModal } from "@/components/ui/Modal";
import { CheckoutSkeleton } from "@/components/ui/CheckoutSkeleton";
import { useCart } from "@/hooks/useCart";
import { useCheckoutSync } from "@/hooks/useCheckoutSync";
import { ROUTES } from "@/lib/constants";
import { getOrCreateSessionId } from "@/lib/sessionId";
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

interface Address {
  id: string;
  name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  pincode?: string;
  isDefault: boolean;
}

interface OrderForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMode: "COD" | "PHONEPE";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, itemCount, clearCart, isLoading, mounted: cartMounted } = useCart();
  const { canProceedToCheckout } = useCheckoutSync();
  const [loading, setLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [form, setForm] = useState<OrderForm>({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMode: "COD",
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await fetch(ROUTES.API.USER_ADDRESSES);
      if (response.ok) {
        const data = await response.json();
        const addressList = data.addresses || [];
        setAddresses(addressList);
        if (addressList.length > 0) {
          const defaultAddr = addressList.find((a: Address) => a.isDefault) || addressList[0];
          setSelectedAddressId(defaultAddr.id);
          populateFormFromAddress(defaultAddr);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching addresses:", error);
      }
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const fetchCheckoutData = useCallback(async () => {
    const promises = [];
    
    if (session) {
      promises.push(fetchAddresses());
    } else {
      // If no session, addresses loading is complete
      setAddressesLoading(false);
    }
    
    // Execute all API calls in parallel
    await Promise.allSettled(promises);
    
    // Set overall loading to false when both are done
    setLoading(false);
  }, [session, fetchAddresses]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  // Redirect to cart if empty or not logged in
  useEffect(() => {
    // Only redirect after cart is mounted and loaded
    if (!cartMounted || isLoading) {
      return;
    }

    if (!items || items.length === 0) {
      console.log('Checkout: Redirecting to cart - no items found');
      router.push("/cart");
      return;
    }

    if (!session) {
      console.log('Checkout: Redirecting to login - not authenticated');
      router.push("/login");
    }
  }, [items, isLoading, router, session, cartMounted]);

  const populateFormFromAddress = (address: Address) => {
    setForm(prev => ({
      ...prev,
      name: address.name || prev.name,
      phone: address.phone || prev.phone,
      address: `${address.line1}${address.line2 ? `, ${address.line2}` : ""}`,
      city: address.city,
      pincode: address.pincode || "",
    }));
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      populateFormFromAddress(address);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || items.length === 0) return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const sessionId = `user_${session.user.id}`;

      const orderData = {
        sessionId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        paymentMode: form.paymentMode,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(ROUTES.API.ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        
        // Save the address if user is logged in and selected an address
        if (session && selectedAddressId) {
          const selectedAddress = addresses.find(a => a.id === selectedAddressId);
          if (selectedAddress) {
            // Address is already saved, no need to create new one
          }
        }
        
        // Show success notification
        toast.success(`Order placed successfully! Order ID: ${order.id}`, {
          duration: 5000,
        });
        
        clearCart();
        
        // Redirect to orders page instead of order detail
        router.push(ROUTES.PROFILE_ORDERS);
      } else {
        const error = await response.text();
        setErrorModal({
          isOpen: true,
          title: "Order Failed",
          message: `Order failed: ${error}`,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorModal({
        isOpen: true,
        title: "Error",
        message: "Error placing order. Please try again.",
      });
    } finally {
      setSubmitting(false);
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
    return total;
  };

  const getTotalItems = () => {
    return itemCount;
  };

  if (loading || isLoading || !cartMounted) {
    return <CheckoutSkeleton />;
  }

  if (!session) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need to be logged in to place an order. Please log in to continue with checkout.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button variant="secondary" onClick={() => router.push("/signup")}>
              Sign Up
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please add some items to your cart before checkout.
          </p>
          <Button onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                {session ? (
                  <>
                    {addresses.length > 0 ? (
                      <>
                        <div>
                          <label htmlFor="addressSelect" className="block text-sm font-medium mb-1">
                            Select Delivery Address *
                          </label>
                          <select
                            id="addressSelect"
                            value={selectedAddressId}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
                            required
                          >
                            <option value="">-- Select an address --</option>
                            {addresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.name ? `${addr.name} - ` : ""}{addr.line1}, {addr.city}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push(ROUTES.PROFILE_ADDRESS)}
                          >
                            Add New Address
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push(ROUTES.PROFILE_ADDRESS)}
                          >
                            Manage Addresses
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          No delivery addresses found. Please add an address to continue.
                        </p>
                        <Button
                          type="button"
                          onClick={() => router.push(ROUTES.PROFILE_ADDRESS)}
                        >
                          Add Delivery Address
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Please sign in to continue with checkout.
                    </p>
                    <Button
                      type="button"
                      onClick={() => router.push(ROUTES.LOGIN)}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="COD"
                    checked={form.paymentMode === "COD"}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value as "COD" | "PHONEPE" })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Pay when your order is delivered
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="PHONEPE"
                    disabled
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">PhonePe (Coming Soon)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Digital payment option will be available soon
                    </div>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
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
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {formatUnit(item.variantUnit, item.variantAmount)} × {item.quantity}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
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

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={submitting || !selectedAddressId || !canProceedToCheckout}
              >
                {submitting ? "Placing Order..." : !selectedAddressId ? "Select Address to Continue" : "Place Order"}
              </Button>
            </Card>
          </div>
        </form>
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
      />
    </div>
  );
}
