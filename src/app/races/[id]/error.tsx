"use client";

import Link from "next/link";
import { Header, Footer } from "@/components/layout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">문제가 발생했습니다</h1>
          <p className="text-border-dark/60 mb-8">
            대회 정보를 불러오는 중 오류가 발생했습니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-primary text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined">refresh</span>
              다시 시도
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              대회 목록으로
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
