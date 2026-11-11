import Directory from "@/components/Directory";
import SiteNav from "@/components/SiteNav";
import { EmbedSnippet } from "@/components/WidgetPreview";
import { members } from "@/data/members";
import { LOGO_ASCII } from "@/data/logo-ascii";
import { SITE_URL } from "@/lib";

const REPO = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/YOUR-USERNAME/mcmaster.network";

export default function Home() {
  return (
    <>
      <SiteNav />
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-lead">
            <h1>
              <span>McMaster</span>
              <span>.network</span>
            </h1>
            <p>
              Personal websites by McMaster students, joined into one ring. Every visit heats a site up, so you can
              see what people are actually checking out.
            </p>
            <section className="join" id="join" aria-labelledby="join-h">
              <h2 id="join-h">Join the ring</h2>
              <p>Any McMaster student or recent grad with a personal website.</p>
            <ol className="steps">
              <li>
                <strong>Add yourself.</strong> Fork <a href={REPO}>the repo</a> and add your entry to the bottom
                of <code>src/data/members.ts</code>: your name, site, and <code>faculty</code>. Optional:{" "}
                <code>description</code> (one line, like SWE @ Magic Hour AI), <code>program</code>,{" "}
                <code>photo</code>, <code>github</code>, <code>linkedin</code>, <code>twitter</code>, and{" "}
                <code>instagram</code>.
              </li>
              <li>
                <strong>Open a pull request.</strong> An automatic check makes sure your entry is valid, then it
                gets merged.
              </li>
              <li>
                <strong>Add the widget to your site.</strong> The arrows send visitors to the next person in the
                ring, and the caption shows their name.
              </li>
            </ol>
            </section>
            <EmbedSnippet siteUrl={SITE_URL} />
          </div>
          <div className="hero-side">
            <pre className="logo-ascii" aria-hidden="true">
            {LOGO_ASCII.map((row, y) => (
              <span key={y}>
                {[...row].map((ch, x) =>
                  ch === " " ? (
                    " "
                  ) : (
                    <span key={x} className={ch === "#" ? "m" : ch === "+" ? "g" : "k"}>
                      {ch}
                    </span>
                  ),
                )}
                {y < LOGO_ASCII.length - 1 ? "\n" : null}
              </span>
            ))}
            </pre>
          </div>
        </div>
      </header>

      <main>
        <Directory members={members} />
      </main>

      <footer>
        <p>Built in Hamilton by McMaster students. Not affiliated with the university.</p>
        <a href={REPO}>Source on GitHub</a>
      </footer>
    </>
  );
}
