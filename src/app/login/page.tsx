import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { PersonStanding } from "lucide-react";

export const metadata = {
  title: "로그인 - 매달",
  description: "매달에 로그인하여 러닝 랭킹에 참여하세요.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-[500px] mx-auto px-4 py-20 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="size-20 bg-primary border-4 border-border-dark rounded-full flex items-center justify-center shadow-(--shadow-neobrutalism)">
            <PersonStanding className="text-border-dark" size={48} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            매달 로그인
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 font-medium">
            러닝 랭킹에 참여하고 크루를 찾아보세요
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white dark:bg-background-dark border-4 border-border-dark dark:border-white rounded-2xl p-8 shadow-(--shadow-neobrutalism)">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-background-dark text-border-dark dark:text-white border-2 border-border-dark dark:border-white px-6 py-4 rounded-xl font-bold text-base shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center">
          로그인하면 매달의 서비스 이용약관에 동의하는 것으로 간주됩니다.
        </p>
      </main>
      <Footer />
    </>
  );
}
