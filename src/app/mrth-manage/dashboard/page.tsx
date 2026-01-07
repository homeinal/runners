import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { serializeRacesForClient } from "@/lib/serialize";
import AdminDashboardClient from "./AdminDashboardClient";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/mrth-manage");
  }

  const races = await prisma.race.findMany({
    orderBy: { eventStartAt: "asc" },
    include: {
      categories: true,
    },
  });

  const racesForClient = serializeRacesForClient(races);

  return <AdminDashboardClient races={racesForClient} />;
}
