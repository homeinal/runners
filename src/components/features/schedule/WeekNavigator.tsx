"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface WeekNavigatorProps {
  currentDate: Date;
  weekStart: Date;
  weekEnd: Date;
}

export function WeekNavigator({
  currentDate,
  weekStart,
  weekEnd,
}: WeekNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatCurrentTime = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours < 12 ? "AM" : "PM";
    const hour12 = hours % 12 || 12;
    return `${month}월 ${day}일 (${weekday}) ${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const params = new URLSearchParams(searchParams.toString());
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(
      newWeekStart.getDate() + (direction === "prev" ? -7 : 7)
    );
    params.set("week", newWeekStart.toISOString().split("T")[0]);
    router.push(`/urgent?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b-2 border-border-dark/10 pb-6">
      <div>
        <h2 className="text-4xl font-black uppercase italic mb-2">
          Registration Schedule
        </h2>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="material-symbols-outlined">schedule</span>
          <span className="text-sm font-bold">
            현재 시간: {formatCurrentTime(currentDate)}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border-2 border-border-dark dark:border-white rounded-xl p-1 shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2">
        <button
          onClick={() => navigateWeek("prev")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          aria-label="이전 주"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex items-center px-4 py-2 border-x-2 border-gray-100 dark:border-white/10 gap-2">
          <span className="material-symbols-outlined text-gray-400">
            calendar_month
          </span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              Selected Week
            </span>
            <span className="font-bold text-sm">
              {formatDate(weekStart)} - {formatDate(weekEnd).slice(5)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigateWeek("next")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          aria-label="다음 주"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
