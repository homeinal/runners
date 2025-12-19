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
    distance?: string;
    page?: string;
    q?: string;
  }>;
}

// Get unique regions from DB
async function getRegions() {
  const regions = await prisma.race.groupBy({
    by: ['region'],
    where: {
      region: { not: null },
      eventDate: { gte: new Date() } // Future races only
    },
    _count: { region: true },
    orderBy: { _count: { region: 'desc' } }
  });
  return regions.map(r => r.region).filter(Boolean) as string[];
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = (params.sort || "registration") as SortOption;
  const region = (params.region || "전체") as RegionFilter;
  const page = parseInt(params.page || "1", 10);
  const status = params.status || "전체";
  const distance = params.distance || "전체";
  const query = params.q || "";

  // Build where clause
  const where: Record<string, any> = {
    eventDate: { gte: new Date() },
  };

  if (region && region !== "전체") {
    where.region = region;
  }

  // Status Filter
  const now = new Date();
  if (status === "upcoming") {
    where.registrationStart = { gt: now };
  } else if (status === "open") {
    where.registrationStart = { lte: now };
    where.registrationEnd = { gte: now };
  } else if (status === "closed") {
    where.registrationEnd = { lt: now };
  }

  // Distance Filter
  if (distance && distance !== "전체") {
    const distanceConditions: any[] = [];
    
    if (distance === "full") {
      distanceConditions.push(
        { name: { contains: "Full", mode: "insensitive" } },
        { name: { contains: "풀", mode: "insensitive" } },
        { name: { contains: "42.195", mode: "insensitive" } }
      );
    } else if (distance === "half") {
      distanceConditions.push(
        { name: { contains: "Half", mode: "insensitive" } },
        { name: { contains: "하프", mode: "insensitive" } },
        { name: { contains: "21.0975", mode: "insensitive" } }
      );
    } else if (distance === "10km") {
       distanceConditions.push(
        { name: { contains: "10km", mode: "insensitive" } },
        { name: { contains: "10k", mode: "insensitive" } },
        // 10km 제외한 10km 미만 키워드가 포함되지 않도록 주의해야 하지만, 
        // 보통 "10km"가 명시되므로 contains로 충분
      );
    } else if (distance === "5km") { // 10km 미만
       distanceConditions.push(
        { name: { contains: "5km", mode: "insensitive" } },
        { name: { contains: "5k", mode: "insensitive" } },
        { name: { contains: "3km", mode: "insensitive" } },
        { name: { contains: "걷기", mode: "insensitive" } }
      );
    }

    if (distanceConditions.length > 0) {
      where.categories = {
        some: {
          OR: distanceConditions
        }
      };
    }
  }

  // Search Query
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { venue: { contains: query, mode: "insensitive" } },
      { region: { contains: query, mode: "insensitive" } },
    ];
  }

  // Build orderBy clause
  let orderBy: Record<string, string> | Record<string, string>[];
  switch (sort) {
    case "registration":
      orderBy = { registrationStart: "asc" };
      break;
    case "popular":
      orderBy = [{ isFeatured: "desc" }, { eventDate: "asc" }];
      break;
    case "date":
    default:
      orderBy = { eventDate: "asc" };
  }

  // Fetch data in parallel
  const [races, total, regions] = await Promise.all([
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
    getRegions(),
  ]);

  // Fetch featured race
  // Only show when no search/filter is active to keep UI clean, 
  // or show always but maybe it's distracting if searching.
  const showFeatured = !query && region === "전체" && status === "전체" && distance === "전체";
  
  let featuredRace = null;
  if (showFeatured) {
    featuredRace = await prisma.race.findFirst({
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
  }

  const hasMore = races.length < total;

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Filter Section */}
        <Suspense fallback={<div className="h-32" />}>
          <FilterSection regions={regions} />
        </Suspense>

        {/* Featured Race */}
        {featuredRace && <FeaturedRaceCard race={featuredRace} />}

        {/* Section Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-1 flex-1 bg-border-dark dark:bg-white rounded-full" />
          <span className="text-xl font-black uppercase text-border-dark dark:text-white whitespace-nowrap">
            {query ? `'${query}' 검색 결과` : "예정된 대회"}
          </span>
          <div className="h-1 flex-1 bg-border-dark dark:bg-white rounded-full" />
        </div>

        {/* Race List */}
        {races.length > 0 ? (
          <RaceList races={races} />
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border-2 border-border-dark dark:border-white">
            <p className="text-lg font-bold">조건에 맞는 대회가 없습니다.</p>
            <p className="text-sm mt-2">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}

        {/* Load More Button */}
        <Suspense fallback={null}>
          <LoadMoreButton hasMore={hasMore} currentPage={page} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
