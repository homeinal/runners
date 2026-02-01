"use client";

import { useState } from "react";
import { Trash2, Footprints, Plus } from "lucide-react";
import Link from "next/link";

type RunRecord = {
  id: string;
  distanceKm: number;
  paceSeconds: number;
  durationSeconds: number;
  calories: number | null;
  runDate: string;
  screenshotUrl: string | null;
};

type MyPageClientProps = {
  records: RunRecord[];
};

export function MyPageClient({ records: initialRecords }: MyPageClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [deleting, setDeleting] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatPace = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}'${secs.toString().padStart(2, "0")}"`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;

    setDeleting(id);

    try {
      const res = await fetch(`/api/ranking/records/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "삭제 실패");
      }

      // Optimistic UI update
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다");
    } finally {
      setDeleting(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-(--shadow-neobrutalism)">
        <Footprints className="size-16 text-gray-300 dark:text-gray-600" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-4">
            아직 러닝 기록이 없습니다
          </p>
          <Link
            href="/ranking/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark text-border-dark dark:text-white font-black uppercase tracking-tight border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all"
          >
            <Plus className="size-5" />
            첫 기록 업로드
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight">
          러닝 기록
          <span className="ml-2 text-sm text-gray-500">({records.length})</span>
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism) hover:translate-x-px hover:translate-y-px transition-all"
          >
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-500 mb-2">
                {formatDate(record.runDate)}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{record.distanceKm.toFixed(1)}</span>
                  <span className="text-sm font-bold text-gray-500">km</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black">{formatPace(record.paceSeconds)}</span>
                  <span className="text-xs font-bold text-gray-500">/km</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black">{formatDuration(record.durationSeconds)}</span>
                </div>
                {record.calories !== null && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-orange-500">{record.calories}</span>
                    <span className="text-xs font-bold text-gray-500">kcal</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(record.id)}
              disabled={deleting === record.id}
              className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 border-2 border-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="기록 삭제"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
