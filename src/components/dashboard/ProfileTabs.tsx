"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LoadingSection } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { ROUTES, NAV_ITEMS, UTILS } from "@/lib/constants";

type Props = {
  user: { id?: string; name?: string | null; email?: string | null };
};

const tabs = NAV_ITEMS.PROFILE;

export default function ProfileTabs({ user }: Props) {
  const initialTab = useMemo(() => UTILS.getCurrentProfileTab(), []);
  const [active, setActive] = useState<string>(initialTab);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name ?? "");
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const currentTab = UTILS.getCurrentProfileTab();
      setActive(currentTab);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check hash on mount (in case it changed after initial load)
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Load data when active tab changes
  useEffect(() => {
    if (active === "orders") loadOrders();
    if (active === "address") loadAddresses();
  }, [active]);

  const loadAddresses = async () => {
    try {
      setLoadingAddr(true);
      const res = await fetch(ROUTES.API.USER_ADDRESSES, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } finally {
      setLoadingAddr(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(ROUTES.API.USER_ORDERS, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // Auto-load when switching tabs
  useEffect(() => {
    if (active === "address") void loadAddresses();
    if (active === "orders") void loadOrders();
  }, [active]);

  const addAddress = async (form: HTMLFormElement) => {
    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
      line1: (form.elements.namedItem("line1") as HTMLInputElement)?.value,
      line2: (form.elements.namedItem("line2") as HTMLInputElement)?.value,
      city: (form.elements.namedItem("city") as HTMLInputElement)?.value,
      state: (form.elements.namedItem("state") as HTMLInputElement)?.value,
      pincode: (form.elements.namedItem("pincode") as HTMLInputElement)?.value,
    };
    const res = await fetch(ROUTES.API.USER_ADDRESSES, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setShowAddForm(false);
      await loadAddresses();
    }
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;
    const res = await fetch(ROUTES.API.USER_PROFILE, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nameInput.trim() }) });
    if (res.ok) setEditingName(false);
  };

  const saveAddress = async (form: HTMLFormElement, id: string) => {
    const payload = {
      id,
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
      line1: (form.elements.namedItem("line1") as HTMLInputElement)?.value,
      line2: (form.elements.namedItem("line2") as HTMLInputElement)?.value,
      city: (form.elements.namedItem("city") as HTMLInputElement)?.value,
      state: (form.elements.namedItem("state") as HTMLInputElement)?.value,
      pincode: (form.elements.namedItem("pincode") as HTMLInputElement)?.value,
    };
    const res = await fetch(ROUTES.API.USER_ADDRESSES, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setEditAddressId(null);
      await loadAddresses();
    }
  };

  const deleteAddress = async (id: string, addressName: string) => {
    if (!confirm(`Are you sure you want to delete the address "${addressName}"?`)) return;
    
    try {
      const res = await fetch(ROUTES.API.USER_ADDRESSES, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id }) 
      });
      
      if (res.ok) {
        toast.success("Address deleted successfully");
        await loadAddresses();
      } else {
        const error = await res.text();
        toast.error(`Failed to delete address: ${error}`);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
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

  const cancelOrder = async (orderId: string) => {
    const reason = prompt("Enter cancellation reason (optional):");
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      const res = await fetch(ROUTES.API.ORDER_CANCEL(orderId), { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (res.ok) {
        toast.success("Order cancelled successfully");
        await loadOrders(); // Refresh orders
      } else {
        const error = await res.text();
        toast.error(error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActive(t.key); UTILS.navigateToProfileTab(t.key); }}
            className={`px-3 py-2 text-sm rounded-md border transition ${
              active === t.key
                ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "orders" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Orders</h2>
          {loadingOrders ? (
            <LoadingSection message="Loading orders..." />
          ) : orders.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300 mt-3">No orders yet.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded border border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">Order #{o.id.slice(-6)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm">
                        {o.items?.length ?? 0} items • {formatPrice(o.totalAmount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs capitalize px-2 py-1 rounded ${
                        o.status === "CANCELLED" 
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          : o.status === "DELIVERED"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        {o.status.toLowerCase()}
                      </div>
                      {o.status === "PLACED" && (
                        <Button 
                          variant="ghost" 
                          onClick={() => cancelOrder(o.id)}
                          className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedOrderId(selectedOrderId === o.id ? null : o.id)}
                      >
                        {selectedOrderId === o.id ? "Hide" : "Details"}
                      </Button>
                    </div>
                  </div>
                  
                  {selectedOrderId === o.id && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid gap-3 text-sm">
                        <div>
                          <div className="font-medium mb-1">Delivery Address:</div>
                          <div className="text-gray-600 dark:text-gray-300">
                            {o.customerName}<br />
                            {o.phone}<br />
                            {o.address}<br />
                            {o.city} {o.pincode}
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2">Items:</div>
                          <div className="grid gap-2">
                            {o.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <div>
                                  <div className="font-medium">{item.variant?.product?.name}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">
                                    {formatUnit(item.variant?.unit, item.variant?.amount)} × {item.quantity}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{formatPrice(item.total)}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">
                                    {formatPrice(item.unitPrice)} each
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="font-medium">Payment Method:</div>
                          <div className="text-gray-600 dark:text-gray-300">{o.paymentMode}</div>
                        </div>
                        
                        <div className="flex justify-between items-center font-semibold">
                          <div>Total Amount:</div>
                          <div>{formatPrice(o.totalAmount)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {active === "address" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Address</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between items-center">
              <div className="text-gray-600 dark:text-gray-300">Manage your delivery addresses.</div>
              <Button onClick={() => setShowAddForm(true)}>Add Address</Button>
            </div>
            <div>
              <Button variant="secondary" onClick={loadAddresses}>Refresh</Button>
            </div>
            {loadingAddr ? (
              <LoadingSection message="Loading addresses..." />
            ) : addresses.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">No address on file.</div>
            ) : (
              <div className="grid gap-3">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{a.name || "Address"}</div>
                        <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
                        <div>{a.city}{a.state ? `, ${a.state}` : ""} {a.pincode || ""}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setEditAddressId(a.id)}>Edit</Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => deleteAddress(a.id, a.line1)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {editAddressId === a.id && (
                      <form
                        className="mt-3 grid gap-2"
                        onSubmit={async (e) => { e.preventDefault(); await saveAddress(e.currentTarget as HTMLFormElement, a.id); }}
                      >
                        <input name="name" defaultValue={a.name ?? ""} placeholder="Name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        <input name="phone" defaultValue={a.phone ?? ""} placeholder="Phone" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        <input name="line1" defaultValue={a.line1 ?? ""} placeholder="Address Line 1 *" required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        <input name="line2" defaultValue={a.line2 ?? ""} placeholder="Address Line 2" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input name="city" defaultValue={a.city ?? ""} placeholder="City *" required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                          <input name="state" defaultValue={a.state ?? ""} placeholder="State" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                          <input name="pincode" defaultValue={a.pincode ?? ""} placeholder="Pincode" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">Save</Button>
                          <Button variant="ghost" type="button" onClick={() => setEditAddressId(null)}>Cancel</Button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddForm && (
            <div className="mt-6">
              <form
                className="grid gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await addAddress(e.currentTarget);
                  e.currentTarget.reset();
                }}
              >
                <input name="name" placeholder="Name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                <input name="phone" placeholder="Phone" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                <input name="line1" placeholder="Address Line 1 *" required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                <input name="line2" placeholder="Address Line 2" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input name="city" placeholder="City *" required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                  <input name="state" placeholder="State" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                  <input name="pincode" placeholder="Pincode" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      )}

      {active === "personal" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Personal Details</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div>
              <span className="font-medium">Email:</span> {user.email ?? "-"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Name:</span>
              {editingName ? (
                <>
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                  <Button variant="secondary" onClick={saveName}>Save</Button>
                  <Button variant="ghost" onClick={() => { setEditingName(false); setNameInput(user.name ?? ""); }}>Cancel</Button>
                </>
              ) : (
                <>
                  <span>{user.name ?? "-"}</span>
                  <Button variant="secondary" onClick={() => setEditingName(true)}>Edit</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {active === "settings" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div>Notification preferences, privacy, and more will appear here.</div>
            <Button variant="secondary" className="w-max">Open Settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}


