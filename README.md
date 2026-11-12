# McMaster Webring

A webring for McMaster students with personal websites. Not affiliated with the university.

You need three things:

- a [GitHub](https://github.com) account (free)
- to be a McMaster student or a recent grad
- a personal website, with the full address, like `https://yoursite.com`

You add yourself at the bottom of the list. After your pull request is merged, your card shows up after the last person, and the arrows on everyone's site point to you.

The live site is [https://www.mcmasterwebring.com](https://www.mcmasterwebring.com).

## 1. Fork the repo

A fork is your own copy of this project. You edit the copy. You do not need to install anything.

1. Open [github.com/007Aurick/McMaster-Webring](https://github.com/007Aurick/McMaster-Webring).
2. Sign in.
3. Click the **Fork** button at the top right.
4. Leave the name as it is and click **Create fork**.

GitHub opens your copy. The address looks like `https://github.com/YOUR-USERNAME/McMaster-Webring`.

## 2. Add yourself to the list

1. In your fork, click through the folders: `src`, then `data`, then `members.ts`.
2. Click the pencil icon at the top right of the file. That is **Edit this file**.
3. Scroll to the bottom of the list. You will see a comment that says `ADD YOUR ENTRY BELOW THIS LINE`.
4. Paste your entry under that comment and above the `];` line.
5. The person above you already ends with `},`. Leave that comma there. Your entry needs its own comma too.

Copy this and replace the example values with yours:

```ts
{
  id: "your-name",
  name: "Your Name",
  website: "https://yoursite.com",
  faculty: "engineering",
  program: "Engineering Physics",
  description: "SWE @ Magic Hour AI",
  github: "https://github.com/you",
  instagram: "https://www.instagram.com/you/",
  linkedin: "https://www.linkedin.com/in/you/",
  twitter: "https://x.com/you",
},
```

What each line means:

| Field | Required | What to put |
| --- | --- | --- |
| `id` | yes | A short name with lowercase letters, numbers, and dashes only. `jane-doe` is good. `Jane Doe` is not. This is also the name you put in the widget later. Nobody else can have the same one. |
| `name` | yes | Your name, the way you want it on the card. |
| `website` | yes | Your site, starting with `https://`. This is where the arrows send people. |
| `faculty` | yes | Exactly one of these words: `engineering`, `health-sciences`, `science`, `business`, `humanities`, `social-sciences`. |
| `program` | no | Your program, in your own words. `Engineering Physics` is fine. `iBioMed and Engineering Physics` shows up when someone filters either program. |
| `description` | no | One short line under your name, 80 characters max. Example: `SWE @ Magic Hour AI`. |
| `github` | no | Full link, starting with `https://`. |
| `instagram` | no | Full link, starting with `https://`. |
| `linkedin` | no | Full link, starting with `https://`. |
| `twitter` | no | Full link, starting with `https://`. An X profile link is fine. |

Delete any link line you do not have. An empty link, or a link that is only a username, will fail the check. Only the links you include show on your card.

Do not change anyone else's entry. Do not edit any other file. The automatic check rejects a pull request that touches anything besides `src/data/members.ts`.

## 3. Save it as a pull request

A pull request asks for your entry to be added to the real list.

1. Scroll to the bottom of the edit page.
2. In **Commit changes**, the box can say `Add your-name to the webring`.
3. Choose **Create a new branch** and leave the branch name GitHub suggests.
4. Click **Propose changes**. If you only see **Commit changes**, click that, then continue.
5. GitHub shows a page titled **Comparing changes**. Click **Create pull request**.
6. Click **Create pull request** again.

A green check means the entry is valid. A red X means something in the entry is wrong. Open the check, read the error, edit `members.ts` on your branch, and the check runs again.

When it is merged, you are on the ring. You do not have to update the widget again. The arrows start sending people to your site.

## 4. Put the arrows on your website

Paste this where you want the arrows to appear. Change `your-name` to the same `id` you used above.

```html
<script src="https://www.mcmasterwebring.com/embed.js" data-user="your-name"></script>
```

The left arrow goes to the person before you. The fireball in the middle opens the webring. The right arrow goes to the person after you. The caption says who is next.

If your site is plain HTML, paste the script into the page. If your site is React, Next, or something similar, put that script in the HTML of the page, or in a component that renders it as a real script tag. `data-user` has to match your `id` exactly, including the dashes.

Optional bits you can add to the script tag:

| Attribute | What it does | Default |
| --- | --- | --- |
| `data-color` | Any CSS colour for the arrows | `#ad1229` |
| `data-size` | Size of the fireball, in pixels | `32` |
| `data-caption` | Set this to `off` to hide the "Next:" line | shown |

Example with a bigger fireball and no caption:

```html
<script src="https://www.mcmasterwebring.com/embed.js" data-user="your-name" data-size="48" data-caption="off"></script>
```
