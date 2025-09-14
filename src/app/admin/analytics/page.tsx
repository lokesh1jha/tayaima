"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // For now, we'll use mock data since we don't have analytics endpoints yet
      // In a real app, you'd fetch from /api/admin/analytics
      setAnalytics({
        totalRevenue: 125000,
        totalOrders: 156,
        totalCustomers: 89,
        averageOrderValue: 801,
        revenueByMonth: [
          { month: "Jan", revenue: 15000 },
          { month: "Feb", revenue: 18000 },
          { month: "Mar", revenue: 22000 },
          { month: "Apr", revenue: 25000 },
          { month: "May", revenue: 28000 },
          { month: "Jun", revenue: 17000 },
        ],
        ordersByStatus: [
          { status: "DELIVERED", count: 120 },
          { status: "SHIPPED", count: 25 },
          { status: "PENDING", count: 8 },
          { status: "CANCELLED", count: 3 },
        ],
        topProducts: [
          { name: "Fresh Tomatoes", sales: 45, revenue: 2250 },
          { name: "Milk 1L", sales: 38, revenue: 1900 },
          { name: "Bread Loaf", sales: 32, revenue: 640 },
          { name: "Basmati Rice", sales: 28, revenue: 1680 },
          { name: "Onions", sales: 25, revenue: 750 },
        ],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Unable to load analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">
          There was an error loading the analytics data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Insights into your store's performance and customer behavior
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(analytics.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics.totalOrders}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Customers
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Avg Order Value
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(analytics.averageOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue by Month
          </h3>
          <div className="space-y-3">
            {analytics.revenueByMonth.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.month}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.revenue / Math.max(...analytics.revenueByMonth.map(r => r.revenue))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                    {formatPrice(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders by Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Orders by Status
          </h3>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === "DELIVERED"
                          ? "bg-green-600"
                          : item.status === "SHIPPED"
                          ? "bg-blue-600"
                          : item.status === "PENDING"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                      style={{
                        width: `${(item.count / Math.max(...analytics.ordersByStatus.map(o => o.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Products
        </h3>
        <div className="space-y-3">
          {analytics.topProducts.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {product.sales} sales
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(product.revenue)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
