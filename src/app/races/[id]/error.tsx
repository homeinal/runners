"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Footer } from "@/components/layout";
import { HeaderClient } from "@/components/layout/HeaderClient";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <HeaderClient />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">문제가 발생했습니다</h1>
          <p className="text-border-dark/60 mb-8">
            대회 정보를 불러오는 중 오류가 발생했습니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-primary text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <RefreshCw size="1em" />
              다시 시도
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <ArrowLeft size="1em" />
              대회 목록으로
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
