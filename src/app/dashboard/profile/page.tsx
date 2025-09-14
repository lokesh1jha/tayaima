import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfileTabs from "@/components/dashboard/ProfileTabs";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="container py-8">
      <ProfileTabs user={{ id: session.user?.id, name: session.user?.name, email: session.user?.email }} />
    </div>
  );
}


