"use client";

import { useState } from "react";
import { FACULTIES, type Faculty, type Member } from "@/data/members";

const SLOTS_MIN = 12;
const C = 300; // centre
const R = 190; // outer ring radius
const r2 = (n: number) => Math.round(n * 100) / 100; // identical on server and client

/** quiet -> maroon -> gold, the flame's two colours */
const STOPS: [number, [number, number, number]][] = [
  [0, [214, 206, 208]],
  [0.45, [173, 18, 41]],
  [1, [254, 223, 2]],
];
function heatColour(t: number): string {
  const v = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) {
    const [b, cb] = STOPS[i];
    const [a, ca] = STOPS[i - 1];
    if (v <= b) {
      const k = (v - a) / (b - a);
      const c = ca.map((x, j) => Math.round(x + (cb[j] - x) * k));
      return `rgb(${c.join(",")})`;
    }
  }
  return "rgb(254,223,2)";
}

export default function Ring({
  members,
  edges,
  temp,
  heatOn,
}: {
  members: Member[];
  edges: [string, string][];
  temp: Record<string, number>;
  heatOn: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<Faculty | null>(null);

  const slots = Math.max(SLOTS_MIN, members.length);
  const pos = (i: number, rad = R) => {
    const a = (i / slots) * Math.PI * 2 - Math.PI / 2;
    return { a, x: r2(C + rad * Math.cos(a)), y: r2(C + rad * Math.sin(a)) };
  };
  const index = new Map(members.map((m, i) => [m.id, i]));

  // one inner ring per faculty that has members, outermost first
  const present = (Object.keys(FACULTIES) as Faculty[]).filter((f) => members.some((m) => m.faculty === f));
  const step = Math.min(24, (R - 96) / Math.max(present.length, 1));
  const facR = new Map(present.map((f, k) => [f, r2(R - 30 - step * k)]));

  const hovered = members.find((m) => m.id === hover) ?? null;
  const friendEdges = hover ? edges.filter(([a, b]) => a === hover || b === hover) : [];
  const activeFaculty = hovered?.faculty ?? faculty;
  const dim = (m: Member) => faculty !== null && m.faculty !== faculty;
  const big = members.length > 30;

  return (
    <div className="ring-wrap">
      <div className="ring-stage">
        <svg className="ring" viewBox="0 0 600 600" role="img" aria-label={`The ring: ${members.length} members`}>
          <defs>
            <linearGradient id="molten" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fedf02" />
              <stop offset="0.5" stopColor="#ad1229" />
              <stop offset="1" stopColor="#fedf02" />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="boltglow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* faculty rings */}
          {present.map((f) => (
            <g key={f} className={activeFaculty === f ? "fac-ring on" : "fac-ring"}>
              <circle cx={C} cy={C} r={facR.get(f)} />
              {members
                .filter((m) => m.faculty === f)
                .map((m) => {
                  const p = pos(index.get(m.id)!, facR.get(f));
                  return <circle key={m.id} className="fac-dot" cx={p.x} cy={p.y} r={3.5} />;
                })}
            </g>
          ))}

          {/* outer ring: cold steel underneath, molten layer heats up on load */}
          <circle className="ring-cold" cx={C} cy={C} r={R} />
          <g className="ring-hot">
            <circle cx={C} cy={C} r={R} stroke="#ad1229" strokeWidth={18} fill="none" filter="url(#glow)" opacity={0.4} />
            <circle cx={C} cy={C} r={R} stroke="url(#molten)" strokeWidth={6} fill="none" />
          </g>

          {friendEdges.map(([a, b]) => {
            const p = pos(index.get(a)!), q = pos(index.get(b)!);
            const mx = r2(((p.x + q.x) / 2) * 0.5 + C * 0.5), my = r2(((p.y + q.y) / 2) * 0.5 + C * 0.5);
            return <path key={a + b} className="chord" d={`M${p.x},${p.y} Q${mx},${my} ${q.x},${q.y}`} />;
          })}

          {Array.from({ length: slots }, (_, i) => {
            const { a, x, y } = pos(i);
            const m = members[i];
            const deg = r2((a * 180) / Math.PI);
            const flip = deg > 90 && deg < 270;
            const lx = r2(C + (R + 22) * Math.cos(a)), ly = r2(C + (R + 22) * Math.sin(a));

            if (!m) {
              return (
                <a key={i} href="#join" className="slot empty" aria-label="Open spot, join the ring">
                  <circle cx={x} cy={y} r={6} />
                </a>
              );
            }
            const t = heatOn ? temp[m.id] ?? 0 : 0.5;
            const fill = heatColour(t);
            return (
              <a
                key={m.id}
                href={`/go?id=${m.id}`}
                target="_blank"
                rel="noopener"
                className={`slot${hover === m.id ? " on" : ""}${dim(m) ? " dim" : ""}`}
                aria-label={`${m.name}${m.building ? `, building ${m.building}` : ""}`}
                onMouseEnter={() => setHover(m.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(m.id)}
                onBlur={() => setHover(null)}
              >
                {t > 0.6 && <circle cx={x} cy={y} r={big ? 8 : 13} fill={fill} filter="url(#boltglow)" opacity={0.8} />}
                <circle className="bolt" cx={x} cy={y} r={big ? 6 : 10} style={{ fill }} />
                <circle className="bolt-core" cx={x} cy={y} r={big ? 2 : 3.5} />
                <text
                  x={lx}
                  y={ly}
                  transform={`rotate(${r2(flip ? deg + 180 : deg)} ${lx} ${ly})`}
                  textAnchor={flip ? "end" : "start"}
                  dominantBaseline="middle"
                >
                  {m.name}
                </text>
              </a>
            );
          })}
        </svg>

        <div className="ring-centre" aria-live="polite">
          {hovered ? (
            <>
              <strong>{hovered.name}</strong>
              <span className="fac">{FACULTIES[hovered.faculty]}</span>
              {hovered.building && <span className="bld">building {hovered.building}</span>}
            </>
          ) : (
            <>
              <span className="count">
                {faculty ? members.filter((m) => m.faculty === faculty).length : members.length}
              </span>
              <span className="fac">{faculty ? FACULTIES[faculty] : "across all of Mac"}</span>
            </>
          )}
        </div>
      </div>

      <div className="ring-controls">
        <div className="fac-picker" role="group" aria-label="Show a faculty's ring">
          <button aria-pressed={faculty === null} onClick={() => setFaculty(null)}>All of Mac</button>
          {present.map((f) => (
            <button key={f} aria-pressed={faculty === f} onClick={() => setFaculty(faculty === f ? null : f)}>
              {FACULTIES[f]}
            </button>
          ))}
        </div>
        {heatOn && <p className="legend">The more visits a site gets this week, the hotter its bolt glows.</p>}
      </div>
    </div>
  );
}
