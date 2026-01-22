import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-session";
import AdminPostForm from "./AdminPostForm";

const formatDate = (value: Date) => format(value, "PPP", { locale: ko });

export default async function AdminPostsPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/mrth-manage");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, slug: true, status: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Admin only</p>
            <h1 className="text-3xl font-semibold text-gray-900">Create post</h1>
            <p className="text-sm text-gray-600">
              Use this form to publish new posts and keep the blog up to date.
            </p>
          </div>
          <AdminPostForm />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent posts</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
              {posts.length} items
            </span>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
            {posts.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No posts created yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="space-y-1 px-6 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                    {post.status}
                  </p>
                  <p className="text-lg font-medium text-gray-900">{post.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span>Slug: {post.slug}</span>
                    <span>Created {formatDate(post.createdAt)}</span>
                    <Link
                      href={`/mrth-manage/posts/${post.slug}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
