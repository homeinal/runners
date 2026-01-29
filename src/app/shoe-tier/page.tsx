import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShoeTierClient } from "./ShoeTierClient";

export const metadata = {
  title: "운동화 티어표 - 매달",
  description: "러닝화 티어를 확인하고 나만의 운동화 티어를 만들어보세요.",
};

export default function ShoeTierPage() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            운동화 티어표
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            에디터가 선정한 러닝화 티어와 나만의 티어를 만들어보세요.
          </p>
        </div>
        <ShoeTierClient />
      </main>
      <Footer />
    </>
  );
}
