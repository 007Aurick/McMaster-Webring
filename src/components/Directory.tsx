"use client";

import { useMemo, useState } from "react";
import { type Member } from "@/data/members";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

const PROGRAMS: { id: string; label: string; test: RegExp }[] = [
  { id: "e1", label: "Engineering 1", test: /engineering\s*1\b|eng\s*1\b/i },
  { id: "chem", label: "Chemical", test: /chemical/i },
  { id: "civil", label: "Civil", test: /civil/i },
  { id: "soft", label: "Computing & Software", test: /computing|software/i },
  { id: "cs", label: "Computer Science", test: /computer science|\bcomp(?:uter)?\s*sci\b|\bcs\b/i },
  { id: "ece", label: "Electrical & Computer", test: /electrical|computer engineering/i },
  { id: "phys", label: "Engineering Physics", test: /engineering physics|eng(?:ineering)?\s*phys/i },
  { id: "mat", label: "Materials", test: /materials/i },
  { id: "mech", label: "Mechanical", test: /\bmechanical\b/i },
  { id: "tron", label: "Mechatronics", test: /mechatronics/i },
  { id: "ibio", label: "iBioMed", test: /ibiomed|i-biomed/i },
  { id: "auto", label: "Automation Systems", test: /automation/i },
  { id: "veh", label: "Automotive", test: /automotive|vehicle engineering/i },
  { id: "bio", label: "Biotechnology", test: /biotech/i },
];

const SOCIALS = ["github", "instagram", "linkedin", "twitter"] as const;

function Icon({ name }: { name: (typeof SOCIALS)[number] }) {
  const paths = {
    github: "M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.34c.85 0 1.7.11 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.48A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2z",
    linkedin: "M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.05c.53-1 1.84-2.1 3.79-2.1 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z",
    twitter: "M18.24 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.4 22H2.12l8.02-9.17L1.5 2h6.75l4.66 6.17L18.24 2zm-1.16 18h1.81L7.01 3.9H5.07L17.08 20z",
    instagram: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z",
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

export default function Directory({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const chosen = PROGRAMS.filter((p) => programs.includes(p.id));
    return members.filter((m) => {
      if (chosen.length && !chosen.some((p) => p.test.test(m.program ?? ""))) return false;
      if (!s) return true;
      return m.name.toLowerCase().includes(s);
    });
  }, [members, q, programs]);

  return (
    <section className="directory" aria-labelledby="dir-h">
      <div className="dir-head">
        <h2 id="dir-h">Everyone</h2>
        <div className="dir-tools">
          <div className="filter-pop">
            <button
              type="button"
              className="filter-btn"
              aria-expanded={filtersOpen}
              aria-controls="program-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              Filter{programs.length > 0 ? ` · ${programs.length}` : ""}
            </button>
            {filtersOpen && (
              <div className="prog-filters" id="program-filters" role="group" aria-label="Filter by program">
                {PROGRAMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={programs.includes(p.id)}
                    onClick={() => setPrograms((cur) => cur.includes(p.id) ? cur.filter((id) => id !== p.id) : [...cur, p.id])}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="search"
            aria-label="Search by name"
            placeholder="Search by name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="board">
        <ul className="cards">
        {rows.map((m) => (
          <li key={m.id}>
            <article className="person">
              <span className="tack" aria-hidden="true" />
              <a className="person-photo" href={`/go?id=${m.id}`} target="_blank" rel="noopener" aria-label={`${m.name}'s site`}>
                {m.photo ? <img src={m.photo} alt="" /> : <span className="person-fallback">{initials(m.name)}</span>}
              </a>
              <div className="person-body">
                <h3><a href={`/go?id=${m.id}`} target="_blank" rel="noopener">{m.name}</a></h3>
                {m.program && <p className="person-program">{m.program}</p>}
                {m.description && <p className="person-line">{m.description}</p>}
                {SOCIALS.some((key) => m[key]) && (
                  <div className="person-foot">
                    <div className="socials">
                      {SOCIALS.map((key) =>
                        m[key] ? (
                          <a key={key} href={m[key]} target="_blank" rel="noopener" aria-label={key}>
                            <Icon name={key} />
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </li>
        ))}
          {rows.length === 0 && <li className="none">Nobody matches that.</li>}
        </ul>
      </div>
    </section>
  );
}
