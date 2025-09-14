import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Card from "@/components/ui/Card";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">General configuration will appear here.</div>
      </Card>
    </div>
  );
}
