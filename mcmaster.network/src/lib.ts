export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mcmaster.network").replace(/\/$/, "");
export const SITE_NAME = "mcmaster.network";

/** The ring mark, coloured with currentColor so it can be themed anywhere. */
export function ringMarkSvg(size = 40): string {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x = (50 + 38 * Math.cos(a)).toFixed(2);
    const y = (50 + 38 * Math.sin(a)).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${i === 0 ? 7 : 4.5}" fill="currentColor"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3" opacity=".45"/>${dots}<path d="M33 64V37l17 17 17-17v27" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
