import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session) {
    if ((session.user as any)?.role === "ADMIN") redirect("/admin");
    redirect("/products");
  }
  return <>{children}</>;
}


