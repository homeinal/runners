import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { Album, ArrowRight, Calendar } from "lucide-react";

export const metadata = {
  title: "컬럼 - 매달",
  description: "러닝에 대한 깊이 있는 이야기를 만나보세요.",
};

export const dynamic = "force-dynamic";

const formatTimestamp = (value?: Date | string | null) => {
  if (!value) return null;
  return format(new Date(value), "yyyy.MM.dd", { locale: ko });
};

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">컬럼</h1>
          <p className="text-sm text-gray-500 mt-2">러닝에 대한 깊이 있는 이야기</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-(--shadow-neobrutalism)">
            <Album className="size-16 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-bold text-gray-400 dark:text-gray-500">
              아직 작성된 컬럼이 없습니다
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-0 sm:gap-6 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism) hover:translate-x-px hover:translate-y-px transition-all overflow-hidden"
              >
                {post.coverImageUrl ? (
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Album className="size-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>{formatTimestamp(post.publishedAt) ?? formatTimestamp(post.createdAt)}</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-400 group-hover:text-border-dark dark:group-hover:text-white transition-colors">
                      읽기
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
