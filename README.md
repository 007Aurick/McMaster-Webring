# mcmaster.network

A webring for McMaster students with personal websites. Built in Hamilton.

One list, one ring. The order of `src/data/members.ts` is the order of the cards, the tour, and the arrows. Add yourself at the bottom and you come after the last person. The last person wraps back to the first.

On the site, each person is a card: photo, name, program, a one-line description, and whichever of GitHub, Instagram, LinkedIn, and X they added. Clicking the photo or the name opens their site. Search is by name. Filter is by program, and someone in two programs shows up under either one.

Not affiliated with McMaster University.

---

## Join the ring

You need to be a McMaster student or recent grad, with a personal website.

### 1. Add yourself to `src/data/members.ts`

Fork [the repo](https://github.com/007Aurick/McMaster-Webring) and add your entry at the **bottom** of the `members` array.

```ts
{
  id: "your-name",                 // lowercase-with-hyphens, unique
  name: "Your Name",
  website: "https://yoursite.com",
  faculty: "engineering",          // engineering, health-sciences, science, business, humanities, social-sciences
  program: "Engineering Physics",  // optional. Write it yourself. "iBioMed and Engineering Physics" matches both filters.
  description: "SWE @ Magic Hour AI", // optional, one line, 80 characters max
  photo: "/photos/your-name.jpg",  // optional
  github: "https://github.com/you",
  instagram: "https://www.instagram.com/you/",
  linkedin: "https://www.linkedin.com/in/you/",
  twitter: "https://x.com/you",
}
```

Leave off any link you do not have. Only the ones you include show up.

### 2. Add a photo

Optional. A `.jpg`, `.png`, or `.webp` at `public/photos/your-name.jpg`. The filename has to match `photo` exactly.

### 3. Open a pull request

```bash
npm install
npm run validate
```

A GitHub Action runs the same check. After it is merged, you show up after the person who was last, on the board and in the tour.

### 4. Add the widget to your site

```html
<script src="https://mcmaster.network/embed.js" data-user="your-name"></script>
```

`data-user` is your `id`. The arrows send visitors to the previous and next person. The caption says `Next: Their Name`. If you are the only member, both arrows come back to you and the caption stays hidden.

| Attribute      | Values                         | Default   |
| -------------- | ------------------------------ | --------- |
| `data-color`   | any CSS colour                 | `#ad1229` |
| `data-size`    | logo size in px                | `32`      |
| `data-caption` | `off` hides the "Next:" line   | shown     |

No JavaScript? Plain links work too:

```html
<a href="https://mcmaster.network/go?from=your-name&to=prev">←</a>
<a href="https://mcmaster.network">mcmaster.network</a>
<a href="https://mcmaster.network/go?from=your-name&to=next">→</a>
```

A tour that starts on you: `https://mcmaster.network/tour?start=your-name`. Left and right arrows move through the ring.

---

## API

- `GET /api/webring` returns every member, in ring order.
- `GET /api/webring?user=<id>` returns that member's `prev` and `next`.

CORS is open.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

Deploy on Vercel and set:

| Variable | What it's for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The public URL, `https://mcmaster.network`. The widget links here. |
| `NEXT_PUBLIC_REPO_URL` | The GitHub repo linked from the homepage. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Turns on visit counts. Optional. `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work. |
| `HEAT_SALT` | Any long random string. Visitor IPs are hashed with it and never stored raw. |

Without Upstash the ring still works. Visit counts stay off.

A visit is a hop through `/go` (the widget arrows, or a click on a card's photo or name) or 5 seconds on screen in the tour. Each hashed IP can count for a given site at most once an hour, and bots are ignored.

**Changing the crest:** `py scripts/make-ascii.py path/to/crest.png` rewrites the ASCII in the hero. Pass a column count like `90` for a finer picture.

---

## Maintainer checklist

- Turn on 2FA for GitHub and Vercel. `embed.js` runs on every member's site, so whoever controls this repo or the deploy can run code on all of them.
- Protect `main`: require a pull request and the "validate members" check before merging.
- Join PRs should only touch `src/data/members.ts` and `public/photos/`. CI fails a PR that changes other files, so review those by hand.
- Open a new member's website before merging.
- `UPSTASH_REDIS_REST_TOKEN` and `HEAT_SALT` stay in Vercel only. Never commit them, and never give them a `NEXT_PUBLIC_` prefix.

Inspired by [uwaterloo.network](https://github.com/Shayaan-Azeem/waterloo.network).
