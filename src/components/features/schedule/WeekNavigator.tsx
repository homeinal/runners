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
  startOfMonthKST,
  addMonthsKST,
} from "@/lib/date";
import { parseISO, startOfWeek, addMonths, startOfMonth, addDays } from "date-fns";

type ViewMode = "week" | "month";

interface WeekNavigatorProps {
  currentDate: string; // ISO string
  weekStart: string; // ISO string
  weekEnd: string; // ISO string
  monthStart?: string; // ISO string (월간 뷰용)
  monthEnd?: string; // ISO string (월간 뷰용)
  viewMode?: ViewMode;
}

export function WeekNavigator({
  currentDate: currentDateStr,
  weekStart: weekStartStr,
  weekEnd: weekEndStr,
  monthStart: monthStartStr,
  monthEnd: monthEndStr,
  viewMode = "week",
}: WeekNavigatorProps) {
  // ISO 문자열을 Date로 변환
  const currentDate = useMemo(() => parseISO(currentDateStr), [currentDateStr]);
  const weekStart = useMemo(() => parseISO(weekStartStr), [weekStartStr]);
  const weekEnd = useMemo(() => parseISO(weekEndStr), [weekEndStr]);
  const monthStart = useMemo(
    () => (monthStartStr ? parseISO(monthStartStr) : startOfMonthKST(weekStart)),
    [monthStartStr, weekStart]
  );
  const monthEnd = useMemo(
    () => (monthEndStr ? parseISO(monthEndStr) : null),
    [monthEndStr]
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    viewMode === "month" ? toKST(monthStart) : toKST(weekStart)
  );
  const [calendarYear, setCalendarYear] = useState(() =>
    getDateParts(monthStart).year
  );
  const [hoveredWeekStart, setHoveredWeekStart] = useState<Date | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // weekStart/monthStart가 변경되면 calendarMonth/Year도 동기화
  useEffect(() => {
    if (viewMode === "month") {
      setCalendarMonth(toKST(monthStart));
      setCalendarYear(getDateParts(monthStart).year);
    } else {
      setCalendarMonth(toKST(weekStart));
    }
  }, [weekStart, monthStart, viewMode]);

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
    params.set("view", "week");
    router.push(`/weekly?${params.toString()}`);
    setIsCalendarOpen(false);
  };

  const navigateToMonth = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    const targetMonthStart = startOfMonthKST(date);
    params.set("month", formatDateKey(targetMonthStart));
    params.set("view", "month");
    router.push(`/weekly?${params.toString()}`);
    setIsCalendarOpen(false);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addWeeksKST(weekStart, direction === "prev" ? -1 : 1);
    navigateToWeek(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = addMonthsKST(monthStart, direction === "prev" ? -1 : 1);
    navigateToMonth(newDate);
  };

  const toggleViewMode = (newMode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newMode);
    if (newMode === "month") {
      // 현재 주가 속한 월로 이동
      const targetMonthStart = startOfMonthKST(weekStart);
      params.set("month", formatDateKey(targetMonthStart));
    } else {
      // 현재 월의 첫 주로 이동
      params.set("week", formatDateKey(startOfWeekKST(monthStart)));
    }
    router.push(`/weekly?${params.toString()}`);
  };

  // 캘린더 월 변경 (주간 뷰용)
  const changeMonth = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => addMonths(prev, direction === "prev" ? -1 : 1));
  };

  // 캘린더 연도 변경 (월간 뷰용)
  const changeYear = (direction: "prev" | "next") => {
    setCalendarYear((prev) => prev + (direction === "prev" ? -1 : 1));
  };

  // 특정 월 선택 (월간 뷰용)
  const selectMonth = (month: number) => {
    const targetDate = new Date(calendarYear, month - 1, 1);
    navigateToMonth(targetDate);
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

  const monthParts = getDateParts(monthStart);

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

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="bg-white dark:bg-white/5 border-2 border-border-dark dark:border-white rounded-xl p-1 shadow-[var(--shadow-neobrutalism-sm)] flex items-center">
          <button
            onClick={() => toggleViewMode("week")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
              viewMode === "week"
                ? "bg-border-dark text-white dark:bg-white dark:text-black"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            주간
          </button>
          <button
            onClick={() => toggleViewMode("month")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
              viewMode === "month"
                ? "bg-border-dark text-white dark:bg-white dark:text-black"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            월간
          </button>
        </div>

        {/* Navigator */}
        <div className="relative" ref={calendarRef}>
          <div className="bg-white dark:bg-white/5 border-2 border-border-dark dark:border-white rounded-xl p-1 shadow-[var(--shadow-neobrutalism-sm)] flex items-center gap-2">
            <button
              onClick={() => viewMode === "week" ? navigateWeek("prev") : navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label={viewMode === "week" ? "이전 주" : "이전 월"}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => {
                if (viewMode === "month") {
                  setCalendarMonth(toKST(monthStart));
                } else {
                  setCalendarMonth(toKST(weekStart));
                }
                setIsCalendarOpen(!isCalendarOpen);
              }}
              className="flex items-center px-4 py-2 border-x-2 border-gray-100 dark:border-white/10 gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-gray-400">
                calendar_month
              </span>
              <div className="flex flex-col items-center">
                {viewMode === "week" ? (
                  <>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Selected Week
                    </span>
                    <span className="font-bold text-sm">
                      {formatDateDot(weekStart)} - {formatDateShort(weekEnd)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Selected Month
                    </span>
                    <span className="font-bold text-sm">
                      {monthParts.year}년 {monthParts.month}월
                    </span>
                  </>
                )}
              </div>
            </button>
            <button
              onClick={() => viewMode === "week" ? navigateWeek("next") : navigateMonth("next")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label={viewMode === "week" ? "다음 주" : "다음 월"}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

        {/* Calendar Popup */}
        {isCalendarOpen && viewMode === "week" && (
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

        {/* Month Picker Popup (월간 뷰용) */}
        {isCalendarOpen && viewMode === "month" && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border-2 border-border-dark dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] p-4 z-50 min-w-[280px]">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeYear("prev")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="font-black text-xl">
                {calendarYear}년
              </span>
              <button
                onClick={() => changeYear("next")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Month Grid (4x3) */}
            <div
              className="grid grid-cols-4 gap-2"
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                const isCurrentMonth =
                  calendarYear === getDateParts(todayKST).year &&
                  month === getDateParts(todayKST).month;
                const isSelectedMonth =
                  calendarYear === monthParts.year &&
                  month === monthParts.month;
                const isHovered = hoveredMonth === month;

                return (
                  <button
                    key={month}
                    onClick={() => selectMonth(month)}
                    onMouseEnter={() => setHoveredMonth(month)}
                    className={`
                      py-3 px-2 text-sm font-bold rounded-lg transition-all
                      ${
                        isSelectedMonth
                          ? "bg-primary text-border-dark"
                          : isHovered
                            ? "bg-gray-200 dark:bg-white/20"
                            : "hover:bg-gray-100 dark:hover:bg-white/10"
                      }
                      ${isCurrentMonth ? "ring-2 ring-[#FF6B6B] ring-offset-1" : ""}
                    `}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => navigateToMonth(new Date())}
                className="flex-1 py-2 px-3 text-xs font-bold bg-border-dark text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                이번 달로 이동
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
