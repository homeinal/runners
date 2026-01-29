import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CrewFinderClient } from "./CrewFinderClient";

export const metadata = {
  title: "러닝 크루 찾기 - 매달",
  description:
    "동네 마라톤 친구를 찾고, 러닝 크루에 참여하세요.",
};

export default function CrewPage() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            러닝 크루 찾기
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            동네 마라톤 친구를 찾고 함께 달려보세요.
          </p>
        </div>
        <CrewFinderClient />
      </main>
      <Footer />
    </>
  );
}
