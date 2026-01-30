import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RankingBoard } from "@/components/features/ranking";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "오늘의 랭킹 - 매달",
  description: "오늘의 러닝 랭킹을 확인하세요. 거리와 페이스 랭킹을 한눈에.",
};

function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return {
    date: new Date(kst.toISOString().slice(0, 10)),
    display: `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 (${"일월화수목금토"[kst.getUTCDay()]})`,
  };
}

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const { date, display } = getTodayKST();

  const records = await prisma.runRecord.findMany({
    where: { runDate: date },
    include: { user: { select: { name: true, image: true } } },
  });

  const entries = records.map((r) => ({
    id: r.id,
    rank: 0,
    userName: r.user.name ?? "러너",
    userImage: r.user.image,
    distanceKm: r.distanceKm,
    paceSeconds: r.paceSeconds,
    durationSeconds: r.durationSeconds,
    screenshotUrl: r.screenshotUrl,
    createdAt: r.createdAt.toISOString(),
  }));

  const distanceRanking = [...entries]
    .sort((a, b) => b.distanceKm - a.distanceKm)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const paceRanking = [...entries]
    .sort((a, b) => a.paceSeconds - b.paceSeconds)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            오늘의 랭킹
          </h1>
          <p className="mt-2 text-lg font-bold text-border-dark/60 dark:text-white/60">
            {display}
          </p>
        </div>

        <RankingBoard
          distanceRanking={distanceRanking}
          paceRanking={paceRanking}
        />

        <div className="flex justify-center">
          <Link
            href="/ranking/upload"
            className="bg-primary text-border-dark border-2 border-border-dark px-8 py-3 rounded-full font-black uppercase shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all text-lg"
          >
            기록 등록하기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
