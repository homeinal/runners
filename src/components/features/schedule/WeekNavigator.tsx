"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  toKST,
  startOfWeekKST,
  isSameWeekKST,
  formatDateDot,
  formatDateShort,
  formatCurrentTimeKorean,
  formatDateKey,
  getDateParts,
  addWeeksKST,
} from "@/lib/date";
import { parseISO, startOfWeek, addMonths, startOfMonth, addDays } from "date-fns";

interface WeekNavigatorProps {
  currentDate: string; // ISO string
  weekStart: string; // ISO string
  weekEnd: string; // ISO string
}

export function WeekNavigator({
  currentDate: currentDateStr,
  weekStart: weekStartStr,
  weekEnd: weekEndStr,
}: WeekNavigatorProps) {
  // ISO 문자열을 Date로 변환
  const currentDate = useMemo(() => parseISO(currentDateStr), [currentDateStr]);
  const weekStart = useMemo(() => parseISO(weekStartStr), [weekStartStr]);
  const weekEnd = useMemo(() => parseISO(weekEndStr), [weekEndStr]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => toKST(weekStart));
  const [hoveredWeekStart, setHoveredWeekStart] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // weekStart가 변경되면 calendarMonth도 동기화
  useEffect(() => {
    setCalendarMonth(toKST(weekStart));
  }, [weekStart]);

  // 외부 클릭 시 캘린더 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToWeek = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    const targetWeekStart = startOfWeekKST(date);
    // formatDateKey는 KST 기준 YYYY-MM-DD를 반환
    params.set("week", formatDateKey(targetWeekStart));
    router.push(`/weekly?${params.toString()}`);
    setIsCalendarOpen(false);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addWeeksKST(weekStart, direction === "prev" ? -1 : 1);
    navigateToWeek(newDate);
  };

  // 캘린더 월 변경
  const changeMonth = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => addMonths(prev, direction === "prev" ? -1 : 1));
  };

  // 캘린더 날짜 생성
  const generateCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(calendarMonth);
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });

    // 6주 (42일) 생성
    const days: Date[] = [];
    let current = startDate;
    for (let i = 0; i < 42; i++) {
      days.push(current);
      current = addDays(current, 1);
    }

    return { days, currentMonth: calendarMonth.getMonth() };
  };

  const { days, currentMonth } = generateCalendarDays();
  const todayKST = toKST(new Date());

  return (
    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b-2 border-border-dark/10 pb-6">
      <div>
        <h2 className="text-4xl font-black uppercase italic mb-2">
          Registration Schedule
        </h2>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="material-symbols-outlined">schedule</span>
          <span className="text-sm font-bold">
            현재 시간: {formatCurrentTimeKorean(currentDate)}
          </span>
        </div>
      </div>

      <div className="relative" ref={calendarRef}>
        <div className="bg-white dark:bg-white/5 border-2 border-border-dark dark:border-white rounded-xl p-1 shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="이전 주"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => {
              setCalendarMonth(toKST(weekStart));
              setIsCalendarOpen(!isCalendarOpen);
            }}
            className="flex items-center px-4 py-2 border-x-2 border-gray-100 dark:border-white/10 gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-gray-400">
              calendar_month
            </span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                Selected Week
              </span>
              <span className="font-bold text-sm">
                {formatDateDot(weekStart)} - {formatDateShort(weekEnd)}
              </span>
            </div>
          </button>
          <button
            onClick={() => navigateWeek("next")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="다음 주"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Calendar Popup */}
        {isCalendarOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border-2 border-border-dark dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] p-4 z-50 min-w-[320px]">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth("prev")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="font-black text-lg">
                {getDateParts(calendarMonth).year}년{" "}
                {getDateParts(calendarMonth).month}월
              </span>
              <button
                onClick={() => changeMonth("next")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-gray-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div
              className="grid grid-cols-7 gap-0"
              onMouseLeave={() => setHoveredWeekStart(null)}
            >
              {days.map((date, index) => {
                const dateParts = getDateParts(date);
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday =
                  formatDateKey(date) === formatDateKey(todayKST);
                const isSelectedWeek = isSameWeekKST(date, weekStart);
                const isHoveredWeek =
                  hoveredWeekStart && isSameWeekKST(date, hoveredWeekStart);
                const isWeekStart = date.getDay() === 1; // 월요일
                const isWeekEnd = date.getDay() === 0; // 일요일

                return (
                  <button
                    key={index}
                    onClick={() => navigateToWeek(date)}
                    onMouseEnter={() => setHoveredWeekStart(startOfWeekKST(date))}
                    className={`
                      relative p-2 text-sm font-bold transition-all
                      ${!isCurrentMonth ? "text-gray-300 dark:text-gray-600" : ""}
                      ${
                        isSelectedWeek
                          ? "bg-primary text-border-dark"
                          : isHoveredWeek
                            ? "bg-gray-200 dark:bg-white/20"
                            : ""
                      }
                      ${(isSelectedWeek || isHoveredWeek) && isWeekStart ? "rounded-l-lg" : ""}
                      ${(isSelectedWeek || isHoveredWeek) && isWeekEnd ? "rounded-r-lg" : ""}
                      ${isToday ? "ring-2 ring-[#FF6B6B] ring-offset-1" : ""}
                    `}
                  >
                    {dateParts.day}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => navigateToWeek(new Date())}
                className="flex-1 py-2 px-3 text-xs font-bold bg-border-dark text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                이번 주로 이동
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
