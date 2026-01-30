"use client";

import { useState } from "react";
import { RankingList } from "./RankingList";
import { Trophy, Zap } from "lucide-react";

export interface RankingEntry {
  id: string;
  rank: number;
  userName: string;
  userImage: string | null;
  distanceKm: number;
  paceSeconds: number;
  durationSeconds: number;
  screenshotUrl: string | null;
  createdAt: string;
}

interface RankingBoardProps {
  distanceRanking: RankingEntry[];
  paceRanking: RankingEntry[];
}

type RankingTab = "distance" | "pace";

export function RankingBoard({ distanceRanking, paceRanking }: RankingBoardProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>("distance");

  const tabCls = (tab: RankingTab) =>
    `flex-1 flex items-center justify-center gap-2 py-3 font-black text-sm uppercase transition-colors rounded-full ${
      activeTab === tab
        ? "bg-primary text-border-dark border-2 border-border-dark shadow-(--shadow-neobrutalism-sm)"
        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-full p-1.5 shadow-(--shadow-neobrutalism-sm)">
        <button onClick={() => setActiveTab("distance")} className={tabCls("distance")}>
          <Trophy size={18} />
          거리 랭킹
        </button>
        <button onClick={() => setActiveTab("pace")} className={tabCls("pace")}>
          <Zap size={18} />
          페이스 랭킹
        </button>
      </div>

      {/* Ranking List */}
      <RankingList
        entries={activeTab === "distance" ? distanceRanking : paceRanking}
        type={activeTab}
      />
    </div>
  );
}
