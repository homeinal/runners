import Link from "next/link";
import type { RaceWithCategories } from "@/types";
import { formatDate } from "@/lib/utils";

interface FeaturedRaceCardProps {
  race: RaceWithCategories;
}

export function FeaturedRaceCard({ race }: FeaturedRaceCardProps) {
  const eventDate = new Date(race.eventStartAt);
  const month = eventDate.toLocaleDateString("ko-KR", { month: "long" });
  const day = eventDate.getDate();

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Red slanted background */}
        <div className="absolute -inset-1 bg-[#ff4d4d] rounded-xl skew-y-1 scale-105 border-2 border-border-dark z-0" />

        {/* Main card */}
        <div className="relative flex flex-col items-stretch border-4 border-border-dark bg-primary rounded-xl overflow-hidden shadow-[var(--shadow-neobrutalism)] z-10 transition-transform duration-300 hover:-translate-y-1">
          {/* Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
            <div>
              {/* Urgent badge */}
              <div className="inline-flex items-center gap-2 bg-[#ff4d4d] border-2 border-border-dark px-3 py-1 rounded-full mb-3 shadow-[var(--shadow-neobrutalism-sm)]">
                <span className="material-symbols-outlined text-white text-base">
                  local_fire_department
                </span>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  긴급 • 24시간 내 마감
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-black uppercase leading-none tracking-tight mb-2 text-border-dark">
                {race.title}
              </h2>

              {/* Date & Location */}
              <p className="text-lg font-bold text-border-dark/80">
                {month} {day}일 • {race.country} {race.region}
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Link
                href={`/races/${race.id}`}
                prefetch={false}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-[var(--shadow-neobrutalism-sm)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                지금 등록하기
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
