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
  const sort = (params.sort || "date") as SortOption;
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

  // Status Filter는 카테고리 REGISTRATION 스케줄 기반으로 후처리

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

  // 데이터 조회 (정렬/상태 필터는 메모리에서 처리)
  const [racesRaw, regions] = await Promise.all([
    prisma.race.findMany({
      where,
      orderBy: { eventDate: "asc" },
      include: {
        categories: {
          include: { schedules: true },
        },
      },
    }),
    getRegions(),
  ]);

  const now = new Date();

  function deriveRegistrationWindow(race: any) {
    const starts: Date[] = [];
    const ends: Date[] = [];
    race.categories?.forEach((cat: any) => {
      cat.schedules
        ?.filter((s: any) => s.type === "REGISTRATION")
        .forEach((s: any) => {
          if (s.startAt) starts.push(new Date(s.startAt));
          if (s.endAt) ends.push(new Date(s.endAt));
        });
    });
    // 미래/진행 중 우선: 미래 start가 있으면 그 중 최소, 없으면 진행 중이면 현재로 보정
    const legacyStart = race.registrationStart ? new Date(race.registrationStart) : null;
    const legacyEnd = race.registrationEnd ? new Date(race.registrationEnd) : null;

    const futureStarts = starts.filter((d) => d.getTime() >= now.getTime());
    const minFutureStart =
      futureStarts.length > 0
        ? new Date(Math.min(...futureStarts.map((d) => d.getTime())))
        : null;

    // 진행 중 판단: start가 과거이고 end가 미래면 진행 중
    const anyOngoing =
      starts.length > 0 &&
      starts.some((d, idx) => {
        const end = ends[idx] || null;
        const startTime = d.getTime();
        const endTime = end ? end.getTime() : Number.POSITIVE_INFINITY;
        return startTime <= now.getTime() && endTime >= now.getTime();
      });

    let start: Date | null = null;
    let end: Date | null = null;

    if (minFutureStart) {
      start = minFutureStart;
      end =
        ends.length > 0
          ? new Date(Math.max(...ends.map((d) => d.getTime())))
          : legacyEnd;
    } else if (anyOngoing) {
      // 진행 중이면 정렬 우선순위를 현재 시각에 가깝게
      start = new Date(now);
      end =
        ends.length > 0
          ? new Date(Math.max(...ends.map((d) => d.getTime())))
          : legacyEnd;
    } else if (starts.length > 0) {
      // 모두 과거인 경우: 가장 가까운 과거를 사용 (마지막 기회)
      start = new Date(Math.max(...starts.map((d) => d.getTime())));
      end =
        ends.length > 0
          ? new Date(Math.max(...ends.map((d) => d.getTime())))
          : legacyEnd;
    } else {
      // 스케줄 없으면 레거시로
      start = legacyStart;
      end = legacyEnd;
    }

    return { start, end };
  }

  function registrationSortScore(race: any) {
    const { start, end } = deriveRegistrationWindow(race);
    if (!start) return Number.POSITIVE_INFINITY;

    // 진행 중이면 최우선(0)
    if (start <= now && (!end || end >= now)) {
      return 0;
    }

    // 곧 열리는 순으로
    if (start > now) {
      return start.getTime() - now.getTime();
    }

    // 모두 과거면 큰 페널티를 줘서 뒤로
    return 1e12 + (now.getTime() - start.getTime());
  }

  const filteredByStatus = racesRaw.filter((race) => {
    if (status === "전체" || !status) return true;
    const { start, end } = deriveRegistrationWindow(race);
    if (!start && !end) return false;
    if (status === "upcoming") return !!start && start > now;
    if (status === "open") return (!!start ? start <= now : true) && (!!end ? end >= now : true);
    if (status === "closed") return !!end && end < now;
    return true;
  });

  const sorted = [...filteredByStatus].sort((a, b) => {
    if (sort === "registration") {
      const aScore = registrationSortScore(a);
      const bScore = registrationSortScore(b);
      if (aScore !== bScore) return aScore - bScore;
    } else if (sort === "popular") {
      if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  });

  const total = sorted.length;
  const races = sorted.slice(0, RACES_PER_PAGE * page);

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
