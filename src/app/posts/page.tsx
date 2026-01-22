import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

const formatTimestamp = (value?: Date | string | null) => {
  if (!value) return null;
  return format(new Date(value), "PPP", { locale: ko });
};

export default async function PostPage() {
  const posts = await prisma.post.findMany({
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Slug, status, publish time, and excerpt pulled from the database.
          </p>
        </div>

        <Card className="divide-y">
          {posts.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No posts yet.</div>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="p-6 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {post.title}
                  </Link>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {post.status}
                  </span>
                </div>

                {post.excerpt && (
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                )}

                <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                  <span>Slug: {post.slug}</span>
                  <span>
                    {post.publishedAt
                      ? `Published ${formatTimestamp(post.publishedAt)}`
                      : "Not published"}
                  </span>
                  <span>Created {formatTimestamp(post.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </main>
      <Footer />
    </>
  );
}
