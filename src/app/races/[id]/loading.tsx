import { Header, Footer } from "@/components/layout";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-border-dark/60 uppercase">로딩 중...</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
