# Runners High (매달) - 기능 개선 문서

> 이 문서는 프로젝트의 기능 개선 사항을 정리한 것입니다.
> 각 항목은 독립적으로 구현 가능하며, 우선순위에 따라 작업하세요.

## 목차
1. [Critical - 즉시 수정](#critical)
2. [High Priority - 우선 개선](#high-priority)
3. [Medium Priority - 일반 개선](#medium-priority)
4. [Low Priority - 향후 개선](#low-priority)

---

## Critical

### 1. 크루 찾기 - 백엔드 구현 (`/crew`)

**현재 문제**: 프로필 데이터가 클라이언트 상태에만 저장되어 새로고침 시 소멸

**구현 단계**:

#### Step 1: Prisma 스키마 추가

`/f/runners_high/runner/prisma/schema.prisma`의 마지막에 추가:

```prisma
// ─── Crew Profiles ────────────────────────────────────────

model CrewProfile {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nickname        String
  region          String   // 서울, 경기, 부산 등
  pace            String   // "5:30" 형식
  distance        String?  // "10km", "하프마라톤" 등
  message         String?  @db.Text
  tags            String[] @default([]) // ["초보환영", "주말러닝"]
  availableDays   String[] @default([]) @map("available_days") // ["월", "화", "수"]
  preferredTime   String?  @map("preferred_time") // "저녁"
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([region], map: "idx_crew_profiles_region")
  @@index([createdAt(sort: Desc)], map: "idx_crew_profiles_created_at")
  @@map("crew_profiles")
}
```

마이그레이션 실행:
```bash
npx prisma migrate dev --name add_crew_profiles
```

#### Step 2: API 라우트 생성

파일: `/f/runners_high/runner/src/app/api/crew/profiles/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const search = searchParams.get("search");

  const profiles = await prisma.crewProfile.findMany({
    where: {
      ...(region && region !== "전체" && { region }),
      ...(search && {
        OR: [
          { nickname: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search] } },
        ],
      }),
    },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  const body = await request.json();

  // 검증
  if (!body.nickname || !body.region || !body.pace) {
    return NextResponse.json(
      { error: "필수 필드를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  // 기존 프로필 확인
  const existing = await prisma.crewProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "이미 프로필이 존재합니다. 수정 또는 삭제 후 다시 등록하세요." },
      { status: 400 }
    );
  }

  const profile = await prisma.crewProfile.create({
    data: {
      userId: session.user.id,
      nickname: body.nickname.trim(),
      region: body.region,
      pace: body.pace.trim(),
      distance: body.distance?.trim() || null,
      message: body.message?.trim() || null,
      tags: body.tags || [],
      availableDays: body.availableDays || [],
      preferredTime: body.preferredTime?.trim() || null,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(profile, { status: 201 });
}
```

파일: `/f/runners_high/runner/src/app/api/crew/profiles/[id]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  const profile = await prisma.crewProfile.findUnique({
    where: { id },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "프로필을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 403 }
    );
  }

  const body = await request.json();

  const updated = await prisma.crewProfile.update({
    where: { id },
    data: {
      ...(body.nickname && { nickname: body.nickname.trim() }),
      ...(body.region && { region: body.region }),
      ...(body.pace && { pace: body.pace.trim() }),
      ...(body.distance !== undefined && { distance: body.distance?.trim() || null }),
      ...(body.message !== undefined && { message: body.message?.trim() || null }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.availableDays !== undefined && { availableDays: body.availableDays }),
      ...(body.preferredTime !== undefined && { preferredTime: body.preferredTime?.trim() || null }),
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  const profile = await prisma.crewProfile.findUnique({
    where: { id },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "프로필을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 403 }
    );
  }

  await prisma.crewProfile.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

#### Step 3: CrewFinderClient.tsx 수정

파일: `/f/runners_high/runner/src/app/crew/CrewFinderClient.tsx`

수정 사항:

1. `SAMPLE_PROFILES` 제거
2. `useEffect`에서 데이터 로드
3. 등록 폼에서 POST API 호출
4. 사용자의 프로필 수정/삭제 기능 추가

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Loader2,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface CrewProfile {
  id: string;
  userId: string;
  nickname: string;
  region: string;
  pace: string;
  distance: string | null;
  availableDays: string[];
  preferredTime: string | null;
  message: string | null;
  tags: string[];
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

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
  isOwner,
  onEdit,
  onDelete,
}: {
  profile: CrewProfile;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
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
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="수정"
            >
              <Edit2 size={16} className="text-gray-500" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
              title="삭제"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        )}
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
          <div className="text-sm font-bold">{profile.distance || "-"}</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 border border-border-dark/20 dark:border-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            시간
          </div>
          <div className="text-sm font-bold">{profile.preferredTime || "-"}</div>
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

// ── Register/Edit form ──────────────────────────────────────────────────
function RegisterForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (p: Partial<CrewProfile>) => Promise<void>;
  onCancel: () => void;
  initialData?: CrewProfile;
}) {
  const [nickname, setNickname] = useState(initialData?.nickname || "");
  const [region, setRegion] = useState(initialData?.region || REGIONS[1]);
  const [pace, setPace] = useState(initialData?.pace || "");
  const [distance, setDistance] = useState(initialData?.distance || "");
  const [days, setDays] = useState<string[]>(initialData?.availableDays || []);
  const [time, setTime] = useState(initialData?.preferredTime || "");
  const [message, setMessage] = useState(initialData?.message || "");
  const [tags, setTags] = useState(initialData?.tags.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (d: string) =>
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !pace.trim()) {
      setError("필수 필드를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        nickname: nickname.trim(),
        region,
        pace,
        distance: distance.trim() || null,
        message: message.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        availableDays: days,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "저장에 실패했습니다."
      );
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-2 border-border-dark dark:border-white rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-6 space-y-5"
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <h2 className="font-black text-lg uppercase flex items-center gap-2">
        <Zap size={20} className="text-primary" />
        {initialData ? "프로필 수정" : "러닝 프로필 등록"}
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-border-dark bg-white dark:bg-background-dark text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm uppercase hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-primary border-2 border-border-dark rounded-lg font-black text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Plus size={16} />
              {initialData ? "수정하기" : "등록하기"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export function CrewFinderClient() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"find" | "register">("find");
  const [region, setRegion] = useState("전체");
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<CrewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<CrewProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<CrewProfile | null>(null);

  // 프로필 로드
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crew/profiles");
      if (!res.ok) throw new Error("프로필을 로드할 수 없습니다.");
      const data = await res.json();
      setProfiles(data);

      // 사용자의 프로필 찾기
      if (session?.user?.id) {
        const userProf = data.find(
          (p: CrewProfile) => p.userId === session.user.id
        );
        setUserProfile(userProf || null);
      }
    } catch (err) {
      console.error("프로필 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = profiles.filter((p) => {
    if (region !== "전체" && p.region !== region) return false;
    if (
      search &&
      !p.nickname.includes(search) &&
      !p.message?.includes(search) &&
      !p.tags.some((t) => t.includes(search))
    )
      return false;
    return true;
  });

  const handleRegister = async (data: Partial<CrewProfile>) => {
    try {
      const res = await fetch("/api/crew/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "등록에 실패했습니다.");
      }

      const newProfile = await res.json();
      setProfiles((prev) => [newProfile, ...prev]);
      setUserProfile(newProfile);
      setTab("find");
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: Partial<CrewProfile>) => {
    if (!editingProfile) return;

    try {
      const res = await fetch(`/api/crew/profiles/${editingProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "수정에 실패했습니다.");
      }

      const updated = await res.json();
      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setUserProfile(updated);
      setEditingProfile(null);
      setTab("find");
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!userProfile || !confirm("정말 프로필을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/crew/profiles/${userProfile.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제에 실패했습니다.");

      setProfiles((prev) => prev.filter((p) => p.id !== userProfile.id));
      setUserProfile(null);
      setTab("find");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <TabButton active={tab === "find"} onClick={() => setTab("find")}>
          <Users size={14} className="inline mr-1.5 relative -top-px" />
          러닝 친구 찾기
        </TabButton>
        {!userProfile ? (
          <TabButton
            active={tab === "register"}
            onClick={() => setTab("register")}
          >
            <Plus size={14} className="inline mr-1.5 relative -top-px" />
            프로필 등록
          </TabButton>
        ) : (
          <TabButton
            active={tab === "register"}
            onClick={() => {
              setEditingProfile(userProfile);
              setTab("register");
            }}
          >
            <Edit2 size={14} className="inline mr-1.5 relative -top-px" />
            내 프로필 수정
          </TabButton>
        )}
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Results count */}
              <p className="text-sm text-gray-500 font-bold">
                {filtered.length}명의 러너
              </p>

              {/* Profile grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((p) => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      isOwner={p.userId === session?.user?.id}
                      onEdit={() => {
                        setEditingProfile(p);
                        setTab("register");
                      }}
                      onDelete={
                        p.userId === session?.user?.id ? handleDelete : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Target size={48} className="mx-auto text-gray-300" />
                  <p className="text-gray-400 font-bold">
                    조건에 맞는 러너가 없습니다.
                  </p>
                  {!userProfile && (
                    <button
                      onClick={() => {
                        setEditingProfile(null);
                        setTab("register");
                      }}
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
      {tab === "register" && (
        <RegisterForm
          onSubmit={editingProfile ? handleUpdate : handleRegister}
          onCancel={() => {
            setEditingProfile(null);
            setTab("find");
          }}
          initialData={editingProfile || undefined}
        />
      )}
    </div>
  );
}
```

---

### 2. 포스트 마크다운 렌더링 (`/posts/[id]`)

**현재 문제**: `contentMd`가 plain text로 표시됨

**구현 단계**:

#### Step 1: 패키지 설치

```bash
npm install react-markdown remark-gfm remark-breaks
```

#### Step 2: 마크다운 렌더러 컴포넌트 생성

파일: `/f/runners_high/runner/src/components/ui/MarkdownRenderer.tsx`

```typescript
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:border-b-2 prose-headings:border-border-dark dark:prose-headings:border-white prose-a:text-primary prose-a:font-bold hover:prose-a:underline prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-img:rounded-lg prose-img:border-2 prose-img:border-border-dark">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl md:text-4xl font-black uppercase mt-6 mb-4 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl md:text-3xl font-black uppercase mt-5 mb-3 pb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl md:text-2xl font-bold mt-4 mb-2 pb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-base leading-relaxed my-3" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-3 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-3 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono"
                  {...props}
                />
              );
            }
            return <code {...props} />;
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 my-4 italic text-gray-600 dark:text-gray-400"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary font-bold hover:underline"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg border-2 border-border-dark my-4 max-w-full h-auto"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="w-full border-collapse border-2 border-border-dark"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border-2 border-border-dark bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-bold"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border-2 border-border-dark px-4 py-2"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

#### Step 3: 포스트 상세 페이지 수정

파일: `/f/runners_high/runner/src/app/posts/[slug]/page.tsx`의 콘텐츠 표시 부분:

기존:
```tsx
<p className="whitespace-pre-line">{post.contentMd}</p>
```

변경 후:
```tsx
<MarkdownRenderer content={post.contentMd} />
```

import 추가:
```typescript
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
```

---

## High Priority

### 3. 랭킹 업로드 - 데이터 편집 기능 (`/ranking/upload`)

**현재 문제**: AI 추출 데이터를 수정할 수 없음

**구현 단계**:

파일: `/f/runners_high/runner/src/app/ranking/upload/UploadClient.tsx`

코드 수정 (Step 1-4 추가):

```typescript
// ── existing imports ────────────────────────────────────────

// Step 1: 편집 가능한 상태 타입 추가
interface EditableData {
  distanceKm: number | null;
  paceMinutes: number | null;
  paceSeconds: number | null;
  durationHours: number | null;
  durationMinutes: number | null;
  durationSeconds: number | null;
  calories: number | null;
}

export function UploadClient() {
  // ── existing state ────────────────────────────────────────

  // Step 2: 편집 가능한 데이터 상태 추가
  const [editableData, setEditableData] = useState<EditableData | null>(null);

  // Step 3: AI 분석 후 editableData 설정
  useEffect(() => {
    if (result) {
      const paceTotal = result.extracted.paceSeconds || 0;
      const durationTotal = result.extracted.durationSeconds || 0;

      setEditableData({
        distanceKm: result.extracted.distanceKm,
        paceMinutes: Math.floor(paceTotal / 60),
        paceSeconds: paceTotal % 60,
        durationHours: Math.floor(durationTotal / 3600),
        durationMinutes: Math.floor((durationTotal % 3600) / 60),
        durationSeconds: durationTotal % 60,
        calories: result.extracted.calories || null,
      });
    }
  }, [result]);

  // Step 4: handleConfirm 수정 - editableData 사용
  const handleConfirm = async () => {
    if (!result || !editableData) return;

    setUploading(true);
    setError(null);

    try {
      const paceSeconds =
        (editableData.paceMinutes || 0) * 60 + (editableData.paceSeconds || 0);
      const durationSeconds =
        (editableData.durationHours || 0) * 3600 +
        (editableData.durationMinutes || 0) * 60 +
        (editableData.durationSeconds || 0);

      const response = await fetch("/api/ranking/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screenshotUrl: result.screenshotUrl,
          distanceKm: editableData.distanceKm,
          paceSeconds,
          durationSeconds,
          calories: editableData.calories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "기록 저장에 실패했습니다.");
      }

      router.push("/ranking");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setUploading(false);
    }
  };

  // Step 5: Result Display 섹션 수정 - 추출된 기록을 편집 가능하게
  return (
    <div className="flex flex-col gap-6">
      {/* ── existing Error Display ──────────────────────────────── */}

      {/* ── existing Upload Zone ──────────────────────────────────── */}

      {/* ── existing Preview & Analysis ──────────────────────────────── */}

      {/* Result Display - UPDATED */}
      {result && editableData && (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 border-2 border-border-dark rounded-lg shadow-(--shadow-neobrutalism) p-6">
            <h2 className="text-xl font-black uppercase mb-6">추출된 기록 (편집 가능)</h2>

            <div className="space-y-4">
              {/* Distance */}
              <div>
                <label className="block text-sm font-bold mb-2">거리 (km)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editableData.distanceKm || ""}
                  onChange={(e) =>
                    setEditableData({
                      ...editableData,
                      distanceKm: parseFloat(e.target.value) || null,
                    })
                  }
                  className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Pace */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  페이스 (분:초)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editableData.paceMinutes || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          paceMinutes: parseInt(e.target.value) || null,
                        })
                      }
                      className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <span className="self-center text-lg font-bold">:</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editableData.paceSeconds || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          paceSeconds: parseInt(e.target.value) || null,
                        })
                      }
                      className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  운동 시간 (시:분:초)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={editableData.durationHours || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          durationHours: parseInt(e.target.value) || null,
                        })
                      }
                      className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <span className="self-center text-lg font-bold">:</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editableData.durationMinutes || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          durationMinutes: parseInt(e.target.value) || null,
                        })
                      }
                      className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <span className="self-center text-lg font-bold">:</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editableData.durationSeconds || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          durationSeconds: parseInt(e.target.value) || null,
                        })
                      }
                      className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-bold mb-2">칼로리 (kcal)</label>
                <input
                  type="number"
                  min="0"
                  value={editableData.calories || ""}
                  onChange={(e) =>
                    setEditableData({
                      ...editableData,
                      calories: parseInt(e.target.value) || null,
                    })
                  }
                  className="w-full border-2 border-border-dark rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResult(null);
                setEditableData(null);
                setError(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-accent-light dark:bg-accent-dark text-accent-dark dark:text-accent-light font-bold rounded-lg shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  확인 및 등록
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. 랭킹 업로드 - 수동 입력 폼 (`/ranking/upload`)

**현재 문제**: AI 분석 실패 시 대안 없음

**구현 단계**:

파일: `/f/runners_high/runner/src/app/ranking/upload/UploadClient.tsx`

`UploadClient()` 함수에 추가:

```typescript
export function UploadClient() {
  // ── existing state ────────────────────────────────────────

  // 추가: 수동 입력 모드 상태
  const [manualMode, setManualMode] = useState(false);

  // ── existing JSX ────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* ── existing Error Display ──────────────────────────────── */}

      {/* ── existing Upload Zone ──────────────────────────────── */}

      {/* ── existing Preview & Analysis ──────────────────────────────── */}

      {/* Direct Input Form - 새로 추가 */}
      {!result && manualMode && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-400 rounded-lg shadow-(--shadow-neobrutalism) p-6">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Edit2 size={20} className="text-yellow-600" />
            직접 입력하기
          </h2>

          <div className="space-y-4">
            {/* Distance */}
            <div>
              <label className="block text-sm font-bold mb-2">거리 (km) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editableData?.distanceKm || ""}
                onChange={(e) =>
                  setEditableData({
                    ...(editableData || {
                      distanceKm: null,
                      paceMinutes: null,
                      paceSeconds: null,
                      durationHours: null,
                      durationMinutes: null,
                      durationSeconds: null,
                      calories: null,
                    }),
                    distanceKm: parseFloat(e.target.value) || null,
                  })
                }
                className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="5.25"
                required
              />
            </div>

            {/* Pace */}
            <div>
              <label className="block text-sm font-bold mb-2">
                페이스 (분:초) *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editableData?.paceMinutes || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...(editableData || {
                          distanceKm: null,
                          paceMinutes: null,
                          paceSeconds: null,
                          durationHours: null,
                          durationMinutes: null,
                          durationSeconds: null,
                          calories: null,
                        }),
                        paceMinutes: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="5"
                    required
                  />
                </div>
                <span className="self-center text-lg font-bold">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editableData?.paceSeconds || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...(editableData || {
                          distanceKm: null,
                          paceMinutes: null,
                          paceSeconds: null,
                          durationHours: null,
                          durationMinutes: null,
                          durationSeconds: null,
                          calories: null,
                        }),
                        paceSeconds: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-bold mb-2">
                운동 시간 (시:분:초) *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={editableData?.durationHours || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...(editableData || {
                          distanceKm: null,
                          paceMinutes: null,
                          paceSeconds: null,
                          durationHours: null,
                          durationMinutes: null,
                          durationSeconds: null,
                          calories: null,
                        }),
                        durationHours: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0"
                    required
                  />
                </div>
                <span className="self-center text-lg font-bold">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editableData?.durationMinutes || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...(editableData || {
                          distanceKm: null,
                          paceMinutes: null,
                          paceSeconds: null,
                          durationHours: null,
                          durationMinutes: null,
                          durationSeconds: null,
                          calories: null,
                        }),
                        durationMinutes: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="30"
                    required
                  />
                </div>
                <span className="self-center text-lg font-bold">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editableData?.durationSeconds || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...(editableData || {
                          distanceKm: null,
                          paceMinutes: null,
                          paceSeconds: null,
                          durationHours: null,
                          durationMinutes: null,
                          durationSeconds: null,
                          calories: null,
                        }),
                        durationSeconds: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Calories */}
            <div>
              <label className="block text-sm font-bold mb-2">칼로리 (kcal)</label>
              <input
                type="number"
                min="0"
                value={editableData?.calories || ""}
                onChange={(e) =>
                  setEditableData({
                    ...(editableData || {
                      distanceKm: null,
                      paceMinutes: null,
                      paceSeconds: null,
                      durationHours: null,
                      durationMinutes: null,
                      durationSeconds: null,
                      calories: null,
                    }),
                    calories: parseInt(e.target.value) || null,
                  })
                }
                className="w-full border-2 border-yellow-400 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setManualMode(false);
                  setEditableData(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-yellow-400 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={uploading || !editableData?.distanceKm}
                className="flex-1 px-4 py-3 border-2 border-yellow-400 bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 font-bold rounded-lg shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    저장하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 분석 버튼 옆에 직접 입력 버튼 추가 - Preview & Analysis 섹션 내 */}
      {preview && !result && (
        <div className="flex flex-col gap-4">
          {/* existing preview image */}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setError(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              다시 선택
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-primary-light dark:bg-primary-dark text-primary-dark dark:text-primary-light font-bold rounded-lg shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  AI 분석하기
                </>
              )}
            </button>
            <button
              onClick={() => setManualMode(true)}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              직접 입력
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 5. 대회 상세 - 캘린더 추가 (`/races/[id]`)

**구현 단계**:

#### Step 1: 유틸리티 함수 생성

파일: `/f/runners_high/runner/src/lib/calendar.ts`

```typescript
export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (d: Date) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const seconds = String(d.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate || event.startDate)}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

