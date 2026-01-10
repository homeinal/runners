import type { RaceWithCategories } from "@/types";
import { RaceCard } from "./RaceCard";
import { Icon } from "@/components/ui/Icon";

interface RaceListProps {
  races: RaceWithCategories[];
}

export function RaceList({ races }: RaceListProps) {
  if (races.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon name="search_off" className="text-6xl text-border-dark/30 mb-4" />
        <p className="text-xl font-bold text-border-dark/60">
          표시할 대회가 없습니다
        </p>
        <p className="text-sm text-border-dark/40 mt-2">
          다른 필터 조건을 선택해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {races.map((race) => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  );
}
