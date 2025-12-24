import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maedal.com";

  // Fetch all races
  const races = await prisma.race.findMany({
    select: { id: true, updatedAt: true },
  });

  const raceUrls = races.map((race) => ({
    url: `${baseUrl}/races/${race.id}`,
    lastModified: race.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...raceUrls,
  ];
}
