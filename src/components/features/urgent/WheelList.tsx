"use client";

import { useEffect, useRef, useState } from "react";
import type { RaceWithCategories } from "@/types";
import { ScheduleCard } from "@/components/features/schedule/ScheduleCard";
import { getDateParts } from "@/lib/date";

interface DayGroup {
  date: string | null; // ISO string (Server에서 직렬화됨)
  races: Array<{
    race: RaceWithCategories;
    status: "closed" | "open" | "upcoming";
    time?: string;
  }>;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  openCount: number;
}

interface WheelListProps {
  dayGroups: DayGroup[];
}

// Helper to group races by time
function groupRacesByTime(
  races: Array<{
    race: RaceWithCategories;
    status: "closed" | "open" | "upcoming";
    time?: string;
  }>
) {
  const groups: Map<
    string,
    {
      time: string;
      period: string;
      races: typeof races;
    }
  > = new Map();

  races.forEach((item) => {
    const time = item.time || "00:00";
    const hour = parseInt(time.split(":")[0]);
    let period = "Morning";
    if (hour >= 12 && hour < 17) period = "Afternoon";
    else if (hour >= 17) period = "Evening";

    const key = time;
    if (!groups.has(key)) {
      groups.set(key, { time, period, races: [] });
    }
    groups.get(key)!.races.push(item);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

export function WheelList({ dayGroups }: WheelListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, dayGroups.length);
  }, [dayGroups]);

  // Scroll to Today on mount
  useEffect(() => {
    const todayIndex = dayGroups.findIndex((g) => g.isToday);
    if (todayIndex !== -1 && itemRefs.current[todayIndex]) {
      // Small timeout to ensure layout is ready
      setTimeout(() => {
        itemRefs.current[todayIndex]?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 100);
    } else if (dayGroups.length > 0 && itemRefs.current[0]) {
      // Default to first item if no today
       setTimeout(() => {
        itemRefs.current[0]?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 100);
    }
  }, [dayGroups]);

  // Intersection Observer for Active State
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5, // 50% visibility required to be "active"
        rootMargin: "-20% 0px -20% 0px", // Focus on the center area
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [dayGroups]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Center Highlight Zone (Visual indicator) */}
      <div className="absolute top-1/2 left-0 right-0 h-[300px] -translate-y-1/2 pointer-events-none z-0 bg-primary/5 dark:bg-white/5 border-y border-border-dark/10 dark:border-white/10" />

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory py-[40vh] no-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {dayGroups.map((group, index) => {
          if (!group.date) return null;

          const dateInfo = getDateParts(group.date);
          const isActive = index === activeIndex;

          return (
            <div
              key={group.date}
              ref={(el) => { itemRefs.current[index] = el }}
              data-index={index}
              className={`snap-center w-full min-h-[300px] flex flex-col items-center justify-center transition-all duration-500 ease-out p-4 md:p-8 ${
                isActive ? "opacity-100 scale-100 blur-0" : "opacity-40 scale-90 blur-[1px]"
              }`}
            >
              <div className="w-full max-w-2xl bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-[var(--shadow-neobrutalism)] p-6 md:p-8 transition-all duration-500">
                {/* Date Header */}
                <div className="flex items-center justify-between mb-6 border-b-2 border-border-dark dark:border-white/20 pb-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center size-16 rounded-xl border-2 border-border-dark dark:border-white font-black leading-none ${group.isToday ? 'bg-primary text-border-dark' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                            <span className="text-xs uppercase">{String(dateInfo.month).padStart(2, "0")}</span>
                            <span className="text-2xl">{String(dateInfo.day).padStart(2, "0")}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black uppercase text-border-dark dark:text-white">{dateInfo.weekdayEn}</span>
                                {group.isToday && <span className="px-2 py-0.5 bg-[#FF6B6B] text-white text-[10px] font-black uppercase rounded-full animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">Today</span>}
                            </div>
                            <span className="text-sm font-bold text-gray-400">{dateInfo.year}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-black text-border-dark dark:text-white">{group.openCount}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">Races Open</span>
                    </div>
                </div>

                {/* Races List (Scrollable if too long inside the card) */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {group.races.length > 0 ? (
                         groupRacesByTime(group.races).map((timeGroup) => (
                             <div key={timeGroup.time} className="mb-4 last:mb-0">
                                 <div className="flex items-center gap-2 mb-2">
                                     <span className="text-xs font-black bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{timeGroup.time}</span>
                                 </div>
                                 <div className="space-y-3">
                                     {timeGroup.races.map(({ race, status, time }) => (
                                         <ScheduleCard
                                            key={race.id}
                                            race={race}
                                            status={status}
                                            time={time}
                                            showTopPick={status === 'open'}
                                         />
                                     ))}
                                 </div>
                             </div>
                         ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 font-bold">
                            일정이 없습니다.
                        </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
