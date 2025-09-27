"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      const data = await response.json();
      setUsers(data.customers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading users..." />;
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <Card className="p-4">
        <div className="grid gap-2 text-sm">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex justify-between border-b last:border-b-0 border-gray-200 dark:border-gray-800 py-2">
                <div className="font-medium">{u.name || "Unnamed"}</div>
                <div className="text-gray-600 dark:text-gray-300">{u.email}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
