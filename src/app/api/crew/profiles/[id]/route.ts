import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Get single profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const profile = await prisma.crewProfile.findUnique({
    where: { id },
    include: { user: { select: { image: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PATCH - Update profile
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.crewProfile.findUnique({ where: { id } });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const updated = await prisma.crewProfile.update({
    where: { id },
    data: {
      nickname: body.nickname,
      region: body.region,
      pace: body.pace,
      message: body.message,
      tags: body.tags,
      availableDays: body.availableDays,
      preferredTime: body.preferredTime,
    },
    include: { user: { select: { image: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE - Delete profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.crewProfile.findUnique({ where: { id } });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.crewProfile.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
