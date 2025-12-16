"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="size-10 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full flex items-center justify-center shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all"
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <span className="material-symbols-outlined text-border-dark dark:text-white" style={{ fontSize: "20px" }}>
        {mounted ? (theme === "light" ? "dark_mode" : "light_mode") : "contrast"}
      </span>
    </button>
  );
}
