import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeRacesForClient } from "@/lib/serialize";
import AdminDashboardClient from "./AdminDashboardClient";
import { isAdminAuthenticated } from "@/lib/admin-session";

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated();

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
