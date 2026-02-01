"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, X, PersonStanding } from "lucide-react";

interface HeaderShellProps {
  nav: ReactNode;
  mobileNav: ReactNode | ((props: { onNavigate: () => void }) => ReactNode);
  themeToggle: ReactNode;
  userMenu?: ReactNode;
  mobileUserMenu?: ReactNode | ((props: { onNavigate: () => void }) => ReactNode);
}

export function HeaderShell({ nav, mobileNav, themeToggle, userMenu, mobileUserMenu }: HeaderShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-background-light dark:bg-background-dark border-b-4 border-border-dark dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center shadow-(--shadow-neobrutalism-sm)">
              <PersonStanding className="text-border-dark" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              MAEDAL
            </h1>
          </Link>
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={mobileMenuOpen ? "메뉴닫기" : "메뉴보기"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:block">
          {nav}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {themeToggle}
          {userMenu}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2">
          <div className="bg-white dark:bg-background-dark border-4 border-border-dark dark:border-white rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            {typeof mobileNav === 'function' ? mobileNav({ onNavigate: () => setMobileMenuOpen(false) }) : mobileNav}

            {/* Mobile User Menu */}
            {mobileUserMenu && (
              <div className="mt-4 pt-4 border-t-2 border-border-dark dark:border-white">
                {typeof mobileUserMenu === 'function' ? mobileUserMenu({ onNavigate: () => setMobileMenuOpen(false) }) : mobileUserMenu}
              </div>
            )}

            {/* Mobile Theme Toggle */}
            <div className="mt-4 pt-4 border-t-2 border-border-dark dark:border-white flex items-center justify-end">
              {themeToggle}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
