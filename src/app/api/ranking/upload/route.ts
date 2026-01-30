import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadScreenshot } from "@/lib/blob";
import { extractRunData } from "@/lib/ocr";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 전송되지 않았습니다." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const screenshotUrl = await uploadScreenshot(file, session.user.id);

    // Extract running data using OCR
    const extracted = await extractRunData(screenshotUrl);

    // Validate extracted data
    if (!extracted.distanceKm || !extracted.paceSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: "기록을 인식하지 못했습니다. 다른 스크린샷을 시도해주세요.",
          rawText: extracted.rawText,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      screenshotUrl,
      extracted: {
        distanceKm: extracted.distanceKm,
        paceSeconds: extracted.paceSeconds,
        durationSeconds: extracted.durationSeconds,
        calories: extracted.calories,
      },
      rawText: extracted.rawText,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "스크린샷 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
