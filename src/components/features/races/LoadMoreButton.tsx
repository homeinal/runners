"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface LoadMoreButtonProps {
  hasMore: boolean;
  currentPage: number;
}

export function LoadMoreButton({ hasMore, currentPage }: LoadMoreButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (!hasMore) {
    return (
      <div className="flex justify-center mt-8">
        <p className="text-sm font-bold text-border-dark/50 dark:text-white/50 uppercase">
          모든 대회를 확인했습니다
        </p>
      </div>
    );
  }

  const handleLoadMore = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(currentPage + 1));
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleLoadMore}
        disabled={isPending}
        className="bg-white dark:bg-background-dark text-border-dark dark:text-white border-2 border-border-dark dark:border-white px-8 py-3 rounded-full font-bold text-sm shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">
          {isPending ? "hourglass_empty" : "refresh"}
        </span>
        {isPending ? "로딩 중..." : "대회 더 보기"}
      </button>
    </div>
  );
}
