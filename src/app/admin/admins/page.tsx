"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/admins");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      } else {
        toast.error("Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingAdmin(true);

    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast.success("Admin added successfully!");
        setShowAddForm(false);
        fetchAdmins();
        form.reset();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Admin deleted successfully!");
        fetchAdmins();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  };

  if (loading) {
    return <LoadingPage message="Loading admins..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage admin users who have access to the admin panel
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          + Add Admin
        </Button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Admin</h2>
            <Button
              variant="ghost"
              onClick={() => setShowAddForm(false)}
            >
              ✕
            </Button>
          </div>
          
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password *
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Enter secure password"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={addingAdmin}
              >
                {addingAdmin ? "Adding..." : "Add Admin"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Admins
              </p>
              <p className="text-3xl font-bold text-red-600">
                {admins.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <span className="text-2xl">👨‍💼</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Active Today
              </p>
              <p className="text-3xl font-bold text-green-600">
                {admins.filter(admin => {
                  const today = new Date().toDateString();
                  return new Date(admin.createdAt).toDateString() === today;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Recent Additions
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {admins.filter(admin => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(admin.createdAt) > weekAgo;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Admin Users</h2>
        
        {admins.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No admin users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                    Admin Details
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {admin.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        variant="error"
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        className="text-xs px-3 py-1"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
