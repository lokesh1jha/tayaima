"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      month: "short",
      day: "numeric",
    });
  };

  const getTotalSpent = (orders: any[]) => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
          Customers
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your customer base and view customer information
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm ? "Try adjusting your search terms" : "No customers have registered yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {customer.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {customer.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined on {formatDate(customer.createdAt)}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(getTotalSpent(customer.orders))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Spent
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.orders.length} orders
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              {customer.orders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {customer.orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
