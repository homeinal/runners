import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - List all profiles with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const search = searchParams.get("search");
  const day = searchParams.get("day");

  const profiles = await prisma.crewProfile.findMany({
    where: {
      ...(region && region !== "전체" && { region }),
      ...(day && { availableDays: { has: day } }),
      ...(search && {
        OR: [
          { nickname: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search] } },
        ],
      }),
    },
    include: { user: { select: { image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(profiles);
}

// POST - Create new profile
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if profile already exists
  const existing = await prisma.crewProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "이미 프로필이 존재합니다" },
      { status: 400 }
    );
  }

  const body = await request.json();

  // Validate required fields
  if (!body.nickname || !body.region || !body.pace) {
    return NextResponse.json(
      { error: "필수 항목을 입력해주세요" },
      { status: 400 }
    );
  }

  const profile = await prisma.crewProfile.create({
    data: {
      userId: session.user.id,
      nickname: body.nickname,
      region: body.region,
      pace: body.pace,
      message: body.message || null,
      tags: body.tags || [],
      availableDays: body.availableDays || [],
      preferredTime: body.preferredTime || null,
    },
    include: { user: { select: { image: true } } },
  });

  return NextResponse.json(profile);
}
