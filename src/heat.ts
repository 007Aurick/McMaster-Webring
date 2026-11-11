/**
 * Heat: how much traffic each member's site gets through the ring this week.
 *
 * Stored in Upstash Redis (free tier is plenty). Add it from the Vercel
 * Marketplace, or set these yourself (server-only, never NEXT_PUBLIC_):
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   (KV_REST_API_URL + KV_REST_API_TOKEN also work)
 *   HEAT_SALT  any long random string, used to hash visitor IPs
 *
 * Without them the site still works; every bolt just stays at room temperature.
 *
 * Privacy: raw IPs are never stored. A visit is counted at most once per hour
 * per (hashed IP, member), so refreshing your own link doesn't heat you up.
 */
import { createHash } from "node:crypto";
import { members } from "@/data/members";

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const SALT = process.env.HEAT_SALT || TOKEN || "";
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|curl|wget|python|headless/i;

export const heatEnabled = Boolean(URL_ && TOKEN);

type Cmd = (string | number)[];

async function redis(cmds: Cmd[]): Promise<unknown[] | null> {
  if (!heatEnabled) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1500);
  try {
    const res = await fetch(`${URL_}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    return data.map((d) => d.result ?? null);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** ISO week key like "2026-W46", in UTC. */
function weekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

/** Count one visit to a member's site. Safe to call fire-and-forget. */
export async function recordVisit(memberId: string, headers: Headers): Promise<void> {
  if (!heatEnabled || !members.some((m) => m.id === memberId)) return;
  if (BOT.test(headers.get("user-agent") ?? "")) return;

  const who = createHash("sha256").update(`${SALT}|${clientIp(headers)}`).digest("hex").slice(0, 20);
  const first = await redis([["SET", `heat:seen:${who}:${memberId}`, 1, "NX", "EX", 3600]]);
  if (!first || first[0] !== "OK") return;

  const key = `heat:${weekKey()}`;
  await redis([
    ["ZINCRBY", key, 1, memberId],
    ["EXPIRE", key, 60 * 60 * 24 * 16],
  ]);
}

export interface Heat {
  /** visits this week, per member id */
  visits: Record<string, number>;
  /** 0..1 temperature per member id (this week + half of last week, relative to the hottest) */
  temp: Record<string, number>;
}

function parseZ(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = Number(raw[i + 1]) || 0;
  return out;
}

export async function getHeat(): Promise<Heat> {
  const empty = { visits: {}, temp: {} };
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 86400000);
  const res = await redis([
    ["ZRANGE", `heat:${weekKey(now)}`, 0, -1, "WITHSCORES"],
    ["ZRANGE", `heat:${weekKey(lastWeek)}`, 0, -1, "WITHSCORES"],
  ]);
  if (!res) return empty;

  const visits = parseZ(res[0]);
  const prev = parseZ(res[1]);
  const score: Record<string, number> = {};
  for (const m of members) score[m.id] = (visits[m.id] ?? 0) + 0.5 * (prev[m.id] ?? 0);
  const max = Math.max(0, ...Object.values(score));
  const temp: Record<string, number> = {};
  for (const id in score) temp[id] = max > 0 ? score[id] / max : 0;
  return { visits, temp };
}
