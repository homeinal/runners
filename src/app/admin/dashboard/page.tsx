import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const races = await prisma.race.findMany({
    orderBy: { eventDate: "asc" },
    include: {
      categories: {
        include: { schedules: true },
      },
    },
  });

  return <AdminDashboardClient races={races} />;
}
