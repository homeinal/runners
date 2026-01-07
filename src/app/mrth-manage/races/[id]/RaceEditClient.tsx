"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  RaceWithCategoriesPlain,
  RaceCategoryType,
  RegistrationStatus,
} from "@/types";

interface Props {
  race: RaceWithCategoriesPlain;
}

const CATEGORY_TYPE_OPTIONS: { value: RaceCategoryType; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "walk", label: "Walk" },
  { value: "team", label: "Team" },
  { value: "para", label: "Para" },
  { value: "trail", label: "Trail" },
  { value: "race", label: "Race" },
  { value: "other", label: "Other" },
];

const REGISTRATION_STATUS_OPTIONS: {
  value: RegistrationStatus;
  label: string;
}[] = [
  { value: "open", label: "접수 중" },
  { value: "closed", label: "마감" },
  { value: "unknown", label: "정보 없음" },
];

export default function RaceEditClient({ race: initialRace }: Props) {
  const [race, setRace] = useState(initialRace);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
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
    value: string | string[] | number | null
  ) => {
    setRace((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const handleCategoryTagsChange = (categoryId: string, value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    handleCategoryChange(categoryId, "tags", tags);
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
                시작 일시
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(race.eventStartAt)}
                onChange={(e) =>
                  handleRaceChange(
                    "eventStartAt",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시용 시간
              </label>
              <input
                type="text"
                value={race.eventTimeRaw || ""}
                onChange={(e) => handleRaceChange("eventTimeRaw", e.target.value)}
                placeholder="예: 09:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                타임존
              </label>
              <input
                type="text"
                value={race.eventTimezone || ""}
                onChange={(e) => handleRaceChange("eventTimezone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                국가
              </label>
              <input
                type="text"
                value={race.country || ""}
                onChange={(e) => handleRaceChange("country", e.target.value)}
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
                주최 담당자
              </label>
              <input
                type="text"
                value={race.organizerRep || ""}
                onChange={(e) => handleRaceChange("organizerRep", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                홈페이지
              </label>
              <input
                type="url"
                value={race.website || ""}
                onChange={(e) => handleRaceChange("website", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                원문 URL
              </label>
              <input
                type="url"
                value={race.sourceUrl || ""}
                onChange={(e) => handleRaceChange("sourceUrl", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 URL
              </label>
              <input
                type="url"
                value={race.imageUrl || ""}
                onChange={(e) => handleRaceChange("imageUrl", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Registration */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">접수 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접수 상태
              </label>
              <select
                value={race.registrationStatus || "unknown"}
                onChange={(e) =>
                  handleRaceChange("registrationStatus", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              >
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
                value={formatDateForInput(race.registrationStartAt)}
                onChange={(e) =>
                  handleRaceChange(
                    "registrationStartAt",
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
                value={formatDateForInput(race.registrationEndAt)}
                onChange={(e) =>
                  handleRaceChange(
                    "registrationEndAt",
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
                onChange={(e) => handleRaceChange("isFeatured", e.target.checked)}
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
            {race.categories.map((category, idx) => {
              const distanceValue =
                category.distanceKm === null || category.distanceKm === undefined
                  ? ""
                  : category.distanceKm.toString();

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      종목 {idx + 1}: {category.rawName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        원본 명칭
                      </label>
                      <input
                        type="text"
                        value={category.rawName}
                        onChange={(e) =>
                          handleCategoryChange(
                            category.id,
                            "rawName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        표준 명칭
                      </label>
                      <input
                        type="text"
                        value={category.canonicalName}
                        onChange={(e) =>
                          handleCategoryChange(
                            category.id,
                            "canonicalName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        타입
                      </label>
                      <select
                        value={category.type}
                        onChange={(e) =>
                          handleCategoryChange(
                            category.id,
                            "type",
                            e.target.value as RaceCategoryType
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      >
                        {CATEGORY_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        거리 (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={distanceValue}
                        onChange={(e) =>
                          handleCategoryChange(
                            category.id,
                            "distanceKm",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        태그 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={(category.tags || []).join(", ")}
                        onChange={(e) =>
                          handleCategoryTagsChange(category.id, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {race.categories.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                등록된 종목이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">연락처</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
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
        </section>
      </main>
    </div>
  );
}
