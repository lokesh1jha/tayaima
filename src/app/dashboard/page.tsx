import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  if (!session) redirect("/login");
  // Redirect overview to profile (or products per request)
  redirect("/dashboard/profile");
}