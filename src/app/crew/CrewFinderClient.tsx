"use client";

import { useState } from "react";
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
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface CrewProfile {
  id: string;
  nickname: string;
  region: string;
  pace: string;
  distance: string;
  days: string[];
  time: string;
  message: string;
  tags: string[];
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

const SAMPLE_PROFILES: CrewProfile[] = [
  {
    id: "1",
    nickname: "달리는 곰",
    region: "서울 마포/여의도",
    pace: "5:30~6:00",
    distance: "10km",
    days: ["화", "목", "토"],
    time: "저녁 7시",
    message: "한강 마포대교 근처에서 같이 달릴 분! 초보도 환영합니다 😊",
    tags: ["초보환영", "한강러닝", "10K"],
    createdAt: "2025-01-28",
  },
  {
    id: "2",
    nickname: "서브4 도전중",
    region: "서울 송파/잠실",
    pace: "5:00~5:30",
    distance: "하프마라톤",
    days: ["수", "토", "일"],
    time: "아침 6시",
    message: "잠실 석촌호수 주변에서 아침 러닝하실 분 구합니다. 서브4 목표로 같이 훈련해요!",
    tags: ["서브4", "아침러닝", "하프"],
    createdAt: "2025-01-27",
  },
  {
    id: "3",
    nickname: "느긋한 러너",
    region: "서울 강남",
    pace: "6:30~7:00",
    distance: "5km",
    days: ["월", "수", "금"],
    time: "저녁 8시",
    message: "양재천에서 천천히 달려요. 대화하면서 편하게!",
    tags: ["초보환영", "양재천", "5K"],
    createdAt: "2025-01-26",
  },
  {
    id: "4",
    nickname: "트레일 매니아",
    region: "경기 분당/판교",
    pace: "6:00~6:30",
    distance: "15km+",
    days: ["토", "일"],
    time: "아침 7시",
    message: "주말에 분당 탄천이나 불곡산 트레일 같이 뛰실 분!",
    tags: ["트레일", "주말러닝", "중급"],
    createdAt: "2025-01-25",
  },
  {
    id: "5",
    nickname: "마라톤 입문자",
    region: "부산",
    pace: "7:00~7:30",
    distance: "5km",
    days: ["화", "목"],
    time: "저녁 6시30분",
    message: "해운대 해변을 따라 달려요. 뛰기 시작한 지 한 달! 같이 시작하실 분?",
    tags: ["입문자", "해운대", "바다러닝"],
    createdAt: "2025-01-24",
  },
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
function ProfileCard({ profile }: { profile: CrewProfile }) {
  return (
    <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-5 hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary border-2 border-border-dark rounded-full flex items-center justify-center font-black text-sm">
            {profile.nickname[0]}
          </div>
          <div>
            <h3 className="font-bold text-base">{profile.nickname}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {profile.region}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            페이스
          </div>
          <div className="text-sm font-bold">{profile.pace}</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            거리
          </div>
          <div className="text-sm font-bold">{profile.distance}</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            시간
          </div>
          <div className="text-sm font-bold">{profile.time}</div>
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
                profile.days.includes(d)
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
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <MessageCircle
          size={14}
          className="inline mr-1 text-gray-400 relative -top-px"
        />
        {profile.message}
      </p>

      {/* Tags */}
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
    </div>
  );
}

// ── Register form ──────────────────────────────────────────────────────
function RegisterForm({ onSubmit }: { onSubmit: (p: CrewProfile) => void }) {
  const [nickname, setNickname] = useState("");
  const [region, setRegion] = useState(REGIONS[1]);
  const [pace, setPace] = useState("");
  const [distance, setDistance] = useState("");
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
      id: `new-${Date.now()}`,
      nickname: nickname.trim(),
      region,
      pace,
      distance,
      days,
      time,
      message,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString().slice(0, 10),
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
          <label className="block text-sm font-bold">주 거리</label>
          <input
            type="text"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="10km"
            className={inputClass}
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
  const [profiles, setProfiles] = useState<CrewProfile[]>(SAMPLE_PROFILES);

  const filtered = profiles.filter((p) => {
    if (region !== "전체" && p.region !== region) return false;
    if (
      search &&
      !p.nickname.includes(search) &&
      !p.message.includes(search) &&
      !p.tags.some((t) => t.includes(search))
    )
      return false;
    return true;
  });

  const handleRegister = (profile: CrewProfile) => {
    setProfiles((prev) => [profile, ...prev]);
    setTab("find");
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3">
        <TabButton active={tab === "find"} onClick={() => setTab("find")}>
          <Users size={14} className="inline mr-1.5 relative -top-px" />
          러닝 친구 찾기
        </TabButton>
        <TabButton
          active={tab === "register"}
          onClick={() => setTab("register")}
        >
          <Plus size={14} className="inline mr-1.5 relative -top-px" />
          프로필 등록
        </TabButton>
      </div>

      {/* ── Find tab ──────────────────────────────────────────────── */}
      {tab === "find" && (
        <div className="space-y-5">
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
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 font-bold">
            {filtered.length}명의 러너
          </p>

          {/* Profile grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Target size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-400 font-bold">
                조건에 맞는 러너가 없습니다.
              </p>
              <button
                onClick={() => setTab("register")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border-2 border-border-dark rounded-lg font-bold text-sm shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all"
              >
                <Plus size={14} />
                첫 번째 러너가 되어보세요!
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Register tab ──────────────────────────────────────────── */}
      {tab === "register" && <RegisterForm onSubmit={handleRegister} />}
    </div>
  );
}
