# McMaster Webring

A webring for McMaster students with personal websites. Not affiliated with the university.

You need to be a McMaster student or recent grad, with a personal website. Add yourself at the bottom of the list. That puts you after the last person on the cards, in the tour, and in the arrows.

## 1. Add your entry

Fork [the repo](https://github.com/007Aurick/McMaster-Webring) and add this to the bottom of `src/data/members.ts`.

```ts
{
  id: "your-name",                 // lowercase-with-hyphens, unique
  name: "Your Name",
  website: "https://yoursite.com",
  faculty: "engineering",          // engineering, health-sciences, science, business, humanities, social-sciences
  program: "Engineering Physics",  // optional. "iBioMed and Engineering Physics" matches both filters.
  description: "SWE @ Magic Hour AI", // optional, one line, 80 characters max
  photo: "/photos/your-name.jpg",  // optional
  github: "https://github.com/you",
  instagram: "https://www.instagram.com/you/",
  linkedin: "https://www.linkedin.com/in/you/",
  twitter: "https://x.com/you",
}
```

Leave off any link you do not have. Only the ones you include show on your card.

A photo is optional. Put a `.jpg`, `.png`, or `.webp` at `public/photos/your-name.jpg`. The filename has to match `photo`.

Open a pull request. The check only passes if the pull request touches `src/data/members.ts` and `public/photos/`. Once it is merged, you are on the ring.

## 2. Add the widget to your site

```html
<script src="https://your-domain/embed.js" data-user="your-name"></script>
```

`data-user` is the `id` from your entry. The arrows go to the previous and next person. The caption says who is next.

| Attribute      | What it does                    | Default   |
| -------------- | ------------------------------- | --------- |
| `data-color`   | any CSS colour                  | `#ad1229` |
| `data-size`    | logo size in px                 | `32`      |
| `data-caption` | `off` hides the "Next:" line    | shown     |
