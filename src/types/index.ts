import type {
  Race,
  RaceEventCategory,
  registration_status_enum,
  race_category_type_enum,
} from "@prisma/client";

export type RegistrationStatus = registration_status_enum;
export type RaceCategoryType = race_category_type_enum;

// Prisma model re-exports
export type { Race, RaceEventCategory };

export type RaceWithCategories = Race & {
  categories: RaceEventCategory[];
};

export type RaceEventCategoryPlain = Omit<RaceEventCategory, "distanceKm"> & {
  distanceKm: number | null;
};

export type RaceWithCategoriesPlain = Race & {
  categories: RaceEventCategoryPlain[];
};

// UI-friendly registration labels
export type RegistrationStatusLabel =
  | "접수 중"
  | "접수 예정"
  | "마감"
  | "정보 없음";

export type SortOption = "registration" | "date" | "popular";

export type RegionFilter = string;

export interface RaceListParams {
  sort?: SortOption;
  region?: RegionFilter;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedRaces {
  races: Race[];
  total: number;
  hasMore: boolean;
}

// Utility types
export interface FeeStructure {
  default?: number;
  options?: Array<{
    label: string;
    price: number;
  }>;
}
