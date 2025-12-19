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

const KST_OFFSET = 9 * 60 * 60 * 1000; // milliseconds

// KST 자정으로 내리는 함수 (문자열 파싱 없이 오프셋 기반)
function startOfDayKST(date: Date) {
  const utcMs = date.getTime();
  const kstMs = utcMs + KST_OFFSET;
  const startKstMs = Math.floor(kstMs / 86_400_000) * 86_400_000;
  const startUtcMs = startKstMs - KST_OFFSET;
  return new Date(startUtcMs);
}

// KST 기준 요일(0=Sun) 가져오기
function getKstDay(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET);
  return kst.getUTCDay();
}

// KST 기준 주간 범위 (월~일)
function getWeekBoundariesKST(date: Date) {
  const base = startOfDayKST(date);
  const day = getKstDay(base); // 0=Sun ... 6=Sat in KST
  const diff = day === 0 ? -6 : 1 - day; // move to Monday

  const weekStart = new Date(base.getTime() + diff * 86_400_000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86_400_000 + (86_400_000 - 1));
  return { weekStart, weekEnd };
}

// KST 기준 주간 날짜 배열
function getWeekDatesKST(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(weekStart.getTime() + i * 86_400_000));
  }
  return dates;
}

function isSameDayKST(d1: Date, d2: Date): boolean {
  return startOfDayKST(d1).getTime() === startOfDayKST(d2).getTime();
}

// KST 기준의 오늘 날짜(00:00:00)
function getTodayKST() {
  return startOfDayKST(new Date());
}

export default async function WeeklyPage({ searchParams }: UrgentPageProps) {
  const params = await searchParams;

  // 한국 시간 기준의 오늘 날짜 생성
  const todayKST = getTodayKST();

  // Parse week parameter or use current week (based on KST today)
  let baseDate = todayKST;
  if (params.week) {
    const parsed = new Date(params.week);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
      // 파라미터 날짜를 KST 자정으로 보정
      baseDate = startOfDayKST(baseDate);
    }
  }

  const { weekStart, weekEnd } = getWeekBoundariesKST(baseDate);
  const weekDates = getWeekDatesKST(weekStart);

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

  const now = new Date(); // 로직 비교용 현재 시간 (UTC 등 서버 시간)

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

      // 접수시작일이 이 날짜와 같은 경우만 (KST 기준)
      if (isSameDayKST(regStart, date)) {
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

    const targetDate = startOfDayKST(date);
    const todayTarget = startOfDayKST(todayKST);

    return {
      date,
      races: racesForDay,
      isPast: targetDate.getTime() < todayTarget.getTime(),
      isToday: targetDate.getTime() === todayTarget.getTime(),
      isTomorrow: targetDate.getTime() === todayTarget.getTime() + 86_400_000, // 24시간 후
      openCount,
    };
  });

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-24" />}>
          <WeekNavigator
            currentDate={todayKST} // KST 오늘 날짜 전달
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
