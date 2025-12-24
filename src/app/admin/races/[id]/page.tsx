import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import RaceEditClient from "./RaceEditClient";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RaceEditPage({ params }: Props) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const { id } = await params;

  const race = await prisma.race.findUnique({
    where: { id },
    include: {
      categories: {
        include: { schedules: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!race) {
    notFound();
  }

  return <RaceEditClient race={race} />;
}
