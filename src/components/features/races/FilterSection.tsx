"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { value: "date", label: "날짜순 정렬" },
  { value: "deadline", label: "마감순 정렬" },
  { value: "popular", label: "인기순 정렬" },
];

const REGION_OPTIONS = [
  { value: "전체", label: "지역: 전체" },
  { value: "한국", label: "지역: 한국" },
  { value: "일본", label: "지역: 일본" },
  { value: "미국", label: "지역: 미국" },
  { value: "유럽", label: "지역: 유럽" },
];

export function FilterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "date";
  const currentRegion = searchParams.get("region") || "전체";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "date" || value === "전체") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-4 items-center justify-start md:justify-center">
      {/* Sort Options */}
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => updateParams("sort", option.value)}
          className={`group flex items-center gap-2 px-5 py-2.5 border-2 border-border-dark rounded-full shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[var(--shadow-neobrutalism-active)] active:translate-x-[4px] active:translate-y-[4px] transition-all duration-200 ${
            currentSort === option.value
              ? "bg-primary"
              : "bg-white dark:bg-background-dark dark:border-white"
          }`}
        >
          <span className="text-sm font-bold uppercase">{option.label}</span>
          <span className="material-symbols-outlined text-lg">
            arrow_drop_down
          </span>
        </button>
      ))}

      {/* Region Filter */}
      <div className="relative">
        <button
          className={`group flex items-center gap-2 px-5 py-2.5 border-2 border-border-dark dark:border-white rounded-full shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[var(--shadow-neobrutalism-active)] active:translate-x-[4px] active:translate-y-[4px] transition-all duration-200 bg-white dark:bg-background-dark`}
          onClick={() => {
            const currentIndex = REGION_OPTIONS.findIndex(
              (r) => r.value === currentRegion
            );
            const nextIndex = (currentIndex + 1) % REGION_OPTIONS.length;
            updateParams("region", REGION_OPTIONS[nextIndex].value);
          }}
        >
          <span className="text-sm font-bold uppercase">
            {REGION_OPTIONS.find((r) => r.value === currentRegion)?.label}
          </span>
          <span className="material-symbols-outlined text-lg">filter_list</span>
        </button>
      </div>
    </div>
  );
}
