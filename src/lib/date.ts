/**
 * 중앙화된 날짜/시간 유틸리티
 * 모든 날짜 처리는 KST(한국 표준시) 기준으로 통일
 */

import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isBefore,
  isAfter,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInDays,
  parseISO,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { ko } from "date-fns/locale";

// 한국 표준시 타임존
export const KST_TIMEZONE = "Asia/Seoul";

// ============================================
// 기본 변환 함수들
// ============================================

/**
 * Date 또는 문자열을 Date 객체로 변환
 * Server Component에서 Client Component로 전달 시 직렬화 대응
 */
export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return parseISO(value);
}

/**
 * Date를 KST 기준 Date로 변환
 * UTC Date를 한국 시간대로 해석
 */
export function toKST(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(d, KST_TIMEZONE);
}

/**
 * 현재 시간을 KST로 가져오기
 */
export function nowKST(): Date {
  return toZonedTime(new Date(), KST_TIMEZONE);
}

/**
 * KST 날짜를 UTC로 변환 (DB 저장용)
 */
export function toUTC(kstDate: Date): Date {
  return fromZonedTime(kstDate, KST_TIMEZONE);
}

// ============================================
// 날짜 시작/끝 함수들 (KST 기준)
// ============================================

/**
 * KST 기준 해당 날짜의 시작 (00:00:00)
 */
export function startOfDayKST(date: Date | string): Date {
  const kst = toKST(date);
  return startOfDay(kst);
}

/**
 * KST 기준 오늘의 시작
 */
export function todayKST(): Date {
  return startOfDay(nowKST());
}

/**
 * KST 기준 주의 시작 (월요일)
 */
export function startOfWeekKST(date: Date | string): Date {
  const kst = toKST(date);
  return startOfWeek(kst, { weekStartsOn: 1 }); // 월요일 시작
}

/**
 * KST 기준 주의 끝 (일요일 23:59:59.999)
 */
export function endOfWeekKST(date: Date | string): Date {
  const kst = toKST(date);
  return endOfWeek(kst, { weekStartsOn: 1 });
}

/**
 * KST 기준 주간 범위 가져오기
 */
export function getWeekRangeKST(date: Date | string): {
  weekStart: Date;
  weekEnd: Date;
} {
  return {
    weekStart: startOfWeekKST(date),
    weekEnd: endOfWeekKST(date),
  };
}

/**
 * KST 기준 주간 날짜 배열 (월~일, 7일)
 */
export function getWeekDatesKST(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i));
  }
  return dates;
}

// ============================================
// 월간 관련 함수들 (KST 기준)
// ============================================

/**
 * KST 기준 월의 시작 (1일 00:00:00)
 */
export function startOfMonthKST(date: Date | string): Date {
  const kst = toKST(date);
  return startOfMonth(kst);
}

/**
 * KST 기준 월의 끝 (마지막일 23:59:59.999)
 */
export function endOfMonthKST(date: Date | string): Date {
  const kst = toKST(date);
  return endOfMonth(kst);
}

/**
 * KST 기준 월간 범위 가져오기
 */
export function getMonthRangeKST(date: Date | string): {
  monthStart: Date;
  monthEnd: Date;
} {
  return {
    monthStart: startOfMonthKST(date),
    monthEnd: endOfMonthKST(date),
  };
}

/**
 * KST 기준 해당 월의 모든 날짜 배열
 */
export function getMonthDatesKST(monthStart: Date): Date[] {
  const dates: Date[] = [];
  const monthEnd = endOfMonth(monthStart);
  const totalDays = differenceInDays(monthEnd, monthStart) + 1;

  for (let i = 0; i < totalDays; i++) {
    dates.push(addDays(monthStart, i));
  }
  return dates;
}

/**
 * 월 단위로 날짜 이동
 */
export function addMonthsKST(date: Date | string, months: number): Date {
  return addMonths(toKST(date), months);
}

/**
 * KST 기준 같은 월인지 확인
 */
export function isSameMonthKST(
  date1: Date | string,
  date2: Date | string
): boolean {
  return isSameMonth(toKST(date1), toKST(date2));
}

// ============================================
// 날짜 비교 함수들 (KST 기준)
// ============================================

/**
 * KST 기준 같은 날인지 확인
 */
export function isSameDayKST(
  date1: Date | string,
  date2: Date | string
): boolean {
  return isSameDay(toKST(date1), toKST(date2));
}

/**
 * KST 기준 같은 주인지 확인
 */
export function isSameWeekKST(
  date1: Date | string,
  date2: Date | string
): boolean {
  return isSameWeek(toKST(date1), toKST(date2), { weekStartsOn: 1 });
}

/**
 * KST 기준 오늘인지 확인
 */
export function isTodayKST(date: Date | string): boolean {
  return isSameDay(toKST(date), nowKST());
}

/**
 * KST 기준 내일인지 확인
 */
export function isTomorrowKST(date: Date | string): boolean {
  return isSameDay(toKST(date), addDays(nowKST(), 1));
}

/**
 * KST 기준 과거인지 확인 (오늘 이전)
 */
export function isPastKST(date: Date | string): boolean {
  return isBefore(startOfDayKST(date), todayKST());
}

/**
 * KST 기준 미래인지 확인 (오늘 이후)
 */
export function isFutureKST(date: Date | string): boolean {
  return isAfter(startOfDayKST(date), todayKST());
}

// ============================================
// 날짜 연산 함수들
// ============================================

/**
 * 주 단위로 날짜 이동
 */
