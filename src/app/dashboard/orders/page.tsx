"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
  createdAt: string;
  items: OrderItem[];
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Track your order history and current orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Payment: {order.paymentMode}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Order Items ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {item.variant.product.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {item.variant.amount}{item.variant.unit} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatPrice(item.unitPrice)} each
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Total: {formatPrice(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex gap-2">
                <Link href={`/orders/${order.id}`} className="flex-1">
                  <Button className="w-full">View Details</Button>
                </Link>
                {order.status === "DELIVERED" && (
                  <Button variant="secondary" className="flex-1">
                    Reorder
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
