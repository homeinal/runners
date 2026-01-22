"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RaceWithCategoriesPlain } from "@/types";
import { getRaceRegistrationStatus } from "@/lib/utils";

interface Props {
  races: RaceWithCategoriesPlain[];
}

export default function AdminDashboardClient({ races }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/mrth-manage");
  };

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.region?.toLowerCase().includes(searchQuery.toLowerCase());

    const now = new Date();
    let matchesStatus = true;
    const statusLabel = getRaceRegistrationStatus(race);

    if (statusFilter === "upcoming") {
      matchesStatus = race.eventStartAt > now;
    } else if (statusFilter === "past") {
      matchesStatus = race.eventStartAt <= now;
    } else if (statusFilter === "open") {
      matchesStatus = statusLabel === "접수 중";
    } else if (statusFilter === "closed") {
      matchesStatus = statusLabel === "마감";
    }

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (race: RaceWithCategoriesPlain) => {
    const status = getRaceRegistrationStatus(race);
    if (status === "접수 중") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          접수 중
        </span>
      );
    } else if (status === "접수 예정") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          접수 예정
        </span>
      );
    } else if (status === "마감") {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          마감
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        정보 없음
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            마라톤 대회 관리
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/mrth-manage/posts")}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              글 관리
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="대회명 또는 지역으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
            >
              <option value="all">전체</option>
              <option value="upcoming">예정된 대회</option>
              <option value="past">지난 대회</option>
              <option value="open">접수 중</option>
              <option value="closed">마감</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">전체 대회</p>
            <p className="text-2xl font-bold text-gray-900">{races.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">접수 중</p>
            <p className="text-2xl font-bold text-green-600">
              {races.filter((r) => getRaceRegistrationStatus(r) === "접수 중").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">접수 예정</p>
            <p className="text-2xl font-bold text-blue-600">
              {races.filter((r) => getRaceRegistrationStatus(r) === "접수 예정").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">마감</p>
            <p className="text-2xl font-bold text-gray-600">
              {races.filter((r) => getRaceRegistrationStatus(r) === "마감").length}
            </p>
          </div>
        </div>

        {/* Race List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    대회명
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    대회일
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    지역
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    상태
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    종목
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRaces.map((race) => (
                  <tr key={race.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {race.isFeatured && (
                          <span className="text-yellow-500">★</span>
                        )}
                        {race.isUrgent && (
                          <span className="text-red-500">🔥</span>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {race.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(race.eventStartAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {race.region || "-"}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(race)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {race.categories.length}개
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {race.website && (
                          <a
                            href={race.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            홈페이지
                          </a>
                        )}
                        <button
                          onClick={() =>
                            router.push(`/mrth-manage/races/${race.id}`)
                          }
                          className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          수정
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRaces.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              조건에 맞는 대회가 없습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
