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
import { STORE_CONFIG, getStoreHoursDisplay } from "@/lib/storeConfig";

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
  email: string;
  address: string;
  city: string;
  pincode: string;
  paymentMode: "COD" | "PHONEPE";
  deliveryMethod: "DELIVERY" | "PICKUP";
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
    email: "",
    address: "",
    city: "",
    pincode: "",
    paymentMode: "COD",
    deliveryMethod: "DELIVERY",
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

  // Initialize form with session data when available
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);

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
        phone: form.deliveryMethod === "PICKUP" ? form.email : form.phone, // Use email for pickup, phone for delivery
        address: form.deliveryMethod === "PICKUP" ? STORE_CONFIG.address.fullAddress : form.address,
        city: form.deliveryMethod === "PICKUP" ? STORE_CONFIG.address.city : form.city,
        pincode: form.deliveryMethod === "PICKUP" ? STORE_CONFIG.address.pincode : form.pincode,
        paymentMode: form.paymentMode,
        deliveryMethod: form.deliveryMethod,
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
            {/* Delivery Method Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="DELIVERY"
                    checked={form.deliveryMethod === "DELIVERY"}
                    onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value as "DELIVERY" | "PICKUP" })}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">🚚 Home Delivery</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Get your order delivered to your doorstep
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Free delivery on all orders
                    </div>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="PICKUP"
                    checked={form.deliveryMethod === "PICKUP"}
                    onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value as "DELIVERY" | "PICKUP" })}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">🏪 Pick up from Store</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Collect your order from our store
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Ready for pickup within 2-4 hours
                    </div>
                  </div>
                </label>
              </div>

              {/* Store Information for Pickup */}
              {form.deliveryMethod === "PICKUP" && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📍 Store Address:
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    {STORE_CONFIG.address.fullAddress}
                  </p>
                  
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📞 Contact:
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Phone: {STORE_CONFIG.contact.phone}
                  </p>
                  
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    🕒 Store Hours:
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {getStoreHoursDisplay().map((hours, idx) => (
                      <p key={idx}>{hours}</p>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ Please bring your Order ID when picking up your order
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {form.deliveryMethod === "DELIVERY" ? "Shipping Information" : "Contact Information"}
              </h2>
              
              <div className="space-y-4">
                {form.deliveryMethod === "PICKUP" ? (
                  /* For pickup orders, just need name and email */
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💡 You'll receive an order confirmation with pickup details via email
                      </p>
                    </div>
                  </div>
                ) : (
                  /* For delivery orders, need full address */
                  <>
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
                  </>
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
                disabled={
                  submitting || 
                  (form.deliveryMethod === "DELIVERY" && !selectedAddressId) ||
                  (form.deliveryMethod === "PICKUP" && (!form.name || !form.email)) ||
                  !canProceedToCheckout
                }
              >
                {submitting 
                  ? "Placing Order..." 
                  : form.deliveryMethod === "DELIVERY" && !selectedAddressId
                  ? "Select Address to Continue"
                  : form.deliveryMethod === "PICKUP" && (!form.name || !form.email)
                  ? "Enter Name and Email"
                  : form.deliveryMethod === "PICKUP"
                  ? "Confirm Pickup Order"
                  : "Place Order"
                }
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
