"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RaceWithCategories, CategoryStatus } from "@/types";

interface Props {
  race: RaceWithCategories;
}

const STATUS_OPTIONS: { value: CategoryStatus; label: string }[] = [
  { value: "UPCOMING", label: "접수 예정" },
  { value: "OPEN", label: "접수 중" },
  { value: "CLOSED", label: "마감" },
  { value: "CANCELLED", label: "취소" },
];

const REGISTRATION_STATUS_OPTIONS = [
  { value: "접수 중", label: "접수 중" },
  { value: "접수 예정", label: "접수 예정" },
  { value: "마감", label: "마감" },
];

export default function RaceEditClient({ race: initialRace }: Props) {
  const [race, setRace] = useState(initialRace);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const formatDateOnly = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  const handleRaceChange = (
    field: keyof typeof race,
    value: string | boolean | Date | null
  ) => {
    setRace((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (
    categoryId: string,
    field: string,
    value: string | CategoryStatus
  ) => {
    setRace((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const handleScheduleChange = (
    categoryId: string,
    scheduleId: string,
    field: string,
    value: string | null
  ) => {
    setRace((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              schedules: cat.schedules.map((sch) =>
                sch.id === scheduleId
                  ? { ...sch, [field]: value ? new Date(value) : null }
                  : sch
              ),
            }
          : cat
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/races/${race.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(race),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "저장되었습니다." });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "저장에 실패했습니다.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/mrth-manage/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 목록으로
            </button>
            <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
              {race.title}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`max-w-5xl mx-auto px-4 mt-4 ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          <div
            className={`p-4 rounded-lg ${
              message.type === "success" ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대회명
              </label>
              <input
                type="text"
                value={race.title}
                onChange={(e) => handleRaceChange("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대회일
              </label>
              <input
                type="date"
                value={formatDateOnly(race.eventDate)}
                onChange={(e) =>
                  handleRaceChange(
                    "eventDate",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지역
              </label>
              <input
                type="text"
                value={race.region || ""}
                onChange={(e) => handleRaceChange("region", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                장소
              </label>
              <input
                type="text"
                value={race.venue || ""}
                onChange={(e) => handleRaceChange("venue", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주최사
              </label>
              <input
                type="text"
                value={race.organizer || ""}
                onChange={(e) => handleRaceChange("organizer", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                웹사이트
              </label>
              <input
                type="url"
                value={race.website || ""}
                onChange={(e) => handleRaceChange("website", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Registration Status (Legacy) */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            접수 상태 (레거시)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접수 상태
              </label>
              <select
                value={race.registrationStatus || ""}
                onChange={(e) =>
                  handleRaceChange("registrationStatus", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              >
                <option value="">선택</option>
                {REGISTRATION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접수 시작
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(race.registrationStart)}
                onChange={(e) =>
                  handleRaceChange(
                    "registrationStart",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접수 마감
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(race.registrationEnd)}
                onChange={(e) =>
                  handleRaceChange(
                    "registrationEnd",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={race.isFeatured}
                onChange={(e) =>
                  handleRaceChange("isFeatured", e.target.checked)
                }
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">추천 대회</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={race.isUrgent}
                onChange={(e) => handleRaceChange("isUrgent", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">긴급 (24시간 내 마감)</span>
            </label>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            종목 ({race.categories.length}개)
          </h2>
          <div className="space-y-6">
            {race.categories.map((category, idx) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    종목 {idx + 1}: {category.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종목명
                    </label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) =>
                        handleCategoryChange(category.id, "name", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <select
                      value={category.status}
                      onChange={(e) =>
                        handleCategoryChange(
                          category.id,
                          "status",
                          e.target.value as CategoryStatus
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      출발 시간
                    </label>
                    <input
                      type="text"
                      value={category.startTime || ""}
                      onChange={(e) =>
                        handleCategoryChange(
                          category.id,
                          "startTime",
                          e.target.value
                        )
                      }
                      placeholder="HH:mm"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                  </div>
                </div>

                {/* Schedules */}
                {category.schedules.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      일정
                    </h4>
                    <div className="space-y-2">
                      {category.schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                schedule.type === "REGISTRATION"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {schedule.type === "REGISTRATION"
                                ? "접수"
                                : "결제"}
                            </span>
                            {schedule.label && (
                              <span className="ml-2 text-sm text-gray-600">
                                ({schedule.label})
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              시작
                            </label>
                            <input
                              type="datetime-local"
                              value={formatDateForInput(schedule.startAt)}
                              onChange={(e) =>
                                handleScheduleChange(
                                  category.id,
                                  schedule.id,
                                  "startAt",
                                  e.target.value || null
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              종료
                            </label>
                            <input
                              type="datetime-local"
                              value={formatDateForInput(schedule.endAt)}
                              onChange={(e) =>
                                handleScheduleChange(
                                  category.id,
                                  schedule.id,
                                  "endAt",
                                  e.target.value || null
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {race.categories.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                등록된 종목이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* Additional Info */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">추가 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공통 안내사항
              </label>
              <textarea
                value={race.generalGuide || ""}
                onChange={(e) => handleRaceChange("generalGuide", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  type="text"
                  value={race.phone || ""}
                  onChange={(e) => handleRaceChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={race.email || ""}
                  onChange={(e) => handleRaceChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
