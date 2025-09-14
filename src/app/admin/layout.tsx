import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResponsiveAdminLayout from "@/components/ResponsiveAdminLayout";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <ResponsiveAdminLayout>
      {children}
    </ResponsiveAdminLayout>
  );
}
