import type { Race } from "@prisma/client";

export type { Race };

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