export function addWeeksKST(date: Date | string, weeks: number): Date {
  return addWeeks(toKST(date), weeks);
}

/**
 * 일 단위로 날짜 이동
 */
export function addDaysKST(date: Date | string, days: number): Date {
  return addDays(toKST(date), days);
}

// ============================================
// 포맷팅 함수들 (KST 기준)
// ============================================

/**
 * KST 기준 날짜 포맷 (YYYY-MM-DD)
 * URL 파라미터나 키로 사용
 */
export function formatDateKey(date: Date | string): string {
  return format(toKST(date), "yyyy-MM-dd");
}

/**
 * KST 기준 날짜 포맷 (YYYY.MM.DD)
 */
export function formatDateDot(date: Date | string): string {
  return format(toKST(date), "yyyy.MM.dd");
}

/**
 * KST 기준 짧은 날짜 포맷 (MM.DD)
 */
export function formatDateShort(date: Date | string): string {
  return format(toKST(date), "MM.dd");
}

/**
 * KST 기준 날짜 + 요일 포맷 (MM.DD (요일))
 */
export function formatDateWithDay(date: Date | string): string {
  return format(toKST(date), "MM.dd (EEE)", { locale: ko });
}

/**
 * KST 기준 날짜 + 영문 요일 포맷 (MM.DD (Mon))
 */
export function formatDateWithDayEn(date: Date | string): string {
  return format(toKST(date), "MM.dd (EEE)");
}

/**
 * KST 기준 시간 포맷 (HH:mm)
 */
export function formatTime(date: Date | string): string {
  return format(toKST(date), "HH:mm");
}

/**
 * KST 기준 전체 날짜시간 포맷
 */
export function formatDateTime(date: Date | string): string {
  return format(toKST(date), "yyyy.MM.dd HH:mm");
}

/**
 * KST 기준 한글 날짜 포맷 (M월 D일)
 */
export function formatDateKorean(date: Date | string): string {
  return format(toKST(date), "M월 d일", { locale: ko });
}

/**
 * KST 기준 한글 날짜+요일 포맷 (M월 D일 (요일))
 */
export function formatDateKoreanWithDay(date: Date | string): string {
  return format(toKST(date), "M월 d일 (EEE)", { locale: ko });
}

/**
 * KST 기준 현재 시간 포맷 (상태바용)
 * 예: "12월 19일 (목) 02:30 PM"
 */
export function formatCurrentTimeKorean(date: Date | string): string {
  const kst = toKST(date);
  const month = kst.getMonth() + 1;
  const day = kst.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[kst.getDay()];
  const hours = kst.getHours();
  const minutes = String(kst.getMinutes()).padStart(2, "0");
  const ampm = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 || 12;
  return `${month}월 ${day}일 (${weekday}) ${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
}

/**
 * 날짜 정보 분리 (캘린더 등에서 사용)
 */
export function getDateParts(date: Date | string): {
  year: number;
  month: number;
  day: number;
  weekday: string;
  weekdayEn: string;
} {
  const kst = toKST(date);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekdaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    year: kst.getFullYear(),
    month: kst.getMonth() + 1,
    day: kst.getDate(),
    weekday: weekdays[kst.getDay()],
    weekdayEn: weekdaysEn[kst.getDay()],
  };
}

// ============================================
// 시간 차이 계산 함수들
// ============================================

/**
 * 현재부터 목표 시간까지 남은 시간 (시간 단위)
 */
export function hoursUntil(target: Date | string): number {
  return differenceInHours(toKST(target), nowKST());
}

/**
 * 현재부터 목표 시간까지 남은 시간 (분 단위)
 */
export function minutesUntil(target: Date | string): number {
  return differenceInMinutes(toKST(target), nowKST());
}

/**
 * 현재부터 목표 시간까지 남은 시간 (초 단위)
 */
export function secondsUntil(target: Date | string): number {
  return differenceInSeconds(toKST(target), nowKST());
}

/**
 * 24시간 이내인지 확인 (긴급 표시용)
 */
export function isWithin24Hours(target: Date | string): boolean {
  const hours = hoursUntil(target);
  return hours > 0 && hours <= 24;
}

/**
 * 남은 시간 포맷 (D일 H시간 M분)
 */
export function formatTimeRemaining(target: Date | string): string {
  const totalMinutes = minutesUntil(target);

  if (totalMinutes <= 0) return "마감";

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}분`);

  return parts.join(" ") || "곧 마감";
}

// ============================================
// 등록 상태 판단 함수들
// ============================================

/**
 * 등록 기간 상태 판단
 */
export function getRegistrationStatus(
  startDate: Date | string | null,
  endDate: Date | string | null
): "upcoming" | "open" | "closed" {
  const now = nowKST();

  if (startDate) {
    const start = toKST(startDate);
    if (isBefore(now, start)) return "upcoming";
  }

  if (endDate) {
    const end = toKST(endDate);
    if (isAfter(now, end)) return "closed";
  }

  if (startDate && endDate) {
    const start = toKST(startDate);
    const end = toKST(endDate);
    if (!isBefore(now, start) && !isAfter(now, end)) return "open";
  }

  return "upcoming";
}

// ============================================
// Server <-> Client 전달용 함수들
// ============================================

/**
 * Date를 ISO 문자열로 직렬화 (Server -> Client 전달용)
 * null-safe
 */
export function serializeDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * ISO 문자열을 Date로 역직렬화 (Client에서 받을 때)
 * null-safe
 */
export function deserializeDate(
  isoString: string | null | undefined
): Date | null {
  if (!isoString) return null;
  return parseISO(isoString);
}
