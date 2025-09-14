"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

interface DashboardStats {
  productsCount: number;
  ordersCount: number;
  customersCount: number;
  adminsCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Welcome to your TaYaima admin panel
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                Total Revenue
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 truncate">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 ml-3">
              <span className="text-lg sm:text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                Total Orders
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 truncate">
                {stats.ordersCount}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0 ml-3">
              <span className="text-lg sm:text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                Customers
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 truncate">
                {stats.customersCount}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full flex-shrink-0 ml-3">
              <span className="text-lg sm:text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                Products
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 truncate">
                {stats.productsCount}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full flex-shrink-0 ml-3">
              <span className="text-lg sm:text-2xl">📦</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Admin Users</h2>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full flex-shrink-0">
            <span className="text-base sm:text-lg">👨‍💼</span>
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-red-600">
          {stats.adminsCount}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
          Total admin users in the system
        </p>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Sales Chart */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Sales Trend (Last 7 Days)</h2>
          <div className="space-y-3">
            {stats.salesByDay.map((day, index) => {
              const maxSales = Math.max(...stats.salesByDay.map(d => d.sales));
              const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium w-8 sm:w-12 flex-shrink-0">
                      {formatDate(day.date)}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-semibold">
                      {formatPrice(day.sales)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.orders} orders
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Orders by Status */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {stats.ordersByStatus.map((status, index) => {
              const total = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (status.count / total) * 100 : 0;
              
              const statusColors: Record<string, string> = {
                PLACED: "bg-yellow-500",
                SHIPPED: "bg-blue-500",
                DELIVERED: "bg-green-500",
                CANCELLED: "bg-red-500",
              };

              return (
                <div key={index} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[status.status] || 'bg-gray-500'}`} />
                    <span className="text-xs sm:text-sm font-medium capitalize truncate">
                      {status.status.toLowerCase()}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${statusColors[status.status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold flex-shrink-0">
                    {status.count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Orders */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{order.customerName}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm sm:text-base">{formatPrice(order.totalAmount)}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {product.sales} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm sm:text-base">{formatPrice(product.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
