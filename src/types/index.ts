import type {
  Race,
  RaceCategory,
  RaceSchedule,
  ScheduleType,
  CategoryStatus,
} from "@prisma/client";

// Prisma 모델 타입 re-export
export type { Race, RaceCategory, RaceSchedule, ScheduleType, CategoryStatus };

// 확장 타입 (관계 포함)
export type RaceCategoryWithSchedules = RaceCategory & {
  schedules: RaceSchedule[];
};

export type RaceWithCategories = Race & {
  categories: RaceCategoryWithSchedules[];
};

// 레거시 타입 (호환성 유지용)
export type RegistrationStatus = "접수 중" | "접수 예정" | "마감" | "정보 없음";

export type SortOption = "deadline" | "date" | "popular";

export type RegionFilter = "전체" | "한국" | "일본" | "미국" | "유럽" | "기타";

export interface RaceListParams {
  sort?: SortOption;
  region?: RegionFilter;
  status?: RegistrationStatus | "전체";
  page?: number;
  limit?: number;
}

export interface PaginatedRaces {
  races: Race[];
  total: number;
  hasMore: boolean;
}

// 유틸리티 타입
export interface FeeStructure {
  default?: number;
  options?: Array<{
    label: string;
    price: number;
  }>;
}
