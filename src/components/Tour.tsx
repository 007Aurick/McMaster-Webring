"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Member } from "@/data/members";

const COUNT_AFTER = 5000; // ms on screen before it counts as a visit

export default function Tour({ members }: { members: Member[] }) {
  const [i, setI] = useState(0);
  const [frameable, setFrameable] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const counted = useRef(new Set<string>());

  const m = members.length ? members[((i % members.length) + members.length) % members.length] : null;
  const pos = m ? members.indexOf(m) + 1 : 0;

  // start somewhere random so the first member isn't always first
  // (or at ?start=<id>, so you can share a tour that begins on your site)
  useEffect(() => {
    const start = new URLSearchParams(window.location.search).get("start");
    const at = start ? members.findIndex((x) => x.id === start) : -1;
    setI(at >= 0 ? at : Math.floor(Math.random() * Math.max(members.length, 1)));
  }, [members]);

  const go = useCallback((d: number) => {
    setI((x) => x + d);
    setLoaded(false);
  }, []);

  // ask the server whether this site (and the next one) can be framed
  useEffect(() => {
    if (!m) return;
    const nextM = members[(members.indexOf(m) + 1) % members.length];
    for (const x of [m, nextM]) {
      if (!x || x.id in frameable) continue;
      fetch(`/api/frameable?id=${x.id}`)
        .then((r) => r.json())
        .then((d) => setFrameable((f) => ({ ...f, [x.id]: Boolean(d.frameable) })))
        .catch(() => setFrameable((f) => ({ ...f, [x.id]: false })));
    }
  }, [m, members, frameable]);

  // count a visit once the site has been on screen for a few seconds
  useEffect(() => {
    if (!m || counted.current.has(m.id)) return;
    const t = setTimeout(() => {
      counted.current.add(m.id);
      fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id }) }).catch(() => {});
    }, COUNT_AFTER);
    return () => clearTimeout(t);
  }, [m]);

  // keyboard: arrows move between sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const status = m ? frameable[m.id] : undefined;

  return (
    <div className="tour">
      <header className="tour-bar">
        <a className="tour-home" href="/" aria-label="Back">
          <span aria-hidden="true">&larr;</span>
        </a>

        <div className="tour-now" aria-live="polite">
          {m ? (
            <>
              <span className="tour-pos">{String(pos).padStart(2, "0")}<small>/{String(members.length).padStart(2, "0")}</small></span>
              <div>
                <strong>{m.name}</strong>
              </div>
            </>
          ) : (
            <div><strong>No one in this ring yet</strong></div>
          )}
        </div>

        <div className="tour-controls">
          <button onClick={() => go(-1)} aria-label="Previous site">&larr;</button>
          <button onClick={() => go(1)} aria-label="Next site">&rarr;</button>
          {m && <a className="btn" href={`/go?id=${m.id}`} target="_blank" rel="noopener">Open site</a>}
        </div>
      </header>

      <div className="tour-view">
        {m && status === true && (
          <>
            {!loaded && <p className="tour-msg">Loading {m.name.split(" ")[0]}&apos;s site</p>}
            <iframe
              key={m.id}
              src={m.website}
              title={`${m.name}'s website`}
              onLoad={() => setLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </>
        )}
        {m && status === false && (
          <div className="tour-blocked">
            <strong>{m.name}&apos;s site can&apos;t be shown inside the tour.</strong>
            <p>Their site blocks being embedded. Open it in a new tab, or keep going.</p>
            <div>
              <a className="btn" href={`/go?id=${m.id}`} target="_blank" rel="noopener">Open site</a>
              <button className="btn ghost" onClick={() => go(1)}>Next site</button>
            </div>
          </div>
        )}
        {m && status === undefined && <p className="tour-msg">Checking {m.name.split(" ")[0]}&apos;s site</p>}
      </div>
    </div>
  );
}
