import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeRaceForClient } from "@/lib/serialize";
import RaceEditClient from "./RaceEditClient";
import { isAdminAuthenticated } from "@/lib/admin-session";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RaceEditPage({ params }: Props) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/mrth-manage");
  }

  const { id } = await params;

  const race = await prisma.race.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!race) {
    notFound();
  }

  const raceForClient = serializeRaceForClient(race);

  return <RaceEditClient race={raceForClient} />;
}
