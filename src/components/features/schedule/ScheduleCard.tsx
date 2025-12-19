import Link from "next/link";
import type { RaceWithCategories } from "@/types";
import { getRaceCategoryNames, getRaceRegistrationPeriod } from "@/lib/utils";

type ScheduleStatus = "closed" | "open" | "upcoming";

interface ScheduleCardProps {
  race: RaceWithCategories;
  status: ScheduleStatus;
  time?: string;
  showTopPick?: boolean;
}

function getStatusConfig(status: ScheduleStatus) {
  switch (status) {
    case "closed":
      return {
        bgColor: "bg-gray-100 dark:bg-white/5",
        icon: "timer_off",
        iconColor: "text-gray-400",
        label: "마감",
        labelBg: "bg-gray-200",
        labelText: "text-gray-500",
        cardOpacity: "opacity-80",
        textColor: "text-gray-500",
        animate: false,
      };
    case "open":
      return {
        bgColor: "bg-primary",
        icon: "alarm_on",
        iconColor: "text-border-dark",
        label: "등록 가능",
        labelBg: "bg-white",
        labelText: "text-border-dark",
        cardOpacity: "",
        textColor: "text-border-dark dark:text-white",
        animate: true,
      };
    case "upcoming":
      return {
        bgColor: "bg-white dark:bg-white/10",
        icon: "calendar_month",
        iconColor: "text-gray-400",
        label: "",
        labelBg: "",
        labelText: "",
        cardOpacity: "opacity-90 hover:opacity-100",
        textColor: "text-gray-700 dark:text-gray-200",
        animate: false,
      };
  }
}

export function ScheduleCard({
  race,
  status,
  time,
  showTopPick = false,
}: ScheduleCardProps) {
  const config = getStatusConfig(status);
  const categoryNames = getRaceCategoryNames(race);
  const { start: regStart } = getRaceRegistrationPeriod(race);
  const eventDate = new Date(race.eventDate);

  const formatEventDate = () => {
    const month = String(eventDate.getMonth() + 1).padStart(2, "0");
    const day = String(eventDate.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[eventDate.getDay()];
    return `${month}.${day} (${weekday})`;
  };

  return (
    <div className={`relative group w-full ${config.cardOpacity}`}>
      {/* Shadow layer */}
      <div className="absolute inset-0 bg-border-dark translate-x-1 translate-y-1 rounded-xl group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform z-0" />

      {/* Card */}
      <div className="relative bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl overflow-hidden flex flex-col md:flex-row z-10 min-h-[140px]">
        {/* Left Status Section */}
        <div
          className={`w-full md:w-[110px] ${config.bgColor} border-b-2 md:border-b-0 md:border-r-2 border-border-dark p-3 flex flex-col items-center justify-center text-center gap-1`}
        >
          {status === "upcoming" && regStart ? (
            <>
              <span
                className={`material-symbols-outlined text-2xl ${config.iconColor} mb-1`}
              >
                {config.icon}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                Opens
              </span>
              <span className="text-lg font-black block leading-none text-gray-600 dark:text-gray-300">
                {String(regStart.getMonth() + 1).padStart(2, "0")}.
                {String(regStart.getDate()).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold mt-1 text-gray-500">
                {time || "10:00 AM"}
              </span>
            </>
          ) : status === "open" && time ? (
            <>
              <span
                className={`material-symbols-outlined text-2xl ${config.iconColor} mb-1 animate-pulse`}
              >
                check_circle
              </span>
              <span className="text-xl font-black block leading-none text-border-dark">
                {time}
              </span>
              <span className="text-[9px] font-bold mt-0.5 text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                등록 가능
              </span>
            </>
          ) : (
            <>
              <span
                className={`material-symbols-outlined text-2xl ${config.iconColor} mb-1 ${config.animate ? "animate-bounce" : ""}`}
              >
                {config.icon}
              </span>
              {config.label && (
                <span
                  className={`${config.labelBg} border border-border-dark px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,${status === "closed" ? "0.5" : "1"})]`}
                >
                  <span
                    className={`text-sm font-black block leading-none ${config.labelText}`}
                  >
                    {config.label}
                  </span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-center">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {showTopPick && status === "open" && (
              <span className="px-1.5 py-0.5 bg-border-dark text-white text-[10px] font-black uppercase rounded">
                Top Pick
              </span>
            )}
            {status === "open" && (
              <span className="px-1.5 py-0.5 bg-green-100 border border-green-700 text-[10px] font-bold uppercase rounded text-green-700">
                Open
              </span>
            )}
            {status === "upcoming" && (
              <span className="px-1.5 py-0.5 bg-blue-100 border border-blue-900 text-blue-900 text-[10px] font-black uppercase rounded">
                NEW
              </span>
            )}
            {categoryNames.slice(0, 2).map((name) => (
              <span
                key={name}
                className={`px-1.5 py-0.5 ${status === "closed" ? "bg-gray-200 border-gray-400 text-gray-500" : "bg-gray-100 border-border-dark text-gray-600"} border text-[10px] font-bold uppercase rounded`}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3
            className={`text-xl font-black uppercase leading-tight mb-2 ${config.textColor} ${status === "open" ? "group-hover:text-secondary transition-colors" : ""}`}
          >
            {race.title}
          </h3>

          {/* Meta Info */}
          <div
            className={`flex items-center gap-4 text-xs font-bold ${status === "closed" ? "text-gray-500" : "text-gray-600 dark:text-gray-300"}`}
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {race.venue || race.region || "장소 미정"}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                calendar_month
              </span>
              {formatEventDate()}
            </div>
          </div>
        </div>

        {/* Right Action Section */}
        <div className="w-full md:w-[130px] bg-gray-50 dark:bg-white/5 border-t-2 md:border-t-0 md:border-l-2 border-border-dark p-3 flex flex-col items-center justify-center gap-2">
          {status === "closed" ? (
            <>
              <span className="text-[9px] font-bold text-gray-500 uppercase">
                지난 대회
              </span>
              <button
                className="w-full bg-gray-300 text-gray-600 border-2 border-transparent py-2 rounded font-black text-xs uppercase shadow-sm cursor-not-allowed"
                disabled
              >
                종료
              </button>
            </>
          ) : status === "upcoming" ? (
            <button
              className="w-full bg-transparent text-gray-400 border-2 border-gray-300 py-2 rounded-lg font-bold text-xs uppercase cursor-not-allowed flex items-center justify-center gap-1"
              disabled
            >
              오픈 대기
            </button>
          ) : (
            <>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden border border-border-dark">
                <div className="h-full bg-green-500 w-[75%]" />
              </div>
              <span className="text-[9px] font-black text-green-700 uppercase">
                여유 있음
              </span>
              <Link
                href={`/races/${race.id}`}
                className="w-full bg-primary text-border-dark border-2 border-border-dark py-2 rounded font-black text-xs uppercase shadow-[var(--shadow-neobrutalism-sm)] hover:shadow-[var(--shadow-neobrutalism-active)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1"
              >
                신청하기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
