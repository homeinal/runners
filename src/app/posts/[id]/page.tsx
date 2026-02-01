import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

const formatTimestamp = (value?: Date | string | null) => {
  if (!value) return null;
  return format(new Date(value), "yyyy년 M월 d일", { locale: ko });
};

export const dynamic = "force-static";
export const fetchCache = "force-cache";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });
  return posts.map((post) => ({ id: post.slug }));
}

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { slug: id },
  });

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Back link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-border-dark dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          컬럼 목록
        </Link>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-border-dark dark:border-white shadow-(--shadow-neobrutalism)">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title & meta */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-base text-gray-500 mt-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-4">
            <Calendar size={16} />
            <span>
              {formatTimestamp(post.publishedAt) ?? formatTimestamp(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <article className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-2xl shadow-(--shadow-neobrutalism) p-6 sm:p-8 text-base leading-relaxed whitespace-pre-line">
          {post.contentMd}
        </article>
      </main>
      <Footer />
    </>
  );
}
