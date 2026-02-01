"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Album, CalendarRange, Medal, Trophy, Users, User, ChevronDown } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const BASE_CLS =
  "px-4 md:px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap";
const ACTIVE_CLS =
  BASE_CLS +
  " bg-primary border-2 border-border-dark shadow-sm text-border-dark";
const INACTIVE_CLS =
  BASE_CLS + " hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500";

const MOBILE_BASE_CLS =
  "w-full px-4 py-3 rounded-2xl font-bold text-sm uppercase flex items-center gap-3 transition-colors";
const MOBILE_ACTIVE_CLS =
  MOBILE_BASE_CLS +
  " bg-primary border-2 border-border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-border-dark";
const MOBILE_INACTIVE_CLS =
  MOBILE_BASE_CLS +
  " hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent";

function navCls(active: boolean) {
  return active ? ACTIVE_CLS : INACTIVE_CLS;
}

function mobileNavCls(active: boolean) {
  return active ? MOBILE_ACTIVE_CLS : MOBILE_INACTIVE_CLS;
}

export function HeaderNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Check if any hidden item is active
  const hiddenItemsActive =
    pathname === "/posts" ||
    pathname === "/crew" ||
    (pathname === "/mypage" && session?.user);

  return (
    <nav className="flex items-center gap-3 bg-white dark:bg-background-dark p-1.5 rounded-full border-2 border-border-dark dark:border-white shadow-(--shadow-neobrutalism-sm)">
      <Link href="/" className={navCls(pathname === "/")} scroll={false}>
        전체 대회
      </Link>
      <Link href="/weekly" className={navCls(pathname === "/weekly")} scroll={false}>
        <CalendarRange className="text-lg" size="1em" />
        주간 접수
      </Link>
      <Link href="/ranking" scroll={false} className={navCls(pathname === "/ranking")}>
        <Trophy className="text-lg" size="1em" />
        랭킹
      </Link>
      <Link href="/shoe-tier" className={navCls(pathname === "/shoe-tier")} scroll={false}>
        <Medal className="text-lg" size="1em" />
        신발 티어
      </Link>

      {/* 더보기 Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={hiddenItemsActive ? ACTIVE_CLS : INACTIVE_CLS}
        >
          더보기
          <ChevronDown className="text-lg" size="1em" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) min-w-[180px] py-2 z-50">
            <Link
              href="/posts"
              className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 font-bold text-sm uppercase transition-colors"
              scroll={false}
              onClick={() => setDropdownOpen(false)}
            >
              <Album className="text-lg" size="1em" />
              컬럼
            </Link>
            <Link
              href="/crew"
              className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 font-bold text-sm uppercase transition-colors"
              scroll={false}
              onClick={() => setDropdownOpen(false)}
            >
              <Users className="text-lg" size="1em" />
              크루 찾기
            </Link>
            {session?.user && (
              <Link
                href="/mypage"
                className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 font-bold text-sm uppercase transition-colors"
                scroll={false}
                onClick={() => setDropdownOpen(false)}
              >
                <User className="text-lg" size="1em" />
                마이페이지
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export function MobileHeaderNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="flex flex-col gap-2">
      <Link href="/weekly" className={mobileNavCls(pathname === "/weekly")} onClick={onNavigate} scroll={false}>
        <CalendarRange size={20} />
        주간 접수
      </Link>
      <Link href="/posts" className={mobileNavCls(pathname === "/posts")} onClick={onNavigate} scroll={false}>
        <Album size={20} />
        컬럼
      </Link>
      <Link href="/shoe-tier" className={mobileNavCls(pathname === "/shoe-tier")} onClick={onNavigate} scroll={false}>
        <Medal size={20} />
        신발 티어
      </Link>
      <Link href="/crew" className={mobileNavCls(pathname === "/crew")} onClick={onNavigate} scroll={false}>
        <Users size={20} />
        크루 찾기
      </Link>
      <Link href="/ranking" scroll={false} className={mobileNavCls(pathname === "/ranking")} onClick={onNavigate}>
        <Trophy size={20} />
        랭킹
      </Link>
      <Link href="/" className={mobileNavCls(pathname === "/")} onClick={onNavigate} scroll={false}>
        <CalendarRange size={20} />
        전체 대회
      </Link>
      {session?.user && (
        <Link href="/mypage" className={mobileNavCls(pathname === "/mypage")} onClick={onNavigate} scroll={false}>
          <User size={20} />
          마이페이지
        </Link>
      )}
    </nav>
  );
}
