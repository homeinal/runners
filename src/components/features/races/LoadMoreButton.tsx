import Link from "next/link";
import { RefreshCw } from "lucide-react";

interface LoadMoreButtonProps {
  hasMore: boolean;
  currentPage: number;
  searchParams: {
    sort?: string;
    region?: string;
    status?: string;
    distance?: string;
    page?: string;
    q?: string;
  };
}

export function LoadMoreButton({
  hasMore,
  currentPage,
  searchParams,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="flex justify-center mt-8">
        <p className="text-sm font-bold text-border-dark/50 dark:text-white/50 uppercase">
          모든 대회를 확인했습니다
        </p>
      </div>
    );
  }

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    params.set(key, value);
  });
  params.set("page", String(currentPage + 1));

  const href = `/?${params.toString()}`;

  return (
    <div className="flex justify-center mt-8">
      <Link
        href={href}
        scroll={false}
        prefetch={false}
        className="bg-white dark:bg-background-dark text-border-dark dark:text-white border-2 border-border-dark dark:border-white px-8 py-3 rounded-full font-bold text-sm shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase flex items-center gap-2"
      >
        <RefreshCw size="1em" />
        대회 더 보기
      </Link>
    </div>
  );
}
