"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  MessageCircle,
  Search,
  Plus,
  ChevronRight,
  Heart,
  Zap,
  Target,
  Edit,
  Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface CrewProfile {
  id: string;
  userId: string;
  nickname: string;
  region: string;
  pace: string;
  message: string | null;
  tags: string[];
  availableDays: string[];
  preferredTime: string | null;
  user: {
    image: string | null;
  };
  createdAt: string;
}

// ── Sample data ────────────────────────────────────────────────────────────
const REGIONS = [
  "전체",
  "서울 강남",
  "서울 강북",
  "서울 마포/여의도",
  "서울 송파/잠실",
  "경기 분당/판교",
  "경기 일산",
  "부산",
  "대구",
  "대전",
  "광주",
  "인천",
];

const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일"];

// ── Tab button ─────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase transition-colors whitespace-nowrap ${
        active
          ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
          : "bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

// ── Profile card ───────────────────────────────────────────────────────
function ProfileCard({
  profile,
  isMyProfile,
  onEdit,
  onDelete,
}: {
  profile: CrewProfile;
  isMyProfile?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-5 hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {profile.user.image ? (
            <img
              src={profile.user.image}
              alt={profile.nickname}
              className="size-10 bg-primary border-2 border-border-dark rounded-full object-cover"
            />
          ) : (
            <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center font-black text-sm">
              {profile.nickname[0]}
            </div>
          )}
          <div>
            <h3 className="font-bold text-base">
              {profile.nickname}
              {isMyProfile && (
                <span className="ml-2 text-xs bg-primary/30 px-2 py-0.5 rounded-full border border-border-dark/20">
                  내 프로필
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {profile.region}
            </div>
          </div>
        </div>
        {isMyProfile && (
          <div className="flex gap-1">
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg border-2 border-border-dark hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="삭제"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            페이스
          </div>
          <div className="text-sm font-bold">{profile.pace}</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            시간
          </div>
          <div className="text-sm font-bold">
            {profile.preferredTime || "-"}
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
        <div className="flex gap-1">
          {DAY_OPTIONS.map((d) => (
            <span
              key={d}
              className={`size-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                profile.availableDays.includes(d)
                  ? "bg-primary border-border-dark text-border-dark"
                  : "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-300 dark:text-gray-600"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Message */}
      {profile.message && (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <MessageCircle
            size={14}
            className="inline mr-1 text-gray-400 relative -top-px"
          />
          {profile.message}
        </p>
      )}

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/30 text-border-dark dark:text-white px-2.5 py-0.5 text-xs font-bold rounded-full border border-border-dark/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Register form ──────────────────────────────────────────────────────
function RegisterForm({
  onSubmit,
}: {
  onSubmit: (data: {
    nickname: string;
    region: string;
    pace: string;
    message: string;
    tags: string[];
    availableDays: string[];
    preferredTime: string;
  }) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [region, setRegion] = useState(REGIONS[1]);
  const [pace, setPace] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState("");

  const toggleDay = (d: string) =>
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !pace.trim()) return;
    onSubmit({
      nickname: nickname.trim(),
      region,
      pace,
      message: message.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      availableDays: days,
      preferredTime: time.trim(),
    });
  };

  const inputClass =
    "w-full border-2 border-border-dark dark:border-white rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-6 space-y-5"
    >
      <h2 className="font-black text-lg uppercase flex items-center gap-2">
        <Zap size={20} className="text-primary" />
        러닝 프로필 등록
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">닉네임 *</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="달리는 곰"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">지역 *</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={inputClass}
          >
            {REGIONS.filter((r) => r !== "전체").map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">평균 페이스 *</label>
          <input
            type="text"
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            placeholder="5:30~6:00"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">선호 시간대</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="저녁 7시"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="초보환영, 한강러닝"
            className={inputClass}
          />
        </div>
      </div>

      {/* Day selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-bold">러닝 요일</label>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`size-9 rounded-full text-sm font-bold border-2 transition-colors ${
                days.includes(d)
                  ? "bg-primary border-border-dark text-border-dark"
                  : "bg-white dark:bg-background-dark border-border-dark dark:border-white text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold">한 마디</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="같이 달릴 분에게 한 마디!"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary border-2 border-border-dark rounded-lg font-black text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all"
      >
        프로필 등록하기
      </button>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export function CrewFinderClient() {
  const [tab, setTab] = useState<"find" | "register">("find");
  const [region, setRegion] = useState("전체");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [profiles, setProfiles] = useState<CrewProfile[]>([]);
  const [myProfile, setMyProfile] = useState<CrewProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profiles from API
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (region && region !== "전체") params.append("region", region);
      if (search) params.append("search", search);
      if (selectedDay) params.append("day", selectedDay);

      const res = await fetch(`/api/crew/profiles?${params}`);
      const data = await res.json();
      setProfiles(data);
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch my profile
  const fetchMyProfile = async () => {
    try {
      const res = await fetch("/api/crew/my-profile");
      if (res.ok) {
        const data = await res.json();
        setMyProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch my profile:", error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchProfiles();
  }, [region, search, selectedDay]);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleRegister = async (formData: {
    nickname: string;
    region: string;
    pace: string;
    message: string;
    tags: string[];
    availableDays: string[];
    preferredTime: string;
  }) => {
    try {
      const res = await fetch("/api/crew/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newProfile = await res.json();
        setMyProfile(newProfile);
        await fetchProfiles();
        setTab("find");
      } else {
        const error = await res.json();
        alert(error.error || "등록에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to register profile:", error);
      alert("등록 중 오류가 발생했습니다");
    }
  };

  const handleDeleteProfile = async () => {
    if (!myProfile) return;
    if (!confirm("프로필을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/crew/profiles/${myProfile.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMyProfile(null);
        await fetchProfiles();
      } else {
        alert("삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
      alert("삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3">
        <TabButton active={tab === "find"} onClick={() => setTab("find")}>
          <Users size={14} className="inline mr-1.5 relative -top-px" />
          러닝 친구 찾기
        </TabButton>
        {!myProfile && (
          <TabButton
            active={tab === "register"}
            onClick={() => setTab("register")}
          >
            <Plus size={14} className="inline mr-1.5 relative -top-px" />
            프로필 등록
          </TabButton>
        )}
      </div>

      {/* ── Find tab ──────────────────────────────────────────────── */}
      {tab === "find" && (
        <div className="space-y-5">
          {/* My Profile Section */}
          {myProfile && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase text-gray-500">
                내 프로필
              </h3>
              <ProfileCard
                profile={myProfile}
                isMyProfile={true}
                onDelete={handleDeleteProfile}
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="닉네임, 태그, 메시지 검색..."
                className="w-full border-2 border-border-dark dark:border-white rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border-2 border-border-dark dark:border-white rounded-lg px-3 py-2.5 text-sm font-bold bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border-2 border-border-dark dark:border-white rounded-lg px-3 py-2.5 text-sm font-bold bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">모든 요일</option>
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}요일
                </option>
              ))}
            </select>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-bold">로딩 중...</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <p className="text-sm text-gray-500 font-bold">
                {profiles.length}명의 러너
              </p>

              {/* Profile grid */}
              {profiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles.map((p) => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      isMyProfile={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Target size={48} className="mx-auto text-gray-300" />
                  <p className="text-gray-400 font-bold">
                    조건에 맞는 러너가 없습니다.
                  </p>
                  {!myProfile && (
                    <button
                      onClick={() => setTab("register")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border-2 border-border-dark rounded-lg font-bold text-sm shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all"
                    >
                      <Plus size={14} />
                      첫 번째 러너가 되어보세요!
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Register tab ──────────────────────────────────────────── */}
      {tab === "register" && !myProfile && (
        <RegisterForm onSubmit={handleRegister} />
      )}
    </div>
  );
}
