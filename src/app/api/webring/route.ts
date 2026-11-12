import { NextRequest, NextResponse } from "next/server";
import { FACULTIES, members, getNeighbours, parseScope, type Member } from "@/data/members";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const pub = (m: Member) => ({
  id: m.id,
  name: m.name,
  website: m.website,
  faculty: m.faculty ?? null,
  facultyName: m.faculty ? FACULTIES[m.faculty] : null,
  building: m.building ?? null,
});

export function OPTIONS() {
  return new NextResponse(null, { headers: cors });
}

/**
 * GET /api/webring                          every member, in ring order
 * GET /api/webring?user=<id>                that member's prev / next
 * GET /api/webring?user=<id>&ring=faculty   prev / next within their faculty
 */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const user = sp.get("user");
  const scope = parseScope(sp.get("ring"));
  const body: Record<string, unknown> = { count: members.length, members: members.map(pub) };

  if (user) {
    const n = getNeighbours(user, scope);
    Object.assign(body, {
      user,
      ring: scope,
      found: Boolean(n),
      prev: n ? pub(n.prev) : null,
      next: n ? pub(n.next) : null,
    });
  }

  return NextResponse.json(body, {
    headers: { ...cors, "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