export function generateICalFile(event: CalendarEvent): string {
  const formatDate = (d: Date) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const seconds = String(d.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const now = new Date();
  const timestamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}Z`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//매달 Running Events//maedal.com//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${event.title}
X-WR-TIMEZONE:Asia/Seoul
BEGIN:VEVENT
UID:${timestamp}@maedal.com
DTSTAMP:${timestamp}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate || event.startDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
}
```

#### Step 2: 캘린더 버튼 컴포넌트 생성

파일: `/f/runners_high/runner/src/components/ui/CalendarButtons.tsx`

```typescript
"use client";

import { Calendar, Download } from "lucide-react";
import { generateGoogleCalendarUrl, generateICalFile, type CalendarEvent } from "@/lib/calendar";

interface CalendarButtonsProps {
  event: CalendarEvent;
}

export function CalendarButtons({ event }: CalendarButtonsProps) {
  const handleAddToGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "width=800,height=600");
  };

  const handleDownloadIcal = () => {
    const ical = generateICalFile(event);
    const blob = new Blob([ical], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleAddToGoogleCalendar}
        className="px-4 py-2 bg-primary border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all flex items-center gap-2"
      >
        <Calendar size={16} />
        Google 캘린더
      </button>
      <button
        onClick={handleDownloadIcal}
        className="px-4 py-2 bg-white border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all flex items-center gap-2 dark:bg-gray-900 dark:border-white"
      >
        <Download size={16} />
        iCal 다운로드
      </button>
    </div>
  );
}
```

#### Step 3: 대회 상세 페이지에 추가

파일: `/f/runners_high/runner/src/app/races/[id]/page.tsx` (또는 race detail component)

import 추가:
```typescript
import { CalendarButtons } from "@/components/ui/CalendarButtons";
```

레이아웃 내에 추가:
```tsx
<CalendarButtons
  event={{
    title: race.title,
    description: `${race.organizer} 주최 마라톤 대회`,
    location: race.venue || race.region || "위치 미정",
    startDate: new Date(race.eventStartAt),
  }}
/>
```

---

### 6. 랭킹 - 빈 상태 메시지 (`/ranking`)

**구현 단계**:

파일: `/f/runners_high/runner/src/components/features/ranking/RankingBoard.tsx`

```typescript
// ── existing imports ────────────────────────────────────────

import { BarChart3, Trophy } from "lucide-react";
import Link from "next/link";

interface RankingEntry {
  id: string;
  rank: number;
  userName: string;
  userImage?: string | null;
  distanceKm: number;
  paceSeconds: number;
  durationSeconds: number;
  screenshotUrl: string;
  createdAt: string;
  userId?: string;
}

interface RankingBoardProps {
  distanceRanking: RankingEntry[];
  paceRanking: RankingEntry[];
  currentUserId?: string;
}

export function RankingBoard({
  distanceRanking,
  paceRanking,
  currentUserId,
}: RankingBoardProps) {
  const isEmpty = distanceRanking.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-16 px-4 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <Trophy size={80} className="text-gray-200 dark:text-gray-800" />
            <BarChart3 size={80} className="text-gray-200 dark:text-gray-800 absolute -right-4 -bottom-2 opacity-50" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase">
            아직 오늘의 기록이 없어요
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            첫 번째 기록을 등록해서 랭킹의 꼭대기에 올라보세요!
          </p>
        </div>

        <Link
          href="/ranking/upload"
          className="inline-block px-8 py-4 bg-primary border-2 border-border-dark rounded-xl font-black text-base uppercase shadow-(--shadow-neobrutalism) hover:translate-x-px hover:translate-y-px hover:shadow-(--shadow-neobrutalism-hover) transition-all"
        >
          기록 업로드하기
        </Link>

        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
          러닝 앱 스크린샷을 업로드하면 AI가 자동으로 거리, 페이스, 시간을 분석해드립니다.
        </p>
      </div>
    );
  }

  // ── existing ranking display code ────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Distance Ranking */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">거리 랭킹</h2>
        {/* ranking cards */}
      </div>

      {/* Pace Ranking */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">페이스 랭킹</h2>
        {/* ranking cards */}
      </div>
    </div>
  );
}
```

---

### 7. 러닝화 티어 - localStorage 저장 (`/shoe-tier`)

**구현 단계**:

파일: `/f/runners_high/runner/src/app/shoe-tier/ShoeTierClient.tsx`

```typescript
// ── existing imports ────────────────────────────────────────
import { useEffect } from "react";

// 1. 타입 정의 추가
interface ShoeTierState {
  tiers: any[]; // 기존 tiers 구조
  pool: any[];  // 기존 shoe pool 구조
}

const STORAGE_KEY = "userShoeTiers";
const DEFAULT_TIERS = []; // 기존 기본값

export function ShoeTierClient() {
  // ── existing state ────────────────────────────────────────

  // 2. 초기 로드 - useEffect 추가
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: ShoeTierState = JSON.parse(saved);
        setUserTiers(parsed.tiers);
        setUserShoePool(parsed.pool);
      } catch (err) {
        console.error("Failed to load saved tiers:", err);
      }
    }
  }, []);

  // 3. 변경 시 저장 - 기존 setState들 이후 useEffect 추가
  useEffect(() => {
    if (userTiers.length > 0 || userShoePool.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            tiers: userTiers,
            pool: userShoePool,
          })
        );
      } catch (err) {
        console.error("Failed to save tiers:", err);
      }
    }
  }, [userTiers, userShoePool]);

  // 4. 리셋 핸들러 - 기존 리셋 함수 수정
  const handleReset = () => {
    if (!confirm("모든 설정을 초기화하시겠습니까?")) return;

    setUserTiers(DEFAULT_TIERS);
    setUserShoePool([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear localStorage:", err);
    }
  };

  // ── existing return JSX ────────────────────────────────────────
}
```

---

### 8. 러닝화 티어 - 터치 드래그 지원 (`/shoe-tier`)

**구현 단계**:

#### Step 1: 패키지 설치

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### Step 2: ShoeTierClient.tsx 마이그레이션

전체 컴포넌트를 드래그 드롭 지원하도록 수정:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RotateCcw, GripHorizontal } from "lucide-react";

