import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import {
  WeekNavigator,
  ScheduleTimeline,
} from "@/components/features/schedule";
import type { RaceWithCategories } from "@/types";
import {
  todayKST,
  startOfDayKST,
  getWeekRangeKST,
  getWeekDatesKST,
  getMonthRangeKST,
  getMonthDatesKST,
  isSameDayKST,
  isPastKST,
  isTodayKST,
  isTomorrowKST,
  formatTime,
  toKST,
  nowKST,
  serializeDate,
} from "@/lib/date";
import { getRaceRegistrationPeriod } from "@/lib/utils";
import { parseISO, isBefore, isAfter } from "date-fns";

type ViewMode = "week" | "month";

interface WeeklyPageProps {
  searchParams: Promise<{
    week?: string;
    month?: string;
    view?: ViewMode;
  }>;
}

export default async function WeeklyPage({ searchParams }: WeeklyPageProps) {
  const params = await searchParams;

  // KST 기준 오늘 날짜
  const today = todayKST();

  // View mode 결정
  const viewMode: ViewMode = params.view === "month" ? "month" : "week";

  // 주간 범위 계산 (항상 필요 - 네비게이터용)
  let weekBaseDate = today;
  if (params.week) {
    const parsed = parseISO(params.week);
    if (!isNaN(parsed.getTime())) {
      weekBaseDate = startOfDayKST(parsed);
    }
  }
  const { weekStart, weekEnd } = getWeekRangeKST(weekBaseDate);

  // 월간 범위 계산
  let monthBaseDate = today;
  if (params.month) {
    const parsed = parseISO(params.month);
    if (!isNaN(parsed.getTime())) {
      monthBaseDate = startOfDayKST(parsed);
    }
  } else if (params.week) {
    // month 파라미터가 없으면 week 기준 월 사용
    monthBaseDate = weekBaseDate;
  }
  const { monthStart, monthEnd } = getMonthRangeKST(monthBaseDate);

  // 실제 사용할 날짜 범위 결정
  const dateRangeStart = viewMode === "month" ? monthStart : weekStart;
  const dateRangeEnd = viewMode === "month" ? monthEnd : weekEnd;
  const targetDates = viewMode === "month"
    ? getMonthDatesKST(monthStart)
    : getWeekDatesKST(weekStart);

  // 카테고리 REGISTRATION 스케줄을 기준으로 범위 내 대회 조회 (레거시 필드는 보조)
  const races = await prisma.race.findMany({
    where: {
      registrationStartAt: {
        gte: dateRangeStart,
        lte: dateRangeEnd,
      },
    },
    orderBy: [{ eventStartAt: "asc" }],
    include: {
      categories: true,
    },
  });

  const now = nowKST();

  function determineRaceStatus(
    race: RaceWithCategories
  ): "closed" | "open" | "upcoming" {
    const { start: regStartRaw, end: regEndRaw } = getRaceRegistrationPeriod(
      race
    );
    const regStart = regStartRaw ? toKST(regStartRaw) : null;
    const regEnd = regEndRaw ? toKST(regEndRaw) : null;

    if (!regStart && !regEnd) {
      if (race.registrationStatus === "open") return "open";
      if (race.registrationStatus === "closed") return "closed";
      return "upcoming";
    }

    if (regEnd && isAfter(now, regEnd)) return "closed";
    if (regStart && isBefore(now, regStart)) return "upcoming";
    return "open";
  }

  // 날짜별로 그룹화: 접수시작일이 그 날인 대회만
  const allDayGroups = targetDates.map((date) => {
    const racesForDay: Array<{
      race: RaceWithCategories;
      status: "closed" | "open" | "upcoming";
      time?: string;
    }> = [];

    races.forEach((race) => {
      const { start: regStart } = getRaceRegistrationPeriod(race);
      if (!regStart) return;

      // 접수시작일이 이 날짜와 같은 경우만 (KST 기준)
      if (isSameDayKST(regStart, date)) {
        const status = determineRaceStatus(race);

        // 시간 추출 (KST 기준)
        let time = formatTime(regStart);
        if (time === "00:00") time = "10:00"; // 기본값

        racesForDay.push({ race, status, time });
      }
    });

    // 시간순 정렬
    racesForDay.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    const openCount = racesForDay.filter((r) => r.status === "open").length;

    return {
      date: serializeDate(date), // ISO 문자열로 직렬화
      races: racesForDay,
      isPast: isPastKST(date),
      isToday: isTodayKST(date),
      isTomorrow: isTomorrowKST(date),
      openCount,
    };
  });

  // 월간 뷰에서는 대회가 있는 날만 필터링
  const dayGroups = viewMode === "month"
    ? allDayGroups.filter((group) => group.races.length > 0)
    : allDayGroups;

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-24" />}>
          <WeekNavigator
            currentDate={serializeDate(today)!}
            weekStart={serializeDate(weekStart)!}
            weekEnd={serializeDate(weekEnd)!}
            monthStart={serializeDate(monthStart)!}
            monthEnd={serializeDate(monthEnd)!}
            viewMode={viewMode}
          />
        </Suspense>

        <ScheduleTimeline dayGroups={dayGroups} viewMode={viewMode} />
      </main>
      <Footer />
    </>
  );
}
