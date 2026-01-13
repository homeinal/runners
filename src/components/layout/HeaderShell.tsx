import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, PersonStanding } from "lucide-react";

interface HeaderShellProps {
  nav: ReactNode;
  themeToggle: ReactNode;
}

export function HeaderShell({ nav, themeToggle }: HeaderShellProps) {
  return (
    <header className="w-full bg-background-light dark:bg-background-dark border-b-4 border-border-dark dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center shadow-[var(--shadow-neobrutalism-sm)]">
              <PersonStanding className="text-border-dark" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              MAEDAL
            </h1>
          </Link>
          <button className="md:hidden p-2" aria-label="氅旊壌 ?搓赴">
            <Menu size="1em" />
          </button>
        </div>

        {nav}

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full px-4 py-1.5 font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            Seoul, KR
          </div>
          {themeToggle}
        </div>
      </div>
    </header>
  );
}
