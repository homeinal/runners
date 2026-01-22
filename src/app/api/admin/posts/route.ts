import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { resolvePublishedAt } from "@/lib/post-utils";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title,
    slug,
    excerpt,
    contentMd,
    coverImageUrl,
    status = "draft",
    publishedAt,
  } = await request.json();

  if (!title || !slug || !contentMd) {
    return NextResponse.json(
      { error: "Title, slug, and content are required" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        contentMd,
        coverImageUrl: coverImageUrl || null,
        status,
        publishedAt: resolvePublishedAt(status, publishedAt),
      },
    });

    revalidatePath("/posts");
    revalidatePath(`/posts/${post.slug}`);

    return NextResponse.json(post);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
