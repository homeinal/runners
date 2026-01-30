import { RankingEntry } from "./RankingBoard";
import { Medal, Timer } from "lucide-react";

function formatPace(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="size-12 rounded-full bg-yellow-400 border-2 border-border-dark flex items-center justify-center shadow-(--shadow-neobrutalism-sm)">
        <span className="text-xl font-black text-border-dark">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="size-12 rounded-full bg-gray-300 border-2 border-border-dark flex items-center justify-center shadow-(--shadow-neobrutalism-sm)">
        <span className="text-xl font-black text-border-dark">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="size-12 rounded-full bg-amber-600 border-2 border-border-dark flex items-center justify-center shadow-(--shadow-neobrutalism-sm)">
        <span className="text-xl font-black text-white">3</span>
      </div>
    );
  }
  return (
    <div className="size-12 rounded-full bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white flex items-center justify-center">
      <span className="text-lg font-black">{rank}</span>
    </div>
  );
}

interface RankingListProps {
  entries: RankingEntry[];
  type: "distance" | "pace";
}

export function RankingList({ entries, type }: RankingListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border-2 border-border-dark dark:border-white">
        <Medal className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-bold">아직 오늘의 기록이 없습니다</p>
        <p className="text-sm mt-2 text-gray-500">첫 번째 기록을 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center gap-4 p-4 rounded-xl border-2 border-border-dark dark:border-white bg-white dark:bg-background-dark transition-all ${
            entry.rank <= 3
              ? "shadow-(--shadow-neobrutalism)"
              : "shadow-(--shadow-neobrutalism-sm)"
          }`}
        >
          {/* Rank */}
          <RankBadge rank={entry.rank} />

          {/* User Avatar */}
          <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-border-dark dark:border-white flex items-center justify-center shrink-0 overflow-hidden">
            {entry.userImage ? (
              <img src={entry.userImage} alt={entry.userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black">
                {entry.userName.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{entry.userName}</p>
            <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Timer size={14} />
                {formatDuration(entry.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Main Stat */}
          <div className="text-right shrink-0">
            {type === "distance" ? (
              <>
                <p className="text-2xl font-black text-border-dark dark:text-white">
                  {entry.distanceKm.toFixed(2)}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase">km</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-border-dark dark:text-white">
                  {formatPace(entry.paceSeconds)}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase">/km</p>
              </>
            )}
          </div>

          {/* Secondary Stat */}
          <div className="text-right shrink-0 hidden md:block w-20">
            {type === "distance" ? (
              <>
                <p className="text-sm font-bold">{formatPace(entry.paceSeconds)}</p>
                <p className="text-xs text-gray-500">/km</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold">{entry.distanceKm.toFixed(2)}</p>
                <p className="text-xs text-gray-500">km</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
