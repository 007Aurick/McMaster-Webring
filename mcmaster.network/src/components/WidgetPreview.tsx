"use client";

import { useState } from "react";
import { getNeighbours } from "@/data/members";

const COLOR = "#ad1229";

export function RingWidget({ memberId }: { memberId: string | null }) {
  const neighbours = memberId ? getNeighbours(memberId) : null;
  const nextName = neighbours?.next.name ?? "the next site";
  const prevHref = `/go?from=${encodeURIComponent(memberId ?? "")}&to=prev`;
  const nextHref = `/go?from=${encodeURIComponent(memberId ?? "")}&to=next`;

  return (
    <div className="preview-stage" style={{ background: "#ffffff", color: COLOR }}>
      <a className="pv-arrow" href={prevHref} aria-label={neighbours ? `Previous: ${neighbours.prev.name}` : "Previous site"}>
        &larr;
      </a>
      <img src="/flame.png" width={48} height={48} alt="" />
      <a className="pv-arrow" href={nextHref} aria-label={`Next: ${nextName}`}>
        &rarr;
      </a>
      <a className="pv-caption" href={nextHref}>
        <b>Next: {nextName}</b>
      </a>
    </div>
  );
}

export function EmbedSnippet({ siteUrl }: { siteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${siteUrl}/embed.js" data-user="your-id"></script>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; the snippet is still selectable */
    }
  };

  return (
    <div className="snippet">
      <code>{snippet}</code>
      <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}
