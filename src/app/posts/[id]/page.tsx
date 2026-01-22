import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const formatTimestamp = (value?: Date | string | null) => {
  if (!value) return null;
  return format(new Date(value), "PPP", { locale: ko });
};

export const dynamic = "force-static";
export const fetchCache = "force-cache";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: {
      slug: true,
    },
  });

  return posts.map((post) => ({
    id: post.slug,
  }));
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
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-6">
          <div className="space-y-2">
            <Link
              href="/posts"
              className="text-sm text-muted-foreground hover:text-foreground/80"
            >
              ← Back to posts
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {post.status}
            </p>
            <h1 className="text-3xl font-semibold leading-snug">{post.title}</h1>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            )}
            <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
              <span>Created {formatTimestamp(post.createdAt)}</span>
              {post.publishedAt && (
                <span>Published {formatTimestamp(post.publishedAt)}</span>
              )}
            </div>
          </div>

          <article className="rounded-2xl border border-border bg-card/80 p-6 text-sm leading-relaxed whitespace-pre-line">
            {post.contentMd}
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
