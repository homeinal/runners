"use client";

import { useEffect, useState } from "react";
import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const IconComponent = mounted
    ? theme === "light"
      ? Moon
      : Sun
    : Contrast;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="size-10 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full flex items-center justify-center shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all"
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <IconComponent
        className="text-border-dark dark:text-white"
        size={20}
        aria-hidden
      />
    </button>
  );
}
