"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

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
}

export function FilterSection({ regions }: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "registration";
  const currentRegion = searchParams.get("region") || "전체";
  const currentStatus = searchParams.get("status") || "전체";
  const currentDistance = searchParams.get("distance") || "전체";
  const currentQuery = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "전체" || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset page when filtering changes
      params.delete("page");
      
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchTerm });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Sort Options - Top */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => updateParams({ sort: option.value })}
            className={`text-sm font-bold px-4 py-2 rounded-full transition-all border-2 ${
              currentSort === option.value
                ? "bg-primary border-border-dark text-border-dark"
                : "bg-transparent border-border-dark dark:border-white hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {option.label}
          </button>
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
                  <button
                  key={option.value}
                  onClick={() => updateParams({ status: option.value })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                      currentStatus === option.value
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
                  }`}
                  >
                  {option.label}
                  </button>
              ))}
            </div>

             {/* Distance Filter */}
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 shrink-0">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">종목</span>
                {DISTANCE_OPTIONS.map((option) => (
                    <button
                    key={option.value}
                    onClick={() => updateParams({ distance: option.value })}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                        currentDistance === option.value
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
                    }`}
                    >
                    {option.label}
                    </button>
                ))}
            </div>
          </div>
          
          {/* Search Input (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:block w-auto ml-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="대회명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 pl-9 pr-4 py-1.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                search
              </span>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

        {/* Row 2: Region Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 md:flex-wrap md:overflow-visible">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">지역</span>
          <button
              onClick={() => updateParams({ region: "전체" })}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                currentRegion === "전체"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
              }`}
            >
              전체
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => updateParams({ region })}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                currentRegion === region
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-500"
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Search Input (Mobile) */}
        <form onSubmit={handleSearch} className="md:hidden w-full mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="대회명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-lg text-gray-400">
              search
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
