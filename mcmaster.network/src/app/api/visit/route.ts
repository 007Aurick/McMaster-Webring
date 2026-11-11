import { after, NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/heat";

/** POST /api/visit {"id": "<member id>"}: the tour counts a site once it's been on screen for a bit. */
export async function POST(req: NextRequest) {
  let id = "";
  try {
    id = String((await req.json())?.id ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const headers = req.headers;
  after(() => recordVisit(id, headers));
  return NextResponse.json({ ok: true });
}
