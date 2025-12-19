import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import {
  WeekNavigator,
  ScheduleTimeline,
} from "@/components/features/schedule";
import type { RaceWithCategories } from "@/types";

interface UrgentPageProps {
  searchParams: Promise<{
    week?: string;
  }>;
}

// Get week boundaries (Monday to Sunday)
function getWeekBoundaries(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// Generate array of dates for the week
function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Check if two dates are the same day
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default async function WeeklyPage({ searchParams }: UrgentPageProps) {
  const params = await searchParams;
  const now = new Date();

  // Parse week parameter or use current week
  let baseDate = now;
  if (params.week) {
    const parsed = new Date(params.week);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  const { weekStart, weekEnd } = getWeekBoundaries(baseDate);
  const weekDates = getWeekDates(weekStart);

  // 단순하게: 접수시작일이 이번 주에 있는 대회만 조회
  const races = await prisma.race.findMany({
    where: {
      registrationStart: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: [{ registrationStart: "asc" }, { eventDate: "asc" }],
    include: {
      categories: {
        include: { schedules: true },
      },
    },
  });

  // 오늘 날짜 (시간 제외)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 상태 결정 함수: RaceCategory.status 우선, 그 다음 스케줄 기반
  function determineRaceStatus(
    race: RaceWithCategories
  ): "closed" | "open" | "upcoming" {
    // 1순위: RaceCategory.status가 CLOSED면 무조건 마감
    if (race.categories && race.categories.length > 0) {
      const allClosed = race.categories.every((cat) => cat.status === "CLOSED");
      if (allClosed) return "closed";

      // 하나라도 OPEN이면 접수중
      const hasOpen = race.categories.some((cat) => cat.status === "OPEN");
      if (hasOpen) return "open";

      // 하나라도 CANCELLED가 아닌 UPCOMING이 있으면 접수예정
      const hasUpcoming = race.categories.some(
        (cat) => cat.status === "UPCOMING"
      );
      if (hasUpcoming) {
        // 2순위~4순위: 시간 기반 판단
        const regStart = race.registrationStart
          ? new Date(race.registrationStart)
          : null;
        const regEnd = race.registrationEnd
          ? new Date(race.registrationEnd)
          : null;

        if (regStart && now < regStart) return "upcoming"; // 아직 시작 전
        if (regStart && regEnd && now >= regStart && now <= regEnd)
          return "open"; // 접수 기간 중
        if (regEnd && now > regEnd) return "closed"; // 기간 종료

        return "upcoming";
      }
    }

    // 레거시: RaceCategory 없으면 날짜 기반으로만 판단
    const regStart = race.registrationStart
      ? new Date(race.registrationStart)
      : null;
    const regEnd = race.registrationEnd ? new Date(race.registrationEnd) : null;

    if (regEnd && now > regEnd) return "closed";
    if (regStart && regEnd && now >= regStart && now <= regEnd) return "open";
    if (regStart && now < regStart) return "upcoming";

    return "upcoming";
  }

  // 날짜별로 그룹화: 접수시작일이 그 날인 대회만
  const dayGroups = weekDates.map((date) => {
    const racesForDay: Array<{
      race: RaceWithCategories;
      status: "closed" | "open" | "upcoming";
      time?: string;
    }> = [];

    races.forEach((race) => {
      if (!race.registrationStart) return;

      const regStart = new Date(race.registrationStart);

      // 접수시작일이 이 날짜와 같은 경우만
      if (isSameDay(regStart, date)) {
        // 상태 결정: RaceCategory.status 우선순위 적용
        const status = determineRaceStatus(race);

        // 시간 추출
        const hours = String(regStart.getHours()).padStart(2, "0");
        const minutes = String(regStart.getMinutes()).padStart(2, "0");
        let time = `${hours}:${minutes}`;
        if (time === "00:00") time = "10:00"; // 기본값

        racesForDay.push({ race, status, time });
      }
    });

    // 시간순 정렬
    racesForDay.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    const openCount = racesForDay.filter((r) => r.status === "open").length;

    return {
      date,
      races: racesForDay,
      isPast: new Date(date).setHours(0, 0, 0, 0) < today.getTime(),
      isToday: isSameDay(date, today),
      isTomorrow: isSameDay(date, tomorrow),
      openCount,
    };
  });

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-24" />}>
          <WeekNavigator
            currentDate={now}
            weekStart={weekStart}
            weekEnd={weekEnd}
          />
        </Suspense>

        <ScheduleTimeline dayGroups={dayGroups} />
      </main>
      <Footer />
    </>
  );
}
