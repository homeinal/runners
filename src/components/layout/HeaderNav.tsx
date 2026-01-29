"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Album, CalendarRange, Medal, Users } from "lucide-react";

const BASE_CLS =
  "px-4 md:px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap";
const ACTIVE_CLS =
  BASE_CLS +
  " bg-primary border-2 border-border-dark shadow-sm text-border-dark";
const INACTIVE_CLS =
  BASE_CLS + " hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500";

function navCls(active: boolean) {
  return active ? ACTIVE_CLS : INACTIVE_CLS;
}

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3 bg-white dark:bg-background-dark p-1.5 rounded-full border-2 border-border-dark dark:border-white shadow-[var(--shadow-neobrutalism-sm)] overflow-x-auto max-w-full">
      <Link href="/weekly" className={navCls(pathname === "/weekly")}>
        <CalendarRange className="text-lg" size="1em" />
        주간 접수
      </Link>
      <Link href="/posts" className={navCls(pathname === "/posts")}>
        <Album className="text-lg" size="1em" />
        컬럼
      </Link>
      <Link href="/shoe-tier" className={navCls(pathname === "/shoe-tier")}>
        <Medal className="text-lg" size="1em" />
        신발 티어
      </Link>
      <Link href="/crew" className={navCls(pathname === "/crew")}>
        <Users className="text-lg" size="1em" />
        크루 찾기
      </Link>
      <Link href="/" className={navCls(pathname === "/")}>
        전체 대회
      </Link>
    </nav>
  );
}
