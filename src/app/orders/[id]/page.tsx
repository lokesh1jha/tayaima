"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { STORE_CONFIG, getStoreHoursDisplay } from "@/lib/storeConfig";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  variant: {
    id: string;
    unit: string;
    amount: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  };
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city?: string;
  pincode?: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMode: string;
  deliveryMethod?: "DELIVERY" | "PICKUP";
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        console.error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: "Order Pending",
      CONFIRMED: "Order Confirmed",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Delivery Method Badge */}
            {order.deliveryMethod && (
              <div className={`p-4 rounded-lg border-2 ${
                order.deliveryMethod === 'PICKUP' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{order.deliveryMethod === 'PICKUP' ? '🏪' : '🚚'}</span>
                  <div>
                    <p className={`font-semibold ${
                      order.deliveryMethod === 'PICKUP' 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-green-900 dark:text-green-100'
                    }`}>
                      {order.deliveryMethod === 'PICKUP' ? 'Store Pickup Order' : 'Home Delivery Order'}
                    </p>
                    <p className={`text-sm ${
                      order.deliveryMethod === 'PICKUP' 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {order.deliveryMethod === 'PICKUP' 
                        ? 'Pick up your order from our store' 
                        : 'Your order will be delivered to your address'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.deliveryMethod === 'PICKUP' ? (
              /* Pickup Information */
              <>
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                  <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                    📍 Pickup Location
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">{STORE_CONFIG.name}</p>
                      <p className="text-blue-800 dark:text-blue-200">{STORE_CONFIG.address.fullAddress}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Phone:</p>
                      <p className="text-blue-800 dark:text-blue-200">{STORE_CONFIG.contact.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Store Hours:</p>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        {getStoreHoursDisplay().map((hours, idx) => (
                          <p key={idx}>{hours}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
                  <h2 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                    ⚠️ Pickup Instructions
                  </h2>
                  <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <li>• Your order will be ready within 2-4 hours</li>
                    <li>• Please bring your Order ID: <strong>#{order.id.slice(-8)}</strong></li>
                    <li>• Bring a valid ID for verification</li>
                    <li>• Payment due at pickup (COD)</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {order.customerName}</p>
                    <p><span className="font-medium">Phone:</span> {order.phone}</p>
                  </div>
                </Card>
              </>
            ) : (
              /* Delivery Information */
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {order.customerName}</p>
                  <p><span className="font-medium">Phone:</span> {order.phone}</p>
                  <p><span className="font-medium">Address:</span> {order.address}</p>
                  {order.city && <p><span className="font-medium">City:</span> {order.city}</p>}
                  {order.pincode && <p><span className="font-medium">Pincode:</span> {order.pincode}</p>}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Payment Method:</span> {order.paymentMode}</p>
                <p><span className="font-medium">Total Amount:</span> {formatPrice(order.totalAmount)}</p>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <div className="w-16 h-16 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
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
                      <h3 className="font-medium line-clamp-2">
                        {item.variant.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatUnit(item.variant.unit, item.variant.amount)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.unitPrice)} each
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </Card>

            {/* Order Actions */}
            <div className="flex gap-4">
              <Link href="/products" className="flex-1">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button variant="secondary" className="w-full">View Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
