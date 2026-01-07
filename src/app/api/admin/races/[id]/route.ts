import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const race = await prisma.race.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  return NextResponse.json(race);
}

export async function PUT(request: NextRequest, { params }: Props) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await request.json();

    // Update race basic info
    await prisma.race.update({
      where: { id },
      data: {
        title: data.title,
        eventStartAt: data.eventStartAt ? new Date(data.eventStartAt) : undefined,
        eventTimezone: data.eventTimezone || "Asia/Seoul",
        eventTimeRaw: data.eventTimeRaw || null,
        country: data.country || "Unknown",
        region: data.region || null,
        venue: data.venue || null,
        organizer: data.organizer || "Unknown",
        organizerRep: data.organizerRep || null,
        website: data.website || null,
        registrationStatus: data.registrationStatus || "unknown",
        registrationStartAt: data.registrationStartAt
          ? new Date(data.registrationStartAt)
          : null,
        registrationEndAt: data.registrationEndAt
          ? new Date(data.registrationEndAt)
          : null,
        categoriesRaw: Array.isArray(data.categoriesRaw) ? data.categoriesRaw : [],
        isFeatured: data.isFeatured ?? false,
        isUrgent: data.isUrgent ?? false,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        sourceUrl: data.sourceUrl || null,
      },
    });

    // Update categories
    if (data.categories && Array.isArray(data.categories)) {
      for (const category of data.categories) {
        const distanceValue = Number(category.distanceKm);
        await prisma.raceEventCategory.update({
          where: { id: category.id },
          data: {
            rawName: category.rawName,
            canonicalName: category.canonicalName,
            distanceKm: Number.isFinite(distanceValue) ? distanceValue : null,
            type: category.type,
            tags: Array.isArray(category.tags) ? category.tags : [],
          },
        });
      }
    }

    // Fetch updated race
    const updatedRace = await prisma.race.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    revalidatePath("/");
    revalidatePath(`/races/${id}`);
    revalidatePath("/urgent");
    revalidatePath("/weekly");

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("Failed to update race:", error);
    return NextResponse.json(
      { error: "Failed to update race" },
      { status: 500 }
    );
  }
}
