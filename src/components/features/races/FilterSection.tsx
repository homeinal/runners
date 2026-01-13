import Link from "next/link";
import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "registration", label: "접수시작일순" },
  { value: "date", label: "대회일순" },
];

const STATUS_OPTIONS = [
  { value: "전체", label: "전체" },
  { value: "upcoming", label: "접수전" },
  { value: "open", label: "접수중" },
  { value: "closed", label: "마감" },
];

const DISTANCE_OPTIONS = [
  { value: "전체", label: "전체" },
  { value: "full", label: "Full" },
  { value: "half", label: "Half" },
  { value: "10km", label: "10km" },
  { value: "5km", label: "10km 미만" },
];

interface FilterSectionProps {
  regions: string[];
  searchParams: {
    sort?: string;
    region?: string;
    status?: string;
    distance?: string;
    page?: string;
    q?: string;
  };
}

export function FilterSection({ regions, searchParams }: FilterSectionProps) {
  const allValue = STATUS_OPTIONS[0].value;
  const currentSort = searchParams.sort || "date";
  const currentRegion = searchParams.region || allValue;
  const currentStatus = searchParams.status || allValue;
  const currentDistance = searchParams.distance || allValue;
  const currentQuery = searchParams.q || "";

  const baseParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    baseParams.set(key, value);
  });

  const shouldInclude = (value?: string) => Boolean(value && value !== allValue);

  const buildHref = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(baseParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === allValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset page when filtering changes
    params.delete("page");

    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Sort Options - Top */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        {SORT_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={buildHref({ sort: option.value })}
            className={`text-sm font-bold px-4 py-2 rounded-full transition-all border-2 ${
              currentSort === option.value
                ? "bg-primary border-border-dark text-border-dark"
                : "bg-transparent border-border-dark dark:border-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {/* 2. Filters & Search - Bottom */}
      <div className="flex flex-col gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border-2 border-border-dark dark:border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
        {/* Row 1: Status, Distance, Search (Desktop Only) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 shrink-0">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">상태</span>
              {STATUS_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref({ status: option.value })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                    currentStatus === option.value
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>

            {/* Distance Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 shrink-0">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">종목</span>
              {DISTANCE_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref({ distance: option.value })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                    currentDistance === option.value
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Input (Desktop) */}
          <form action="/" method="get" className="hidden md:block w-auto ml-auto">
            {shouldInclude(searchParams.sort) && (
              <input type="hidden" name="sort" value={searchParams.sort} />
            )}
            {shouldInclude(searchParams.region) && (
              <input type="hidden" name="region" value={searchParams.region} />
            )}
            {shouldInclude(searchParams.status) && (
              <input type="hidden" name="status" value={searchParams.status} />
            )}
            {shouldInclude(searchParams.distance) && (
              <input type="hidden" name="distance" value={searchParams.distance} />
            )}
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="대회명 검색"
                defaultValue={currentQuery}
                className="w-48 pl-9 pr-4 py-1.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
              />
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-lg text-gray-400"
                size="1em"
                aria-hidden
              />
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

        {/* Row 2: Region Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 md:flex-wrap md:overflow-visible">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">지역</span>
          <Link
            href={buildHref({ region: allValue })}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              currentRegion === allValue
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
            }`}
          >
            전체
          </Link>
          {regions.map((region) => (
            <Link
              key={region}
              href={buildHref({ region })}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                currentRegion === region
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
              }`}
            >
              {region}
            </Link>
          ))}
        </div>

        {/* Search Input (Mobile) */}
        <form action="/" method="get" className="md:hidden w-full mt-2">
          {shouldInclude(searchParams.sort) && (
            <input type="hidden" name="sort" value={searchParams.sort} />
          )}
          {shouldInclude(searchParams.region) && (
            <input type="hidden" name="region" value={searchParams.region} />
          )}
          {shouldInclude(searchParams.status) && (
            <input type="hidden" name="status" value={searchParams.status} />
          )}
          {shouldInclude(searchParams.distance) && (
            <input type="hidden" name="distance" value={searchParams.distance} />
          )}
          <div className="relative">
            <input
              type="text"
              name="q"
              placeholder="대회명 검색"
              defaultValue={currentQuery}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
            />
            <Search
              className="absolute left-2 top-1/2 -translate-y-1/2 text-lg text-gray-400"
              size="1em"
              aria-hidden
            />
          </div>
        </form>
      </div>
    </div>
  );
}
