/**
 * MCMASTER.NETWORK MEMBERS
 *
 * Want in? You need to be a current McMaster student (or recent grad)
 * with a personal website.
 *
 *   1. Fork the repo
 *   2. (optional) Add a square photo to public/photos/your-id.jpg
 *   3. Add your entry to the BOTTOM of the `members` array below
 *   4. Run `npm run validate` and open a pull request
 *
 * The order of this array IS the ring: the widget's arrows send visitors
 * to the member before / after you. Add yourself at the end.
 *
 * Required:
 *   id       lowercase-with-hyphens, unique (e.g. "jane-doe")
 *   name     your name
 *   website  full URL, https://...
 *   program  e.g. "Engineering Physics", "Computer Science" (max 80 characters)
 *
 * Optional, shown on your card:
 *   description  one line, e.g. "SWE @ Magic Hour AI" (max 80 characters)
 *   photo        "/photos/your-id.jpg"
 *   github, linkedin, twitter, instagram   full URLs. Only the ones you add show up.
 */

export const FACULTIES = {
  engineering: "Engineering",
  "health-sciences": "Health Sciences",
  science: "Science",
  business: "Business",
  humanities: "Humanities",
  "social-sciences": "Social Sciences",
} as const;

export type Faculty = keyof typeof FACULTIES;

export interface Member {
  id: string;
  name: string;
  website: string;
  faculty?: Faculty;
  building?: string;
  description?: string;
  program: string;
  year?: string;
  tags?: Tag[];
  photo?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  friends?: string[];
}

export const TAG_OPTIONS = [
  "mechanical",
  "electrical",
  "mechatronics",
  "civil",
  "chemical",
  "materials",
  "biomedical",
  "computer",
  "software",
  "hardware",
  "robotics",
  "ai/ml",
  "design",
  "product",
  "research",
  "health",
  "finance",
  "startups",
  "writing",
  "art",
] as const;

export type Tag = (typeof TAG_OPTIONS)[number];

/** Shown on View everyone even when nobody has picked them yet. */
export const ENGINEERING_TAGS: readonly Tag[] = [
  "mechanical",
  "electrical",
  "mechatronics",
  "civil",
  "chemical",
  "materials",
  "biomedical",
  "computer",
  "software",
  "hardware",
  "robotics",
];

export const rawMembers: Member[] = [
  {
    id: "aurick-anwar",
    name: "Aurick Anwar",
    website: "https://aurickanwar.com",
    program: "Engineering Physics",
    description: "SWE @ Magic Hour AI",
    photo: "/photos/aurick.jpg",
    github: "https://github.com/007Aurick",
    instagram: "https://www.instagram.com/_aur1ck/",
    linkedin: "https://www.linkedin.com/in/aurick-anwar/",
    twitter: "https://x.com/007Aurick",
  },

  // ============================================
  // ADD YOUR ENTRY BELOW THIS LINE
  // ============================================
];

/** Only http(s) links ever reach the page or the widget (blocks javascript: URLs etc). */
function safeUrl(u?: string): string | undefined {
  if (!u) return undefined;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export const members: Member[] = rawMembers
  .filter((m) => safeUrl(m.website) && m.program?.trim())
  .map((m) => ({
    ...m,
    faculty: m.faculty && m.faculty in FACULTIES ? m.faculty : undefined,
    program: m.program.replace(/\s+/g, " ").trim().slice(0, 80),
    building: m.building?.trim().slice(0, 80) || undefined,
    description: m.description?.replace(/\s+/g, " ").trim().slice(0, 80) || undefined,
    website: safeUrl(m.website)!,
    github: safeUrl(m.github),
    linkedin: safeUrl(m.linkedin),
    twitter: safeUrl(m.twitter),
    instagram: safeUrl(m.instagram),
    photo: m.photo && /^\/photos\/[\w.-]+\.(jpe?g|png|webp)$/i.test(m.photo) ? m.photo : undefined,
  }));

/** Undirected edges for the network graph (deduplicated). */
export function getEdges(list: Member[] = members): [string, string][] {
  const ids = new Set(list.map((m) => m.id));
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  for (const m of list) {
    for (const f of m.friends ?? []) {
      if (!ids.has(f) || f === m.id) continue;
      const key = [m.id, f].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([m.id, f]);
    }
  }
  return edges;
}

export type Scope = "mac" | "faculty";

/** The ring a member belongs to: everyone, or just their faculty. */
export function getRing(id: string, scope: Scope = "mac"): Member[] {
  if (scope === "mac") return members;
  const me = members.find((m) => m.id === id);
  return me?.faculty ? members.filter((m) => m.faculty === me.faculty) : members;
}

/** Previous / next member in the ring (or in their faculty's ring). */
export function getNeighbours(id: string, scope: Scope = "mac"): { prev: Member; next: Member } | null {
  const ring = getRing(id, scope);
  const i = ring.findIndex((m) => m.id === id);
  if (i === -1) return null;
  const n = ring.length;
  return { prev: ring[(i - 1 + n) % n], next: ring[(i + 1) % n] };
}

export const parseScope = (s: string | null): Scope => (s === "faculty" ? "faculty" : "mac");
