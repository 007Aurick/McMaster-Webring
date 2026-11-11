import { after, NextRequest, NextResponse } from "next/server";
import { members, getNeighbours, getRing, parseScope } from "@/data/members";
import { recordVisit } from "@/heat";
import { SITE_URL } from "@/lib";

/**
 * Ring navigation. The widget's arrows and plain links both land here:
 *   /go?from=<id>&to=next | prev | random[&ring=faculty]
 *   /go?id=<id>   jump straight to a member (used by the homepage and tour)
 * Every hop is counted as heat for the site it lands on.
 */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "random";
  const scope = parseScope(sp.get("ring"));
  const direct = sp.get("id");

  let target = direct ? members.find((m) => m.id === direct) : undefined;
  if (!target) {
    const n = getNeighbours(from, scope);
    if (n && to === "next") target = n.next;
    else if (n && to === "prev") target = n.prev;
    else {
      const pool = (from ? getRing(from, scope) : members).filter((m) => m.id !== from);
      target = pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
    }
  }

  if (target && target.id !== from) {
    const id = target.id;
    const headers = req.headers;
    after(() => recordVisit(id, headers));
  }

  return NextResponse.redirect(target?.website ?? SITE_URL, { status: 302, headers: { "Cache-Control": "no-store" } });
}
