import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout";
import { WheelList } from "@/components/features/urgent/WheelList";
import type { RaceWithCategories } from "@/types";
import {
  todayKST,
  startOfDayKST,
  getWeekRangeKST,
  getWeekDatesKST,
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

interface UrgentPageProps {
  searchParams: Promise<{
    week?: string;
  }>;
}

export default async function UrgentPage({ searchParams }: UrgentPageProps) {
  const params = await searchParams;

  // KST 기준 오늘 날짜
  const today = todayKST();

  // week 파라미터 파싱 또는 현재 주 사용
  let baseDate = today;
  if (params.week) {
    const parsed = parseISO(params.week);
    if (!isNaN(parsed.getTime())) {
      baseDate = startOfDayKST(parsed);
    }
  }

  const { weekStart, weekEnd } = getWeekRangeKST(baseDate);
  const weekDates = getWeekDatesKST(weekStart);

  // 카테고리 REGISTRATION 스케줄 기준으로 이번 주 접수 시작 대회 조회 (레거시 보조)
  const races = await prisma.race.findMany({
    where: {
      OR: [
        {
          categories: {
            some: {
              schedules: {
                some: {
                  type: "REGISTRATION",
                  startAt: {
                    gte: weekStart,
                    lte: weekEnd,
                  },
                },
              },
            },
          },
        },
        {
          registrationStart: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      ],
    },
    orderBy: [{ eventDate: "asc" }],
    include: {
      categories: {
        include: { schedules: true },
      },
    },
  });

  const now = nowKST();

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
        // 시간 기반 판단
        const { start: regStartRaw, end: regEndRaw } = getRaceRegistrationPeriod(
          race
        );
        const regStart = regStartRaw ? toKST(regStartRaw) : null;
        const regEnd = regEndRaw ? toKST(regEndRaw) : null;

        if (regStart && isBefore(now, regStart)) return "upcoming";
        if (regStart && !isBefore(now, regStart) && (!regEnd || !isAfter(now, regEnd)))
          return "open";
        if (regEnd && isAfter(now, regEnd)) return "closed";

        return "upcoming";
      }
    }

    // 레거시: RaceCategory 없으면 날짜 기반으로만 판단
    const { start: regStartRaw, end: regEndRaw } = getRaceRegistrationPeriod(
      race
    );
    const regStart = regStartRaw ? toKST(regStartRaw) : null;
    const regEnd = regEndRaw ? toKST(regEndRaw) : null;

    if (regEnd && isAfter(now, regEnd)) return "closed";
    if (regStart && !isBefore(now, regStart) && (!regEnd || !isAfter(now, regEnd)))
      return "open";
    if (regStart && isBefore(now, regStart)) return "upcoming";

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

  return (
    <>
      <Header />
      <main className="flex-1 w-full bg-background-light dark:bg-background-dark">
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
          <WheelList dayGroups={dayGroups} />
        </Suspense>
      </main>
    </>
  );
}
