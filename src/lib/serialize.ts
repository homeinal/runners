import type {
  RaceWithCategories,
  RaceWithCategoriesPlain,
  RaceEventCategoryPlain,
} from "@/types";

function normalizeDistanceKm(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const asNumber = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(asNumber) ? asNumber : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function serializeCategory(
  category: RaceWithCategories["categories"][number]
): RaceEventCategoryPlain {
  return {
    ...category,
    distanceKm: normalizeDistanceKm(category.distanceKm),
  };
}

export function serializeRaceForClient(
  race: RaceWithCategories
): RaceWithCategoriesPlain {
  return {
    ...race,
    categories: race.categories.map(serializeCategory),
  };
}

export function serializeRacesForClient(
  races: RaceWithCategories[]
): RaceWithCategoriesPlain[] {
  return races.map(serializeRaceForClient);
}
