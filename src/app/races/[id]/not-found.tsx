import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-8xl font-black text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">대회를 찾을 수 없습니다</h2>
          <p className="text-border-dark/60 mb-8">
            요청하신 대회 정보가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-border-dark border-2 border-border-dark px-6 py-3 rounded-full font-bold uppercase shadow-[var(--shadow-neobrutalism)] hover:shadow-[var(--shadow-neobrutalism-hover)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Icon name="arrow_back" />
            대회 목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
