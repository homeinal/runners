"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "@/components/ui/Icon";

export function Header() {
  const pathname = usePathname();
  const isUrgentPage = pathname === "/urgent";
  const isWeeklyPage = pathname === "/weekly";
  const isHomePage = pathname === "/";

  return (
    <header className="w-full bg-background-light dark:bg-background-dark border-b-4 border-border-dark dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center shadow-[var(--shadow-neobrutalism-sm)]">
              <Icon
                name="directions_run"
                className="text-border-dark"
                style={{ fontSize: "24px" }}
              />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              MAEDAL
            </h1>
          </Link>
          <button className="md:hidden p-2" aria-label="메뉴 열기">
            <Icon name="menu" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-3 bg-white dark:bg-background-dark p-1.5 rounded-full border-2 border-border-dark dark:border-white shadow-[var(--shadow-neobrutalism-sm)] overflow-x-auto max-w-full">
          <Link
            href="/weekly"
            className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap ${
              isWeeklyPage
                ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            }`}
          >
            <Icon name="calendar_view_week" className="text-lg" />
            주간접수
          </Link>
          <Link
            href="/urgent"
            className={`px-4 md:px-6 py-2 rounded-full font-black text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap ${
              isUrgentPage
                ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            }`}
          >
            <Icon name="timer" className="text-lg" />
            접수임박
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

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full px-4 py-1.5 font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            Seoul, KR
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
