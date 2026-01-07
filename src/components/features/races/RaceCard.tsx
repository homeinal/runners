import Link from "next/link";
import type { RaceWithCategories } from "@/types";
import { formatDayMonth, getRaceRegistrationStatus, getRaceCategoryNames } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface RaceCardProps {
  race: RaceWithCategories;
}

export function RaceCard({ race }: RaceCardProps) {
  const { day, month } = formatDayMonth(race.eventStartAt);
  const registrationStatus = getRaceRegistrationStatus(race);
  const categoryNames = Array.from(new Set(getRaceCategoryNames(race)));
  const displayed = categoryNames.slice(0, 3);
  const overflow = categoryNames.length - displayed.length;

  return (
    <Link
      href={`/races/${race.id}`}
      prefetch={false}
      className="flex flex-col md:flex-row items-center bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] p-4 gap-4 hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all group cursor-pointer"
    >
      {/* Date */}
      <div className="flex flex-row md:flex-col items-center justify-center gap-1 min-w-[100px] md:border-r-2 border-border-dark/20 dark:border-white/20 pr-4 md:pr-6 md:mr-2">
        <span className="text-4xl font-black text-border-dark dark:text-primary">
          {day}
        </span>
        <span className="text-lg font-bold uppercase tracking-wider text-border-dark dark:text-white">
          {month}
        </span>
      </div>

      {/* Image & Info */}
      <div className="flex-1 flex items-center gap-4 w-full">
        {/* Thumbnail */}
        <div
          className="size-16 rounded-lg border-2 border-border-dark dark:border-white bg-cover bg-center shrink-0"
          style={{
            backgroundImage: race.imageUrl
              ? `url('${race.imageUrl}')`
              : undefined,
            backgroundColor: race.imageUrl ? undefined : "#e5e5e5",
          }}
        >
          {!race.imageUrl && (
            <div className="size-full flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-gray-400">
                directions_run
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold uppercase leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
            {race.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="material-symbols-outlined text-lg">
              location_on
            </span>
            <span className="text-sm font-medium">
              {race.country} {race.region}
            </span>
            <Badge variant="status" status={registrationStatus}>
              {registrationStatus}
            </Badge>
          </div>
          {displayed.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {displayed.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
              {overflow > 0 && (
                <Badge variant="outline">+{overflow}</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
        <span className="w-full md:w-auto block text-center bg-white dark:bg-transparent text-border-dark dark:text-white border-2 border-border-dark dark:border-white px-5 py-2 rounded-full font-bold text-sm group-hover:bg-border-dark group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-border-dark transition-colors uppercase">
          상세 보기
        </span>
      </div>
    </Link>
  );
}
