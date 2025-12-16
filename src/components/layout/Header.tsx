import Link from "next/link";

export function Header() {
  return (
    <header className="w-full bg-background-light dark:bg-background-dark border-b-4 border-border-dark dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center shadow-[var(--shadow-neobrutalism-sm)]">
            <span
              className="material-symbols-outlined text-border-dark"
              style={{ fontSize: "24px" }}
            >
              directions_run
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase italic">
            러너스 하이
          </h1>
        </Link>

        <div className="hidden md:flex items-center">
          <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full px-4 py-1.5 font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            국내 행사
          </div>
        </div>

        <button className="md:hidden p-2" aria-label="메뉴 열기">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
