import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import {
  FeaturedRaceCard,
  RaceList,
  FilterSection,
  LoadMoreButton,
} from "@/components/features/races";
import type { SortOption, RegionFilter } from "@/types";

const RACES_PER_PAGE = 10;

interface HomePageProps {
  searchParams: Promise<{
    sort?: string;
    region?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = (params.sort || "date") as SortOption;
  const region = (params.region || "전체") as RegionFilter;
  const page = parseInt(params.page || "1", 10);

  // Build where clause
  const where: Record<string, unknown> = {
    eventDate: { gte: new Date() },
  };

  if (region && region !== "전체") {
    where.country = region;
  }

  // Build orderBy clause
  let orderBy: Record<string, string> | Record<string, string>[];
  switch (sort) {
    case "deadline":
      orderBy = { registrationEnd: "asc" };
      break;
    case "popular":
      orderBy = [{ isFeatured: "desc" }, { eventDate: "asc" }];
      break;
    default:
      orderBy = { eventDate: "asc" };
  }

  // Fetch featured race
  const featuredRace = await prisma.race.findFirst({
    where: {
      OR: [{ isFeatured: true }, { isUrgent: true }],
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
    include: {
      categories: {
        include: { schedules: true },
      },
    },
  });

  // Fetch races with pagination
  const [races, total] = await Promise.all([
    prisma.race.findMany({
      where,
      orderBy,
      take: RACES_PER_PAGE * page,
      skip: 0,
      include: {
        categories: {
          include: { schedules: true },
        },
      },
    }),
    prisma.race.count({ where }),
  ]);

  const hasMore = races.length < total;

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Filter Section */}
        <Suspense fallback={<div className="h-12" />}>
          <FilterSection />
        </Suspense>

        {/* Featured Race */}
        {featuredRace && <FeaturedRaceCard race={featuredRace} />}

        {/* Section Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-1 flex-1 bg-border-dark dark:bg-white rounded-full" />
          <span className="text-xl font-black uppercase text-border-dark dark:text-white">
            예정된 대회
          </span>
          <div className="h-1 flex-1 bg-border-dark dark:bg-white rounded-full" />
        </div>

        {/* Race List */}
        <RaceList races={races} />

        {/* Load More Button */}
        <Suspense fallback={null}>
          <LoadMoreButton hasMore={hasMore} currentPage={page} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
