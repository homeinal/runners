import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { resolvePublishedAt } from "@/lib/post-utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function PUT(request: NextRequest, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: currentSlug } = await params;
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
      { error: "title, slug, and contentMd are required" },
      { status: 400 }
    );
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { slug: currentSlug },
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
    revalidatePath(`/posts/${currentSlug}`);
    revalidatePath(`/posts/${updatedPost.slug}`);

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
