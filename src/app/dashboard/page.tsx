import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  if (!session) redirect("/login");

  return (
    <div className="container py-8">
      <div className="flex gap-6">
        <DashboardSidebar />
        <div className="flex-1 grid gap-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "MRR", value: "$2,340" },
              { label: "Active users", value: "1,204" },
              { label: "Churn", value: "2.1%" },
            ].map((w) => (
              <Card key={w.label} className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">{w.label}</div>
                <div className="mt-2 text-2xl font-semibold">{w.value}</div>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h3 className="font-semibold">Getting started</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This is a placeholder dashboard. Extend with charts, tables, and KPIs. Hook up billing (Stripe) and
              subscriptions, add teams and permissions, and start shipping.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}