// ── 기존 interface와 상수들 ────────────────────────────────────────

const STORAGE_KEY = "userShoeTiers";

interface Shoe {
  id: string;
  name: string;
  tier: string; // "S", "A", "B", "C", "D"
  image?: string;
}

// ── Sortable Item Component ────────────────────────────────────────
function SortableShoeCard({ shoe, tier }: { shoe: Shoe; tier: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: shoe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-900 border-2 border-border-dark rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism) transition-all space-y-2 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{shoe.name}</p>
          <span className="inline-block text-xs font-bold px-2 py-1 rounded bg-primary/20 text-border-dark mt-1">
            {tier}
          </span>
        </div>
        <GripHorizontal
          size={16}
          className="text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

// ── Tier Section ────────────────────────────────────────────────────────────
function TierSection({
  tier,
  shoes,
  onShoeRemove,
}: {
  tier: string;
  shoes: Shoe[];
  onShoeRemove: (shoeId: string) => void;
}) {
  return (
    <div className="border-2 border-border-dark rounded-lg overflow-hidden">
      <div className="bg-primary border-b-2 border-border-dark px-4 py-3">
        <h3 className="text-2xl font-black">{tier} 티어</h3>
      </div>

      <div className="bg-white dark:bg-gray-950 p-4 min-h-24">
        {shoes.length > 0 ? (
          <SortableContext
            items={shoes.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {shoes.map((shoe) => (
                <div key={shoe.id} className="relative">
                  <SortableShoeCard shoe={shoe} tier={tier} />
                  <button
                    onClick={() => onShoeRemove(shoe.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                    title="제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </SortableContext>
        ) : (
          <p className="text-gray-400 text-center py-8">
            운동화를 여기에 드래그하세요
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ShoeTierClient() {
  const [userTiers, setUserTiers] = useState<Record<string, Shoe[]>>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const [userShoePool, setUserShoePool] = useState<Shoe[]>([]);

  // 센서 설정 (터치 + 포인터 + 키보드)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserTiers(parsed.tiers);
        setUserShoePool(parsed.pool);
      } catch (err) {
        console.error("Failed to load saved tiers:", err);
      }
    }
  }, []);

  // 변경 시 저장
  useEffect(() => {
    const hasData = Object.values(userTiers).some((tier) => tier.length > 0) || userShoePool.length > 0;
    if (hasData) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            tiers: userTiers,
            pool: userShoePool,
          })
        );
      } catch (err) {
        console.error("Failed to save tiers:", err);
      }
    }
  }, [userTiers, userShoePool]);

  // 드래그 끝 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeShoe = findShoe(active.id as string);
    const overShoe = findShoe(over.id as string);

    if (!activeShoe) return;

    // 같은 티어 내에서의 정렬
    if (active.data.current?.sortable?.containerId === over.data.current?.sortable?.containerId) {
      const tierId = active.data.current?.sortable?.containerId as string;
      const tier = userTiers[tierId];
      const activeIndex = tier.findIndex((s) => s.id === active.id);
      const overIndex = tier.findIndex((s) => s.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newTier = arrayMove(tier, activeIndex, overIndex);
        setUserTiers({
          ...userTiers,
          [tierId]: newTier,
        });
      }
    } else {
      // 다른 티어로 이동
      const sourceContainer = active.data.current?.sortable?.containerId;
      const targetContainer = over.data.current?.sortable?.containerId;

      if (sourceContainer && targetContainer) {
        moveShoeToTier(active.id as string, targetContainer as string);
      }
    }
  };

  // 신발 찾기
  function findShoe(shoeId: string): Shoe | null {
    // 풀에서 찾기
    const inPool = userShoePool.find((s) => s.id === shoeId);
    if (inPool) return inPool;

    // 티어에서 찾기
    for (const tier of Object.values(userTiers)) {
      const found = tier.find((s) => s.id === shoeId);
      if (found) return found;
    }

    return null;
  }

  // 신발을 티어로 이동
  function moveShoeToTier(shoeId: string, tierId: string) {
    const shoe = findShoe(shoeId);
    if (!shoe) return;

    // 현재 위치에서 제거
    setUserTiers((prev) => ({
      ...prev,
      [Object.keys(prev).find((k) => prev[k].some((s) => s.id === shoeId)) || ""]: prev[
        Object.keys(prev).find((k) => prev[k].some((s) => s.id === shoeId)) || ""
      ]?.filter((s) => s.id !== shoeId),
    }));

    setUserShoePool((prev) => prev.filter((s) => s.id !== shoeId));

    // 새로운 위치에 추가
    setUserTiers((prev) => ({
      ...prev,
      [tierId]: [...(prev[tierId as keyof typeof prev] || []), shoe],
    }));
  }

  // 신발 제거
  function handleRemoveShoe(shoeId: string) {
    setUserShoePool((prev) => prev.filter((s) => s.id !== shoeId));
    setUserTiers((prev) => {
      const newTiers = { ...prev };
      Object.keys(newTiers).forEach((tier) => {
        newTiers[tier as keyof typeof newTiers] = newTiers[
          tier as keyof typeof newTiers
        ].filter((s) => s.id !== shoeId);
      });
      return newTiers;
    });
  }

  // 리셋
  const handleReset = () => {
    if (!confirm("모든 설정을 초기화하시겠습니까?")) return;

    setUserTiers({ S: [], A: [], B: [], C: [], D: [] });
    setUserShoePool([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear localStorage:", err);
    }
  };

  // 신발 추가 (예: 폼 제출)
  function handleAddShoe(shoeName: string) {
    const newShoe: Shoe = {
      id: `shoe-${Date.now()}`,
      name: shoeName,
      tier: "Unranked",
    };
    setUserShoePool((prev) => [...prev, newShoe]);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Add Shoe Form */}
        <AddShoeForm onAdd={handleAddShoe} />

        {/* Tier Sections */}
        <div className="space-y-4">
          {["S", "A", "B", "C", "D"].map((tier) => (
            <TierSection
              key={tier}
              tier={tier}
              shoes={userTiers[tier as keyof typeof userTiers]}
              onShoeRemove={handleRemoveShoe}
            />
          ))}
        </div>

        {/* Shoe Pool */}
        {userShoePool.length > 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-bold text-gray-500 mb-3">
              아직 분류되지 않은 운동화
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {userShoePool.map((shoe) => (
                <div key={shoe.id} className="relative">
                  <SortableShoeCard shoe={shoe} tier="Unranked" />
                  <button
                    onClick={() => handleRemoveShoe(shoe.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full px-4 py-3 border-2 border-red-500 bg-white dark:bg-gray-900 text-red-500 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          초기화
        </button>
      </div>
    </DndContext>
  );
}

// ── Add Shoe Form Component ────────────────────────────────────────
function AddShoeForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="운동화 이름 입력"
        className="flex-1 px-4 py-2 border-2 border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
        required
      />
      <button
        type="submit"
        className="px-6 py-2 bg-primary border-2 border-border-dark rounded-lg font-bold shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px transition-all"
      >
        추가
      </button>
    </form>
  );
}
```

---

## Medium Priority

### 9. 전체 페이지 - 로딩 스켈레톤

**구현 단계**:

파일: `/f/runners_high/runner/src/components/ui/Skeleton.tsx`

```typescript
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

// 각 페이지별 스켈레톤 컴포넌트

export function RaceCardSkeleton() {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function RankingCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-12" />
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}
```

사용 예시:
```tsx
import { RaceCardSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

export function RaceListWithSuspense() {
  return (
    <Suspense fallback={<RaceCardSkeleton />}>
      <RaceList />
    </Suspense>
  );
}
```

---

### 10. 전체 페이지 - Error Boundary

**구현 단계**:

파일: `/f/runners_high/runner/src/components/ErrorBoundary.tsx`

```typescript
"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-sm">
            <div className="flex justify-center">
              <AlertTriangle size={64} className="text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase">문제가 발생했습니다</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {this.state.error?.message || "예상치 못한 오류가 발생했습니다."}
              </p>
            </div>

            <details className="text-left text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-h-24 overflow-y-auto">
              <summary className="cursor-pointer font-bold mb-2">기술 정보</summary>
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error?.stack}
              </pre>
            </details>

            <button
              onClick={this.reset}
              className="w-full px-6 py-3 bg-primary border-2 border-border-dark rounded-lg font-bold flex items-center justify-center gap-2 shadow-(--shadow-neobrutalism) hover:translate-x-px hover:translate-y-px transition-all"
            >
              <RotateCcw size={18} />
              다시 시도
            </button>

            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-6 py-3 bg-white dark:bg-gray-900 border-2 border-border-dark dark:border-white rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Next.js 15 app router용 error.tsx:
```tsx
// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <AlertTriangle size={64} className="text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase">페이지 오류</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {error.message || "페이지를 로드할 수 없습니다."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-primary border-2 border-border-dark rounded-lg font-bold flex items-center justify-center gap-2 shadow-(--shadow-neobrutalism) hover:translate-x-px hover:translate-y-px transition-all"
          >
            <RotateCcw size={18} />
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 px-6 py-3 bg-white dark:bg-gray-900 border-2 border-border-dark dark:border-white rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            홈
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 11. 공유 기능 (`/races/[id]`, `/posts/[id]`)

**구현 단계**:

파일: `/f/runners_high/runner/src/components/ui/ShareButtons.tsx`

```typescript
"use client";

import { Share2, Copy, MessageCircle, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

declare global {
  interface Window {
    Kakao?: {
      Share: {
        sendDefault: (options: any) => void;
      };
      isInitialized: () => boolean;
      init: (key: string) => void;
    };
  }
}

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
}

export function ShareButtons({
  title,
  url,
  description,
  imageUrl,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleKakaoShare = () => {
    if (!window.Kakao) {
      alert("카카오톡 공유가 준비되지 않았습니다.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY || "");
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: description || "",
        imageUrl: imageUrl || "",
        link: {
          webUrl: url,
          mobileWebUrl: url,
        },
      },
      buttons: [
        {
          title: "보러 가기",
          link: {
            webUrl: url,
            mobileWebUrl: url,
          },
        },
      ],
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = new URLSearchParams({
      text: `${title}\n\n매달에서 확인하세요!`,
      url,
    });
    window.open(
      `https://twitter.com/intent/tweet?${twitterUrl}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleKakaoStoryShare = () => {
    const kakaoStoryUrl = new URLSearchParams({
      post: title,
      url,
    });
    window.open(
      `https://story.kakao.com/share?${kakaoStoryUrl}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleKakaoShare}
        className="px-4 py-2 bg-yellow-300 border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px transition-all flex items-center gap-2"
        title="카카오톡 공유"
      >
        <MessageCircle size={16} />
        카톡
      </button>

      <button
        onClick={handleKakaoStoryShare}
        className="px-4 py-2 bg-yellow-200 border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px transition-all flex items-center gap-2"
        title="카카오 스토리 공유"
      >
        <MessageCircle size={16} />
        스토리
      </button>

      <button
        onClick={handleTwitterShare}
        className="px-4 py-2 bg-blue-400 border-2 border-border-dark rounded-lg font-bold text-sm text-white uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px transition-all flex items-center gap-2"
        title="X (Twitter) 공유"
      >
        <Share2 size={16} />
        X
      </button>

      <button
        onClick={handleCopyLink}
        className={`px-4 py-2 border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-(--shadow-neobrutalism-sm) hover:translate-x-px hover:translate-y-px transition-all flex items-center gap-2 ${
          copied
            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
        }`}
      >
        {copied ? (
          <>
            <Copy size={16} />
            복사됨!
          </>
        ) : (
          <>
            <LinkIcon size={16} />
            링크
          </>
        )}
      </button>
    </div>
  );
}
```

사용 예시:
```tsx
import { ShareButtons } from "@/components/ui/ShareButtons";

export function RaceDetail({ race }: { race: Race }) {
  return (
    <>
      {/* race content */}
      <ShareButtons
        title={race.title}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/races/${race.id}`}
        description={`${race.organizer} 주최 마라톤 대회`}
        imageUrl={race.imageUrl}
      />
    </>
  );
}
```

---

### 12. 랭킹 - 내 순위 하이라이트 (`/ranking`)

**구현 단계**:

파일: `/f/runners_high/runner/src/components/features/ranking/RankingBoard.tsx`

수정:

```typescript
// ── existing imports ────────────────────────────────────────
import { useSession } from "next-auth/react";

interface RankingBoardProps {
  distanceRanking: RankingEntry[];
  paceRanking: RankingEntry[];
}

export function RankingBoard({ distanceRanking, paceRanking }: RankingBoardProps) {
  const { data: session } = useSession();

  // 각 랭킹에서 유저 찾기
  const userDistanceRank = distanceRanking.find(
    (r) => r.userId === session?.user?.id
  );
  const userPaceRank = paceRanking.find(
    (r) => r.userId === session?.user?.id
  );

  return (
    <div className="space-y-8">
      {/* Distance Ranking */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">거리 랭킹</h2>
        <div className="space-y-2">
          {distanceRanking.map((entry) => {
            const isCurrentUser = entry.userId === session?.user?.id;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-primary shadow-(--shadow-neobrutalism-hover)"
                    : "bg-white dark:bg-gray-900 border-border-dark dark:border-white hover:shadow-(--shadow-neobrutalism)"
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                    entry.rank === 1
                      ? "bg-yellow-300 text-yellow-900"
                      : entry.rank === 2
                        ? "bg-gray-300 text-gray-900"
                        : entry.rank === 3
                          ? "bg-orange-300 text-orange-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {entry.rank}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {entry.userImage && (
                      <img
                        src={entry.userImage}
                        alt={entry.userName}
                        className="size-6 rounded-full object-cover"
                      />
                    )}
                    <p className="font-bold truncate">{entry.userName}</p>
                    {isCurrentUser && (
                      <span className="text-xs font-black bg-primary px-2 py-1 rounded-full flex-shrink-0">
                        나
                      </span>
                    )}
                  </div>
                </div>

                {/* Distance */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black">{entry.distanceKm.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pace Ranking - 유사하게 구현 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">페이스 랭킹</h2>
        {/* ... similar structure */}
      </div>
    </div>
  );
}
```

---

## Low Priority

### 13. OAuth 에러 처리 (`/login`)

**구현 단계**:

파일: `/f/runners_high/runner/src/app/login/page.tsx`

```typescript
import { Suspense } from "react";

interface SearchParams {
  error?: string;
  error_description?: string;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const errorMessages: Record<string, string> = {
    OAuthSignin: "OAuth 로그인 중 문제가 발생했습니다.",
    OAuthCallback: "OAuth 콜백 처리 중 문제가 발생했습니다.",
    OAuthCreateAccount: "계정을 생성하지 못했습니다.",
    EmailCreateAccount: "이메일 계정을 생성하지 못했습니다.",
    Callback: "콜백 중 문제가 발생했습니다.",
    OAuthAccountNotLinked: "이미 다른 방식으로 가입된 이메일입니다.",
    EmailSignInError: "이메일 로그인에 실패했습니다.",
    SessionCallback: "세션 처리 중 문제가 발생했습니다.",
  };

  const errorMessage =
    params.error && errorMessages[params.error]
      ? errorMessages[params.error]
      : params.error_description
        ? decodeURIComponent(params.error_description)
        : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-background-dark">
      <div className="w-full max-w-sm space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-red-700 dark:text-red-300">
              로그인 실패
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400">
              다시 시도하거나 다른 로그인 방식을 사용해주세요.
            </p>
          </div>
        )}

        {/* Login Form */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black uppercase">매달에 로그인</h1>
          <p className="text-gray-500 dark:text-gray-400">
            러닝 기록을 저장하고 공유하세요
          </p>
        </div>

        {/* Existing login buttons */}
      </div>
    </main>
  );
}
```

---

## 구현 체크리스트

### Critical (즉시)
- [ ] **1. 크루 찾기 백엔드 구현**
  - [ ] Prisma 스키마 추가 및 마이그레이션
  - [ ] API 라우트 생성 (GET, POST, PATCH, DELETE)
  - [ ] CrewFinderClient 업데이트 (API 연동)
  - [ ] 테스트: 프로필 생성/수정/삭제

- [ ] **2. 포스트 마크다운 렌더링**
  - [ ] 패키지 설치 (react-markdown, remark-gfm)
  - [ ] MarkdownRenderer 컴포넌트 생성
  - [ ] 포스트 상세 페이지 수정
  - [ ] 테스트: 마크다운 표시 확인

### High Priority (1주일 내)
- [ ] **3. 랭킹 업로드 데이터 편집**
  - [ ] EditableData 상태 추가
  - [ ] 편집 UI 작성
  - [ ] 테스트: 각 필드 수정 후 등록

- [ ] **4. 랭킹 업로드 수동 입력**
  - [ ] manualMode 상태 추가
  - [ ] 수동 입력 폼 UI
  - [ ] 테스트: AI 분석 스킵하고 직접 입력

- [ ] **5. 대회 상세 캘린더**
  - [ ] calendar.ts 유틸리티 생성
  - [ ] CalendarButtons 컴포넌트 생성
  - [ ] 테스트: Google 캘린더/iCal 다운로드

- [ ] **6. 랭킹 빈 상태 메시지**
  - [ ] RankingBoard 컴포넌트 수정
  - [ ] Empty state UI 추가
  - [ ] 테스트: 기록 없을 때 표시

- [ ] **7. 러닝화 티어 localStorage**
  - [ ] useEffect 추가 (저장/로드)
  - [ ] 테스트: 새로고침 후 데이터 유지

- [ ] **8. 러닝화 티어 드래그 드롭**
  - [ ] @dnd-kit 패키지 설치
  - [ ] Sortable 컴포넌트 마이그레이션
  - [ ] 테스트: 모바일 터치 드래그

### Medium Priority (2주일 내)
- [ ] **9. 로딩 스켈레톤**
  - [ ] Skeleton 컴포넌트 작성
  - [ ] Suspense로 감싸기
  - [ ] 테스트: 로딩 상태 확인

- [ ] **10. Error Boundary**
  - [ ] ErrorBoundary 컴포넌트 작성
  - [ ] error.tsx 추가
  - [ ] 테스트: 에러 발생 시 표시

- [ ] **11. 공유 기능**
  - [ ] ShareButtons 컴포넌트 작성
  - [ ] Kakao SDK 연동
  - [ ] 테스트: 각 플랫폼 공유

- [ ] **12. 내 순위 하이라이트**
  - [ ] RankingBoard 수정
  - [ ] 사용자 강조 스타일
  - [ ] 테스트: 로그인 후 순위 하이라이트

### Low Priority (3주일 이상)
- [ ] **13. OAuth 에러 처리**
  - [ ] searchParams 처리
  - [ ] 에러 메시지 표시
  - [ ] 테스트: 로그인 실패 시나리오

---

## 테스트 체크리스트

### 크로스 브라우저
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (Mobile/iOS)

### 기능 테스트
- [ ] 새 계정으로 처음부터 테스트
- [ ] 모바일 터치/스와이프 테스트
- [ ] 느린 네트워크 (3G) 테스트
- [ ] 오프라인 후 재연결 테스트

### 성능
- [ ] Lighthouse 점수 확인 (>90)
- [ ] Core Web Vitals 확인
- [ ] 번들 크기 모니터링

---

## 기술 노트

### Tailwind CSS v4 사용
- CSS 변수: `shadow-(--name)`, `bg-(--color)`
- 임의 값: `translate-x-px`, `translate-y-0.5`

### Next.js 15 App Router
- Route params는 `Promise` 타입: `await params`
- `dynamic = "force-dynamic"` 사용하기 (ISR 필요 시)

### 마크다운 렌더링
- `remark-gfm`: GitHub Flavored Markdown 지원
- `remark-breaks`: 줄바꿈 처리

### 드래그 드롭
- `@dnd-kit/core`: 핵심 라이브러리
- `@dnd-kit/sortable`: 정렬 기능
- `TouchSensor`: 모바일 터치 지원

---

**문서 최종 업데이트**: 2025-02-04
