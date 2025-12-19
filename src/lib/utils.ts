import { toKST, formatDateKorean, nowKST, hoursUntil } from "./date";

/**
 * Format date to Korean locale string
 */
export function formatDate(date: Date | string): string {
  return formatDateKorean(date);
}

/**
 * Format date to day/month format
 */
export function formatDayMonth(date: Date | string): { day: string; month: string } {
  const kst = toKST(date);
  return {
    day: kst.getDate().toString(),
    month: `${kst.getMonth() + 1}월`,
  };
}

/**
 * Get registration status badge color
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "접수 중":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-800",
      };
    case "얼리버드":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-800",
      };
    case "대기 접수":
      return {
        bg: "bg-gray-200",
        text: "text-gray-800",
        border: "border-gray-800",
      };
    case "마감":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-800",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-600",
      };
  }
}

/**
 * Check if registration is closing within 24 hours
 */
export function isUrgent(registrationEnd: Date | string | null): boolean {
  if (!registrationEnd) return false;
  const hours = hoursUntil(registrationEnd);
  return hours > 0 && hours <= 24;
}

/**
 * Format registration period
 */
export function formatRegistrationPeriod(
  start: Date | string | null,
  end: Date | string | null
): string {
  if (!start || !end) return "기간 미정";
  const startKst = toKST(start);
  const endKst = toKST(end);
  const formatShort = (d: Date) =>
    `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${formatShort(startKst)} - ${formatShort(endKst)}`;
}

/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get registration status from race (supports both legacy and new structure)
 */
export function getRaceRegistrationStatus(race: {
  registrationStatus?: string | null;
  categories?: Array<{ status: string }>;
}): string {
  // 우선 레거시 필드 사용
  if (race.registrationStatus) {
    return race.registrationStatus;
  }

  // 새 구조: 카테고리 상태 기반
  if (race.categories && race.categories.length > 0) {
    const statuses = race.categories.map((c) => c.status);
    if (statuses.includes("OPEN")) return "접수 중";
    if (statuses.includes("UPCOMING")) return "접수 예정";
    if (statuses.every((s) => s === "CLOSED")) return "마감";
  }

  return "정보 없음";
}

/**
 * Get category names from race (supports both legacy and new structure)
 */
export function getRaceCategoryNames(race: {
  legacyCategories?: string[];
  categories?: Array<{ name: string }>;
}): string[] {
  // 새 구조 우선
  if (race.categories && race.categories.length > 0) {
    return race.categories.map((c) => c.name);
  }

  // 레거시 필드 사용
  if (race.legacyCategories && race.legacyCategories.length > 0) {
    return race.legacyCategories;
  }

  return [];
}

/**
 * Get first registration schedule from race categories
 */
export function getRaceRegistrationPeriod(race: {
  registrationStart?: Date | null;
  registrationEnd?: Date | null;
  categories?: Array<{
    schedules?: Array<{
      type: string;
      startAt?: Date | null;
      endAt?: Date | null;
    }>;
  }>;
}): { start: Date | null; end: Date | null } {
  // 우선 레거시 필드 사용
  if (race.registrationStart || race.registrationEnd) {
    return {
      start: race.registrationStart || null,
      end: race.registrationEnd || null,
    };
  }

  // 새 구조: 첫 번째 카테고리의 REGISTRATION 스케줄
  if (race.categories && race.categories.length > 0) {
    const firstCategory = race.categories[0];
    if (firstCategory.schedules) {
      const regSchedule = firstCategory.schedules.find(
        (s) => s.type === "REGISTRATION"
      );
      if (regSchedule) {
        return {
          start: regSchedule.startAt || null,
          end: regSchedule.endAt || null,
        };
      }
    }
  }

  return { start: null, end: null };
}
