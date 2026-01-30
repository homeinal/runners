"use client";

import { HeaderNav, MobileHeaderNav } from "./HeaderNav";
import { HeaderShell } from "./HeaderShell";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <HeaderShell
      nav={<HeaderNav />}
      mobileNav={({ onNavigate }) => <MobileHeaderNav onNavigate={onNavigate} />}
      themeToggle={<ThemeToggle />}
    />
  );
}
