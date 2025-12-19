import type { RaceWithCategories } from "@/types";
import { ScheduleCard } from "./ScheduleCard";
import { getRaceRegistrationPeriod } from "@/lib/utils";

interface DayGroup {
  date: Date;
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

interface ScheduleTimelineProps {
  dayGroups: DayGroup[];
}

function formatDateLabel(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = weekdays[date.getDay()];
  return `${month}.${day} (${weekday})`;
}

function formatDateLabelKorean(date: Date): {
  month: string;
  day: string;
  weekday: string;
  formatted: string;
} {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return { month, day, weekday, formatted: `${month}.${day}\n(${weekday})` };
}

export function ScheduleTimeline({ dayGroups }: ScheduleTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="hidden md:block absolute left-[25%] top-0 bottom-0 w-0.5 bg-border-dark/10 dark:bg-white/10 -ml-[1px]" />

      {dayGroups.map((group, groupIndex) => {
        const dateInfo = formatDateLabelKorean(group.date);

        // Today section header
        if (group.isToday && group.races.length > 0) {
          return (
            <div key={group.date.toISOString()}>
              {/* TODAY Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative mb-8">
                <div className="md:col-span-3 text-right pr-8 relative pt-1">
                  <div className="sticky top-[120px]">
                    <span className="text-secondary font-black text-sm uppercase tracking-widest animate-pulse">
                      TODAY
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black text-border-dark dark:text-white uppercase italic leading-none">
                      {dateInfo.month}.{dateInfo.day}
                      <br />
                      <span className="text-2xl md:text-3xl not-italic">
                        ({dateInfo.weekday})
                      </span>
                    </h3>
                    {group.openCount > 0 && (
                      <span className="inline-block mt-2 px-2 py-1 bg-border-dark text-primary text-xs font-black uppercase rounded rotate-3">
                        {group.openCount}개 오픈
                      </span>
                    )}
                    <div className="hidden md:flex absolute right-[-5px] top-4 size-6 bg-primary border-4 border-border-dark rounded-full items-center justify-center z-10 shadow-[0_0_0_4px_rgba(249,245,6,0.3)] translate-x-[50%]" />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 bg-border-dark text-white px-4 py-1.5 rounded-lg shadow-[var(--shadow-neobrutalism-sm)] -rotate-1">
                      <span className="material-symbols-outlined text-primary text-xl">
                        campaign
                      </span>
                      <span className="font-black text-lg uppercase">
                        오늘 접수 시작
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Don&apos;t miss the timeline
                    </span>
                  </div>
                </div>
              </div>

              {/* Group races by time */}
              {groupRacesByTime(group.races).map((timeGroup) => (
                <div
                  key={timeGroup.time || "no-time"}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 relative mb-6"
                >
                  <div className="md:col-span-3 text-right pr-8 relative pt-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                      {timeGroup.period}
                    </span>
                    <span className="text-xl font-black text-border-dark dark:text-white block">
                      {timeGroup.time || "시간 미정"}
                    </span>
                    <div className="hidden md:block absolute right-[-5px] top-4 size-3 bg-white border-2 border-border-dark rounded-full z-10 translate-x-[50%]" />
                  </div>
                  <div className="md:col-span-9 space-y-4">
                    {timeGroup.races.map(({ race, status, time }) => (
                      <ScheduleCard
                        key={race.id}
                        race={race}
                        status={status}
                        time={time}
                        showTopPick={status === "open"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Tomorrow section
        if (group.isTomorrow && group.races.length > 0) {
          return (
            <div
              key={group.date.toISOString()}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 relative"
            >
              <div className="md:col-span-3 text-right pr-8 relative pt-2">
                <span className="text-gray-500 font-black text-sm uppercase">
                  TOMORROW
                </span>
                <h3 className="text-3xl font-black text-gray-600 dark:text-gray-300 uppercase">
                  {formatDateLabel(group.date)}
                </h3>
                <div className="hidden md:block absolute right-[-5px] top-4 size-4 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full z-10 translate-x-[50%]" />
              </div>
              <div className="md:col-span-9 space-y-6">
                {group.races.map(({ race, status, time }) => (
                  <ScheduleCard
                    key={race.id}
                    race={race}
                    status={status}
                    time={time}
                  />
                ))}
              </div>
            </div>
          );
        }

        // Past days or future days
        return (
          <div
            key={group.date.toISOString()}
            className={`grid grid-cols-1 md:grid-cols-12 gap-8 mb-4 relative ${group.isPast ? "opacity-80" : ""} group`}
          >
            <div className="md:col-span-3 text-right pr-8 relative">
              {group.isPast ? (
                <>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Past
                  </span>
                  <h3 className="text-xl font-black text-gray-400 decoration-2 line-through decoration-gray-400">
                    {formatDateLabel(group.date)}
                  </h3>
                </>
              ) : (
                <>
                  <span className="text-gray-400 font-bold text-sm uppercase">
                    Upcoming
                  </span>
                  <h3 className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                    {formatDateLabel(group.date)}
                  </h3>
                </>
              )}
              <div
                className={`hidden md:block absolute right-[-5px] top-2 size-3 ${group.isPast ? "bg-gray-300 dark:bg-gray-600" : "bg-white border-2 border-gray-300 dark:border-gray-600"} rounded-full z-10 translate-x-[50%]`}
              />
            </div>
            <div className="md:col-span-9 space-y-4">
              {group.races.length > 0 ? (
                group.races.map(({ race, status, time }) => (
                  <ScheduleCard
                    key={race.id}
                    race={race}
                    status={status}
                    time={time}
                  />
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2">
                  <span className="material-symbols-outlined text-gray-300 text-3xl">
                    event_upcoming
                  </span>
                  <p className="text-gray-400 font-bold text-sm">
                    등록된 일정이 아직 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to group races by time period
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
