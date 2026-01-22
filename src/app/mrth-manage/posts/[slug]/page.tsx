import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-session";
import AdminPostForm from "../AdminPostForm";

const formatDate = (value: Date) => format(value, "PPP", { locale: ko });

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/mrth-manage");
  }

  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    notFound();
  }

  const initialData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    contentMd: post.contentMd,
    coverImageUrl: post.coverImageUrl ?? "",
    status: post.status,
    publishedAt: post.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 16)
      : "",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <Link
            href="/mrth-manage/posts"
            className="text-xs uppercase tracking-[0.4em] text-gray-400 hover:text-gray-600"
          >
            ← Back to posts
          </Link>
          <p>Created {formatDate(post.createdAt)}</p>
          {post.publishedAt && <p>Published {formatDate(post.publishedAt)}</p>}
        </div>

        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">Edit post</h1>
          <AdminPostForm
            initialData={initialData}
            submitUrl={`/api/admin/posts/${slug}`}
            submitMethod="PUT"
            successMessage="Post updated."
            resetAfterSubmit={false}
          />
        </section>
      </main>
    </div>
  );
}
