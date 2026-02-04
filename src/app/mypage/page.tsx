import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { MyPageClient } from "./MyPageClient";
import { SettingsSection } from "./SettingsSection";

export const metadata = {
  title: "마이페이지 - 매달",
  description: "내 러닝 기록을 확인하세요.",
};

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const records = await prisma.runRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { runDate: "desc" },
  });

  const totalRuns = records.length;
  const totalDistance = records.reduce((sum, r) => sum + r.distanceKm, 0);
  const avgPace = totalRuns > 0
    ? Math.round(records.reduce((sum, r) => sum + r.paceSeconds, 0) / totalRuns)
    : 0;

  const serializedRecords = records.map((r) => ({
    id: r.id,
    distanceKm: r.distanceKm,
    paceSeconds: r.paceSeconds,
    durationSeconds: r.durationSeconds,
    calories: r.calories,
    runDate: r.runDate.toISOString().slice(0, 10),
    screenshotUrl: r.screenshotUrl,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">마이페이지</h1>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-6 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-(--shadow-neobrutalism)">
          <div className="size-16 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-border-dark dark:border-white flex items-center justify-center overflow-hidden shrink-0">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black">{(session.user.name ?? "러너").charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="text-xl font-black">{session.user.name ?? "러너"}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "총 러닝", value: `${totalRuns}회` },
            { label: "총 거리", value: `${totalDistance.toFixed(1)}km` },
            { label: "평균 페이스", value: avgPace > 0 ? `${Math.floor(avgPace / 60)}'${(avgPace % 60).toString().padStart(2, "0")}"` : "-" },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism-sm)">
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Settings Section */}
        <SettingsSection user={{
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }} />

        {/* History */}
        <MyPageClient records={serializedRecords} />
      </main>
      <Footer />
    </>
  );
}
