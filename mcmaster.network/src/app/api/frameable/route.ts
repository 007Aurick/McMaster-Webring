import { NextRequest, NextResponse } from "next/server";
import { members } from "@/data/members";
import { SITE_URL } from "@/lib";

/**
 * GET /api/frameable?id=<member id>  ->  { frameable: boolean }
 * Tells the tour whether a member's site allows being shown inside a frame.
 * Only ever fetches URLs from members.ts, with a timeout.
 */
const cache = new Map<string, { at: number; ok: boolean }>();
const DAY = 86400000;
const HOUR = 3600000; // failures are re-checked sooner, in case it was a blip

function allowsFraming(headers: Headers): boolean {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin"))) return false;
  const csp = headers.get("content-security-policy")?.toLowerCase() ?? "";
  const fa = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("frame-ancestors"));
  if (fa) {
    const sources = fa.split(/\s+/).slice(1);
    const ours = new URL(SITE_URL).host;
    if (!sources.some((s) => s === "*" || s.includes(ours))) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const m = members.find((x) => x.id === req.nextUrl.searchParams.get("id"));
  if (!m) return NextResponse.json({ frameable: false }, { status: 404 });

  const hit = cache.get(m.id);
  let ok: boolean;
  if (hit && Date.now() - hit.at < (hit.ok ? DAY : HOUR)) ok = hit.ok;
  else {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch(m.website, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "mcmaster.network tour check" },
        cache: "no-store",
      });
      ok = res.ok && /^https?:/.test(res.url || m.website) && allowsFraming(res.headers);
      res.body?.cancel().catch(() => {});
    } catch {
      ok = false;
    } finally {
      clearTimeout(t);
    }
    cache.set(m.id, { at: Date.now(), ok });
  }

  return NextResponse.json(
    { frameable: ok },
    { headers: { "Cache-Control": `public, s-maxage=${ok ? 86400 : 3600}` } },
  );
}
