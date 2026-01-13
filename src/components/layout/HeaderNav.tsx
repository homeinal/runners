"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, Timer } from "lucide-react";

export function HeaderNav() {
  const pathname = usePathname();
  const isUrgentPage = pathname === "/urgent";
  const isWeeklyPage = pathname === "/weekly";
  const isHomePage = pathname === "/";

  return (
    <nav className="flex items-center gap-3 bg-white dark:bg-background-dark p-1.5 rounded-full border-2 border-border-dark dark:border-white shadow-[var(--shadow-neobrutalism-sm)] overflow-x-auto max-w-full">
      <Link
        href="/weekly"
        className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap ${
          isWeeklyPage
            ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        }`}
      >
        <CalendarRange className="text-lg" size="1em" />
        주간 접수
      </Link>
      <Link
        href="/urgent"
        className={`px-4 md:px-6 py-2 rounded-full font-black text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap ${
          isUrgentPage
            ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        }`}
      >
        <Timer className="text-lg" size="1em" />
        접수 임박
      </Link>
      <Link
        href="/"
        className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm uppercase transition-colors whitespace-nowrap ${
          isHomePage
            ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        }`}
      >
        전체 대회
      </Link>
    </nav>
  );
}
