# mcmaster.network

A webring for McMaster students with personal websites. Built in Hamilton.

- **The ring.** Every member's site links to the next. Click the arrows and you tour what Mac students are building.
- **Faculty rings.** Each faculty has its own ring inside the big one. Your widget can loop through all of Mac or just your faculty.
- **Heat.** Every visit through the ring is counted. Sites people actually check out glow hotter on the homepage, and the top five show up in "Hottest this week".
- **Now building.** Every member writes one line about what they're working on. It shows on the ring, in the list, in the tour, and in other members' widgets ("Next: Priya, building a Discord bot").
- **Tour mode.** `/tour` flips through everyone's site one after another. Arrow keys move, space pauses.

---

## Join the ring

**Requirements:** McMaster student (or recent grad) + a personal website.

### 1. Add yourself to `src/data/members.ts`

Add your entry at the **bottom** of the list. The order of the list is the order of the ring.

```ts
{
  id: "your-name",
  name: "Your Name",
  website: "https://yoursite.com",
  faculty: "engineering",            // engineering, health-sciences, science, business, humanities, social-sciences
  building: "a robot that folds laundry", // optional, one line, 80 characters max
  description: "SWE @ Magic Hour AI", // optional, one line on the card, 80 characters max
  program: "Software Engineering",   // optional
  year: "2029",                      // optional, grad year
  tags: ["software", "robotics"],    // optional, see TAG_OPTIONS
  photo: "/photos/your-name.jpg",    // optional
  github: "https://github.com/you",  // optional: github, linkedin, twitter, instagram
  friends: ["aurick-anwar"],         // optional: lights up when someone hovers you
},
```

Keep `building` current. It's the first thing people see about you.

### 2. (Optional) Add a photo

A square `.jpg`, `.png` or `.webp`, around 400×400, at `public/photos/your-name.jpg`.

### 3. Check it and open a PR

```bash
npm install
npm run validate
```

A GitHub Action runs the same check on every pull request.

---

## Add the widget to your site

```html
<script src="https://mcmaster.network/embed.js" data-user="your-name"></script>
```

← and → go to your neighbours in the ring. The logo links here. Next to it, a caption shows who's next and what they're building.

| Attribute      | Values                                  | Default |
| -------------- | --------------------------------------- | ------- |
| `data-ring`    | `mac` (everyone), `faculty` (your faculty only) | `mac`   |
| `data-color`   | any CSS colour                          | `#ad1229` |
| `data-size`    | logo size in px                         | `32`    |
| `data-caption` | `off` hides the "Next: ..." caption     | shown   |

**No JavaScript?** Plain links work too:

```html
<a href="https://mcmaster.network/go?from=your-name&to=prev">←</a>
<a href="https://mcmaster.network">mcmaster.network</a>
<a href="https://mcmaster.network/go?from=your-name&to=next">→</a>
```

Add `&ring=faculty` to stay in your faculty, or use `to=random`.

**Share a tour that starts on your site:** `https://mcmaster.network/tour?start=your-name`

---

## API

- `GET /api/webring`: all members in ring order, with faculty and what they're building
- `GET /api/webring?user=<id>`: that member's `prev` and `next`
- `GET /api/webring?user=<id>&ring=faculty`: the same, within their faculty

CORS is open, so you can build your own widget.

---

## Running it yourself

```bash
npm install
npm run dev        # http://localhost:3000
```

Deploy on Vercel and set these environment variables:

| Variable | What it's for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your domain, e.g. `https://mcmaster.network`. The widget links here. |
| `NEXT_PUBLIC_REPO_URL` | The GitHub repo link on the homepage. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Turns on heat. Add Upstash Redis from the Vercel Marketplace (free tier is enough) and these get set for you. `KV_REST_API_URL` / `KV_REST_API_TOKEN` also work. |
| `HEAT_SALT` | Any long random string. Visitor IPs are hashed with it and never stored raw. |

Without Upstash everything still works; heat just stays off.

**How heat counts:** a visit is a hop through `/go` (widget arrows, homepage links) or 5 seconds on screen in the tour. Each hashed IP can heat a given site at most once an hour, and bots are ignored, so refreshing your own link doesn't do anything. A site's temperature is this week's visits plus half of last week's.

**Changing the crest:** `py scripts/make-ascii.py path/to/crest.png` rewrites the ASCII behind the hero. Pass a column count like `90` for a finer picture.

---

## Maintainer checklist

- Turn on 2FA for GitHub, Vercel and Upstash. `embed.js` runs on every member's site, so whoever controls this repo or the Vercel project can run code on all of them.
- Protect `main`: require a PR and the "validate members" check to pass before merging.
- Join PRs should only touch `src/data/members.ts` and `public/photos/`. CI fails any PR that changes other files, so review those by hand.
- Click new members' websites before merging, and every so often check for dead or expired domains.
- Upstash and `HEAT_SALT` are secrets: set them in Vercel only, never with a `NEXT_PUBLIC_` prefix, never committed.

---

Not affiliated with McMaster University. Inspired by [uwaterloo.network](https://github.com/Shayaan-Azeem/waterloo.network).
