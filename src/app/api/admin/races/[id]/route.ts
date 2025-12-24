import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
      categories: {
        include: { schedules: true },
      },
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
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        region: data.region || null,
        venue: data.venue || null,
        organizer: data.organizer || null,
        website: data.website || null,
        registrationStatus: data.registrationStatus || null,
        registrationStart: data.registrationStart
          ? new Date(data.registrationStart)
          : null,
        registrationEnd: data.registrationEnd
          ? new Date(data.registrationEnd)
          : null,
        isFeatured: data.isFeatured ?? false,
        isUrgent: data.isUrgent ?? false,
        generalGuide: data.generalGuide || null,
        phone: data.phone || null,
        email: data.email || null,
      },
    });

    // Update categories
    if (data.categories && Array.isArray(data.categories)) {
      for (const category of data.categories) {
        await prisma.raceCategory.update({
          where: { id: category.id },
          data: {
            name: category.name,
            status: category.status,
            startTime: category.startTime || null,
          },
        });

        // Update schedules
        if (category.schedules && Array.isArray(category.schedules)) {
          for (const schedule of category.schedules) {
            await prisma.raceSchedule.update({
              where: { id: schedule.id },
              data: {
                startAt: schedule.startAt ? new Date(schedule.startAt) : null,
                endAt: schedule.endAt ? new Date(schedule.endAt) : null,
              },
            });
          }
        }
      }
    }

    // Fetch updated race
    const updatedRace = await prisma.race.findUnique({
      where: { id },
      include: {
        categories: {
          include: { schedules: true },
        },
      },
    });

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("Failed to update race:", error);
    return NextResponse.json(
      { error: "Failed to update race" },
      { status: 500 }
    );
  }
}
