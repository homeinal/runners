"use client";

import { HeaderNav } from "./HeaderNav";
import { HeaderShell } from "./HeaderShell";
import { ThemeToggle } from "./ThemeToggle";

export function HeaderClient() {
  return <HeaderShell nav={<HeaderNav />} themeToggle={<ThemeToggle />} />;
}
