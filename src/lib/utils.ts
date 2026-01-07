import { toKST, formatDateKorean, hoursUntil, getRegistrationStatus } from "./date";
import type { RegistrationStatus, RegistrationStatusLabel } from "@/types";

export function formatDate(date: Date | string): string {
  return formatDateKorean(date);
}

export function formatDayMonth(date: Date | string): { day: string; month: string } {
  const kst = toKST(date);
  return {
    day: kst.getDate().toString(),
    month: `${kst.getMonth() + 1}월`,
  };
}

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
    case "접수 예정":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-800",
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

export function isUrgent(registrationEnd: Date | string | null): boolean {
  if (!registrationEnd) return false;
  const hours = hoursUntil(registrationEnd);
  return hours > 0 && hours <= 24;
}

export function formatRegistrationPeriod(
  start: Date | string | null,
  end: Date | string | null
): string {
  if (!start || !end) return "기간 미정";
  const startKst = toKST(start);
  const endKst = toKST(end);
  const formatShort = (d: Date) => `${d.getMonth() + 1}월${d.getDate()}일`;
  return `${formatShort(startKst)} - ${formatShort(endKst)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, RegistrationStatusLabel> = {
  open: "접수 중",
  closed: "마감",
  unknown: "정보 없음",
};

export function getRaceRegistrationStatus(race: {
  registrationStatus?: RegistrationStatus | null;
  registrationStartAt?: Date | string | null;
  registrationEndAt?: Date | string | null;
}): RegistrationStatusLabel {
  if (race.registrationStartAt || race.registrationEndAt) {
    const status = getRegistrationStatus(
      race.registrationStartAt ?? null,
      race.registrationEndAt ?? null
    );
    if (status === "open") return "접수 중";
    if (status === "closed") return "마감";
    return "접수 예정";
  }

  if (race.registrationStatus) {
    return REGISTRATION_STATUS_LABELS[race.registrationStatus];
  }

  return "정보 없음";
}

export function getRaceCategoryNames(race: {
  categories?: Array<{ canonicalName?: string | null; rawName: string }>;
  categoriesRaw?: string[] | null;
}): string[] {
  if (race.categories && race.categories.length > 0) {
    return race.categories.map((c) => c.canonicalName || c.rawName);
  }

  if (race.categoriesRaw && race.categoriesRaw.length > 0) {
    return race.categoriesRaw;
  }

  return [];
}

export function getRaceRegistrationPeriod(race: {
  registrationStartAt?: Date | null;
  registrationEndAt?: Date | null;
}): { start: Date | null; end: Date | null } {
  return {
    start: race.registrationStartAt || null,
    end: race.registrationEndAt || null,
  };
}
