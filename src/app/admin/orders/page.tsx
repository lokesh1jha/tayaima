"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

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
  status: "PLACED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMode: string;
  cancellationReason?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    setStatusUpdateLoading(orderId);
    try {
      const payload: { status: string; cancellationReason?: string } = { status };
      if (status === "CANCELLED" && reason) {
        payload.cancellationReason = reason;
      }
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        toast.success(`Order status updated to ${status.toLowerCase()}`);
      } else {
        const error = await response.text();
        toast.error(`Failed to update order: ${error}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error updating order");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === "CANCELLED") {
      const reason = prompt("Enter cancellation reason (optional):");
      if (confirm(`Are you sure you want to cancel this order?`)) {
        updateOrderStatus(orderId, newStatus, reason || undefined);
      }
    } else {
      updateOrderStatus(orderId, newStatus, undefined);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedOrders.size === 0) {
      toast.error("No orders selected");
      return;
    }

    let reason: string | undefined;
    if (status === "CANCELLED") {
      reason = prompt("Enter cancellation reason (optional):") || undefined;
      if (!confirm(`Are you sure you want to cancel ${selectedOrders.size} orders?`)) {
        return;
      }
    }

    try {
      const promises = Array.from(selectedOrders).map(orderId => {
        const payload: { status: string; cancellationReason?: string } = { status };
        if (status === "CANCELLED" && reason) {
          payload.cancellationReason = reason;
        }
        
        return fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      });

      await Promise.all(promises);
      await fetchOrders();
      setSelectedOrders(new Set());
      toast.success(`${selectedOrders.size} orders updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Error bulk updating orders:", error);
      toast.error("Error updating orders");
    }
  };

  const printOrders = () => {
    if (selectedOrders.size === 0) {
      toast.error("No orders selected");
      return;
    }

    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    const printContent = generatePrintContent(selectedOrdersData);
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (ordersToPrint: Order[]) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .order { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
          .order-header { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          .order-details { margin-bottom: 15px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { font-weight: bold; text-align: right; margin-top: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Order Details - ${new Date().toLocaleDateString()}</h1>
        ${ordersToPrint.map(order => `
          <div class="order">
            <div class="order-header">Order #${order.id.slice(-6)} - ${order.status}</div>
            <div class="order-details">
              <strong>Customer:</strong> ${order.customerName}<br>
              <strong>Phone:</strong> ${order.phone}<br>
              <strong>Address:</strong> ${order.address}${order.city ? `, ${order.city}` : ''}${order.pincode ? ` ${order.pincode}` : ''}<br>
              <strong>Payment:</strong> ${order.paymentMode}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}
              ${order.cancellationReason ? `<br><strong>Cancellation Reason:</strong> ${order.cancellationReason}` : ''}
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.variant.product.name} (${item.variant.amount}${item.variant.unit})</td>
                    <td>${item.quantity}</td>
                    <td>₹${(item.unitPrice / 100).toFixed(2)}</td>
                    <td>₹${(item.total / 100).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">Total: ₹${(order.totalAmount / 100).toFixed(2)}</div>
            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; font-style: italic; color: #666;">
              Thanks for ordering from Kirana Store
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "status-placed";
      case "SHIPPED": return "status-shipped";
      case "DELIVERED": return "status-delivered";
      case "CANCELLED": return "status-cancelled";
      default: return "badge-primary";
    }
  };

  if (loading) {
    return <LoadingPage message="Loading orders..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        
        {selectedOrders.size > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={() => bulkUpdateStatus("SHIPPED")} 
              variant="warning"
              disabled={!Array.from(selectedOrders).some(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "PLACED";
              })}
            >
              Mark Shipped ({Array.from(selectedOrders).filter(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "PLACED";
              }).length})
            </Button>
            <Button 
              onClick={() => bulkUpdateStatus("DELIVERED")} 
              variant="success"
              disabled={!Array.from(selectedOrders).some(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "SHIPPED";
              })}
            >
              Mark Delivered ({Array.from(selectedOrders).filter(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "SHIPPED";
              }).length})
            </Button>
            <Button 
              onClick={() => bulkUpdateStatus("CANCELLED")} 
              variant="error"
              disabled={!Array.from(selectedOrders).some(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "PLACED" || order?.status === "SHIPPED";
              })}
            >
              Cancel Orders ({Array.from(selectedOrders).filter(id => {
                const order = filteredOrders.find(o => o.id === id);
                return order?.status === "PLACED" || order?.status === "SHIPPED";
              }).length})
            </Button>
            <Button onClick={printOrders} variant="accent">
              Print Selected ({selectedOrders.size})
            </Button>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setSelectedOrders(new Set()); // Clear selections when filtering
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
        >
          <option value="ALL">All Orders ({orders.length})</option>
          <option value="PLACED">Placed ({orders.filter(o => o.status === "PLACED").length})</option>
          <option value="SHIPPED">Shipped ({orders.filter(o => o.status === "SHIPPED").length})</option>
          <option value="DELIVERED">Delivered ({orders.filter(o => o.status === "DELIVERED").length})</option>
          <option value="CANCELLED">Cancelled ({orders.filter(o => o.status === "CANCELLED").length})</option>
        </select>
        
        {statusFilter !== "ALL" && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredOrders.length} {statusFilter.toLowerCase()} orders
          </span>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No orders found.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
              onChange={selectAllOrders}
              className="rounded"
            />
            <label className="text-sm font-medium">
              Select All ({filteredOrders.length} orders)
            </label>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="mt-1 rounded"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Order #{order.id.slice(-6)}</span>
                        <span className={getStatusColor(order.status)}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <div><strong>Customer:</strong> {order.customerName}</div>
                        <div><strong>Phone:</strong> {order.phone}</div>
                        <div><strong>Total:</strong> {formatPrice(order.totalAmount)}</div>
                        <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                        {order.cancellationReason && (
                          <div><strong>Cancellation Reason:</strong> {order.cancellationReason}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedOrderDetails(selectedOrderDetails === order.id ? null : order.id)}
                    >
                      {selectedOrderDetails === order.id ? "Hide" : "Details"}
                    </Button>

                    {order.status === "PLACED" && (
                      <>
                        <Button
                          variant="warning"
                          onClick={() => handleStatusChange(order.id, "SHIPPED")}
                          disabled={statusUpdateLoading === order.id}
                        >
                          Ship
                        </Button>
                        <Button
                          variant="error"
                          onClick={() => handleStatusChange(order.id, "CANCELLED")}
                          disabled={statusUpdateLoading === order.id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {order.status === "SHIPPED" && (
                      <>
                        <Button
                          variant="success"
                          onClick={() => handleStatusChange(order.id, "DELIVERED")}
                          disabled={statusUpdateLoading === order.id}
                        >
                          Deliver
                        </Button>
                        <Button
                          variant="error"
                          onClick={() => handleStatusChange(order.id, "CANCELLED")}
                          disabled={statusUpdateLoading === order.id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                        No actions available
                      </span>
                    )}
                  </div>
                </div>

                {selectedOrderDetails === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2">Delivery Address</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {order.address}
                          {order.city && <><br />{order.city}</>}
                          {order.pincode && <> {order.pincode}</>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Payment</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Method: {order.paymentMode}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                              <div className="font-medium">{item.variant.product.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {item.variant.amount}{item.variant.unit} × {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatPrice(item.total)}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {formatPrice(item.unitPrice)} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}