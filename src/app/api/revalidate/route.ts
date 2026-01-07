import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

function normalizePaths(input: unknown): string[] {
  const raw: unknown[] = [];
  if (typeof input === "string") {
    raw.push(input);
  } else if (Array.isArray(input)) {
    raw.push(...input);
  }

  const unique = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed.startsWith("/")) continue;
    unique.add(trimmed);
  }

  return Array.from(unique);
}

export async function POST(request: NextRequest) {
  if (!REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not set" },
      { status: 500 }
    );
  }

  let payload: { secret?: string; paths?: string[] | string } | null = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || payload.secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = normalizePaths(payload.paths ?? []);
  if (paths.length === 0) {
    return NextResponse.json({ error: "No paths to revalidate" }, { status: 400 });
  }

  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: paths, timestamp: Date.now() });
}
