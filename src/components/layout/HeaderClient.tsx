"use client";

import { HeaderNav, MobileHeaderNav } from "./HeaderNav";
import { HeaderShell } from "./HeaderShell";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu, MobileUserMenu } from "./UserMenu";

export function HeaderClient() {
  return (
    <HeaderShell
      nav={<HeaderNav />}
      mobileNav={({ onNavigate }) => <MobileHeaderNav onNavigate={onNavigate} />}
      themeToggle={<ThemeToggle />}
      userMenu={<UserMenu />}
      mobileUserMenu={({ onNavigate }) => <MobileUserMenu onNavigate={onNavigate} />}
    />
  );
}
