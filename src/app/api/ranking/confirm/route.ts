import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ConfirmRequestBody {
  screenshotUrl: string;
  distanceKm: number;
  paceSeconds: number;
  durationSeconds: number;
  calories?: number;
  runDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body: ConfirmRequestBody = await request.json();
    const {
      screenshotUrl,
      distanceKm,
      paceSeconds,
      durationSeconds,
      calories,
      runDate,
    } = body;

    // Validate required fields
    if (!screenshotUrl || !distanceKm || !paceSeconds || !durationSeconds) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Default to today in KST if no date provided
    const recordDate = runDate
      ? new Date(runDate)
      : new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));

    // Create RunRecord
    const runRecord = await prisma.runRecord.create({
      data: {
        userId: session.user.id,
        distanceKm,
        paceSeconds,
        durationSeconds,
        calories,
        screenshotUrl,
        runDate: recordDate,
      },
    });

    return NextResponse.json({
      success: true,
      record: runRecord,
    });
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json(
      { error: "기록 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
