import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UploadClient } from "./UploadClient";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "기록 등록 - 매달",
  description: "러닝 기록을 등록하고 오늘의 랭킹에 도전하세요.",
};

export default function UploadPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            기록 등록하기
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            러닝 앱 스크린샷을 업로드하면 AI가 자동으로 기록을 추출합니다.
          </p>
        </div>
        <UploadClient />
      </main>
      <Footer />
    </AuthGuard>
  );
}
