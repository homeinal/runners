import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Get current user's profile
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.crewProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { image: true } } },
  });

  return NextResponse.json(profile);
}
