# WeHome — Design System & Brand Bible (codebase reconciliation)

> Source of truth: **WeHome Design System & Brand Bible V1.0** ("Architecture of Silence").
> This file maps the Bible to how *this* codebase (React + Vite + Tailwind v4) expresses
> tokens, and records what is **resolved** vs still **open**. Keep it updated each pass.

Philosophy: **Clarity over decoration · Proof over promise · Fluid tactile realism.**
80 / 15 / 5 rule — 80% background space, 15% text, **5% Crimson Atlas** for key actions only.

---

## ⚠️ Standing rules — shipping (read before any commit)

**1. `package.json` and `pnpm-lock.yaml` ship together, always.**
Vercel installs with `--frozen-lockfile`. Any commit that touches a `package.json`
(adding/removing/bumping a dependency *or a script*) **must** include the regenerated
root `pnpm-lock.yaml` in the *same* commit. Before pushing such a commit, run from the
repo root and confirm it exits 0:

```
pnpm install --frozen-lockfile
```

This is the exact command Vercel runs. `pnpm run build` passing locally proves **nothing**
about this — a non-frozen local install tolerates drift, and `vite build` never touches
eslint. Commit `a3466d8` added 5 eslint devDependencies without the lockfile; every deploy
from that commit onward failed at the install step with `ERR_PNPM_OUTDATED_LOCKFILE`,
and four subsequent passes were reported as "live" when none of them had deployed.

**2. Nothing is "live" without a confirmed Vercel deployment status.**
A green local build is not a deploy. When a build fails, Vercel keeps serving the previous
successful deployment **silently** — the site looks fine and nothing surfaces the failure.
Before reporting a change as shipped, confirm one of:
- Vercel dashboard → project → Deployments → the commit SHA shows **Ready** (not Failed/Error), or
- `vercel ls` / `vercel inspect <url> --logs` if the CLI is authenticated, or
- fetch production and assert on a value the change actually introduced
  (e.g. after the pass-2 font swap, production `index.html` must contain `Playfair+Display`
  and must *not* contain `Outfit`).

If production cannot be reached from the working environment, say so and hand the check to
the user — do not infer "live" from a local build.

---

## 1. Where tokens live

- Tailwind v4 theme: `src/index.css` → `@theme inline { … }` (maps `--color-*` → HSL vars).
- Palette + radius: `src/index.css` → `:root { … }` (light) and `.dark { … }`.
- Fonts: Google Fonts `@import` at top of `src/index.css` **and** a `<link>` in `index.html`
  (both must be kept in sync — the HTML link is what preloads on first paint).

## 2. Colour — RESOLVED (pass 2)

All values are the **exact** HSL equivalent of the Bible hex, verified by round-trip
conversion (hex → HSL → hex reproduces the original byte-for-byte).

| Bible token | Hex | CSS var | Value (`H S% L%`) | Status |
|---|---|---|---|---|
| Crimson Atlas | `#5C1428` | `--primary`, `--ring` | `343.3 64.3% 22%` | ✅ **resolved** |
| Terrazzo Cream | `#FBF9F5` | `--background` | `40 42.9% 97.3%` | ✅ **resolved** |
| Taza Stone | `#121314` | `--foreground` (+ `--card-foreground`, `--popover-foreground`, `--secondary-foreground`) | `210 5.3% 7.5%` | ✅ **resolved** |
| Zellige Sand | `#EAE3D2` | `--border`, `--input` | `42.5 36.4% 87.1%` | ✅ **resolved** |
| Cedar Smoke | `#565553` * | `--muted-foreground` | `40 1.8% 33.1%` | ✅ **resolved** (see note) |
| Kasbah Ochre | `#C28E48` | `--accent` | *currently* `38 60% 50%` | ⚠️ open — near-match, not in pass-2 scope |

\* **Contrast note.** The Bible's literal Cedar Smoke `#6E6D6B` on Terrazzo Cream measures
**4.92:1** — that clears WCAG **AA** (4.5:1) but *not* the **AAA** (7:1) the Bible claims.
Per sign-off ("nudge darker rather than abandoning the mineral tone") it was darkened
`L 42.5% → 33.1%` to `#565553` = **7.08:1 (AAA)**, preserving hue 40° and the ~2%
desaturated mineral character. Revert to `40 1.4% 42.5%` if the darker grey reads too heavy.

Verified contrast on Terrazzo Cream: primary text **17.69:1** · crimson **12.59:1** ·
secondary text **7.08:1** — all AAA.

No saturated alert colours: success = soft olive, warning = sienna/terracotta (not yet tokenised — TODO).

## 3. Typography — RESOLVED (pass 2)

| Role | Bible | Codebase | Status |
|---|---|---|---|
| Display / headings | **Serif** (Canela / GT Super → Playfair fallback) | **`Playfair Display`** via `--font-display` | ✅ **resolved** |
| Interface / body / data | Inter / SF Pro → system | `DM Sans` via `--font-sans` | ✅ unchanged by design |

`--font-display: "Playfair Display", "Noto Sans SC", Georgia, serif` — applied globally to
`h1–h6` through `@layer base`. Body, labels and all financial/numeric data stay DM Sans.

Type scale (Bible): H1 56/38 · H2 40/28 · H3 24/20 · Body-lg 18/16 · Body 15/14 · Caption 12/11 UPPERCASE +0.05em.

✅ **Resolved (pass 4).** Hero H1 is now `text-[38px] md:text-[46px] lg:text-[56px]` and the
blanket `tracking-tight` was replaced with per-level tracking in `@layer base`:

| | size (desktop/mobile) | tracking |
|---|---|---|
| H1 | 56 / 38px | −0.02em |
| H2 | inherited scale | −0.01em |
| H3–H6 | inherited scale | 0 |

Evidence for keeping the Bible's 56px rather than the previous 72px:
- **Playfair does not run small.** Measured cap-height 71/100em and x-height 52/100em vs
  DM Sans 70 / 50 — i.e. optically the same size or marginally larger. The usual reason to
  upsize a serif does not apply here, so 56px delivers a true 56px presence.
- **72px was overflowing.** In the default locale (FR) the longest line measured 751px at
  −0.02em inside a 672px container (**111.7%**), and ~743px even at the old cramped −0.025em.
  It only appeared to fit because the tight tracking was compensating for the oversize.
- At 56px / −0.02em the same line is 584px = **86.9% fill** (EN 78.6%) — a well-set measure
  with real optical margin.

## 4. Spacing & rhythm — RESOLVED (pass 1)

- Base unit **8px**. Container `max-w-7xl` (1280px; Bible target 1360px — acceptable).
- Vertical rhythm (Bible ≥112–128px desktop): editorial sections `py-24 md:py-32` (**128px**);
  feature-showcase blocks `md:py-28` (**112px**). No section sits below the 112px floor.

## 5. Radius

- Global `--radius: 1rem` (16px). Note Tailwind's `rounded-2xl`/`rounded-3xl` are **not**
  overridden by `@theme`, so they resolve to stock 16px / 24px.
- ✅ **PropertyCard = `rounded-[8px]`** (Bible spec) — pass 2.
- Pass 1 tamed the two outliers (`rounded-[3rem]` / `rounded-[2.5rem]` → `rounded-3xl`).
- ⚠️ Open: buttons are 12–16px vs the Bible's 6px; global `--radius` still 16px.

## 6. Motion — RESOLVED (pass 1)

- One curve site-wide: **`[0.22, 1, 0.36, 1]`** (quintic-out), imperceptibly close to the
  Bible's `cubic-bezier(0.16, 1, 0.3, 1)`. Reveals/hovers 250–350ms, never >400ms.

## 7. Shadows — RESOLVED (pass 1)

- No coloured glow shadows. Rest = hairline border; hover = neutral `shadow-black/5–10`.

## 8. Property Card (Bible §7)

| Spec | Status |
|---|---|
| Border radius 8px | ✅ **resolved** (pass 2) |
| Image ratio 4:3 | ✅ **resolved** (pass 2) |
| Title → Crimson on hover | ✅ already present |
| 1px border at rest | ✅ already present |
| No shadow at rest; hover 4px lift + `rgba(18,19,20,0.04)` | ✅ **resolved** (pass 5) — `shadow-none` at rest (1px Zellige Sand hairline only), hover `0 4px 20px rgba(18,19,20,0.04)`; the 4px lift was already correct |
| Hover image scale 1.03 | ✅ **resolved** (pass 4) — measured 3.00% growth |
| Favourite heart 1.5px stroke | ✅ **resolved** (pass 4) — was 2 / 2.2 |
| Key facts on one line separated by thin dashes | ⚠️ open — currently a 4-up divided stat grid |

## 9. Micro-interactions (Bible §7–8) — pass 4

| Interaction | Bible | Shipped | Verified |
|---|---|---|---|
| Card image hover | scale 1.03 | `group-hover:scale-[1.03]`, 300ms quintic | measured **3.00%** (382.4→393.9px) |
| Card title hover | Stone → Crimson | already present; retimed | 150ms/ease → **300ms quintic** |
| Card wrapper | ≤400ms | was **500ms** (over ceiling) | now **300ms quintic** |
| Search field focus | scale 1.01 + border Crimson @50% | `focus-within:scale-[1.01]`, `focus:border-primary/50` | measured **1.00%** (308.66→311.74px), icon scales with field |
| Primary CTA hover | darken 5%, no gradient | `--primary-hover` = `343.3 64.3% 20.9%` | luminance **0.02929 → 0.02680** (genuinely darker) |
| Ghost CTA hover | left-to-right underline | `after:` pseudo, `origin-left`, `scale-x-0 → 100` | rest `scale: 0 1`, 300ms quintic |

**Why `focus-within` on the wrapper, not `focus` on the input:** each search field has an
absolutely-positioned icon that lives in the wrapper but *outside* the input. Scaling the
input alone would grow the box while leaving its icon behind. Scaling the wrapper moves the
field as one unit — confirmed: icon scale tracks the wrapper at 1.01.

**Primary CTA note:** the previous `hover:bg-primary/90` was an *opacity fade*, which blends
toward the page behind it — on a light background that **lightens** the button, the opposite
of the Bible's "darken 5%". Replaced with a real darkened token.

Verified after the pass-2 change on every consumer: **`/` (FeaturedProperties)**,
**`/biens`**, **`/favoris`**, **`/agents/:slug`** — radius 8px, ratio exactly 1.333, no
content overflow, grids unaffected, desktop + 375px mobile.

---

## Open decisions / backlog (next passes)

1. ~~**`HowItWorks` uses `bg-white`**~~ ✅ **resolved (pass 3)** — now `bg-sand/50`
   (Zellige Sand at 50% over Terrazzo Cream = `#F3EEE4`). Chosen over plain cream because
   its neighbours are cream above (FeaturedProperties) and `bg-secondary/50` below (Services);
   blending would have merged three near-identical fields and collapsed the mid-page structure.
   Full-strength sand (−10.2pt lightness) read as a slab, so it is applied at 50% (−4.9pt) —
   comparable separation to the old white band (+2.7pt), but warm and recessed instead of cool
   and raised. Cost: `muted-foreground` in that section is 6.44:1 (AA) rather than 7.08:1 (AAA).
2. **`--card` / `--popover` are pure `#FFFFFF`** and `--muted` is a cool grey (`220 14% 96%`) —
   both read slightly cold against the warm cream. Candidate for a warm-surface pass.
3. ~~**Type scale + tracking**~~ ✅ resolved (pass 4) — see §3.
4. **PropertyCard remaining Bible specs** — see §8 (rest-shadow and the dash-separated
   key-facts line are still open; hover scale and heart stroke are done).
5. ~~**Loading skeleton on `/biens`**~~ ✅ **resolved (pass 3)** — skeleton now mirrors the card
   exactly: `aspect-[4/3]` and `rounded-[8px]` (the wrapper was still `rounded-3xl`, which would
   have kept a corner-radius pop even after the ratio fix). Verified live across the
   skeleton → real-card transition: identical radius and ratio, no reflow.
6. ~~**Pre-existing 4px mobile horizontal overflow**~~ ✅ **resolved (pass 5)** — the four
   x-axis reveals (FeaturedProperties ×2, PepiteDuMois, WhyChooseUs) now animate on `y`,
   which cannot push layout width and matches the y-based reveal language every other
   section already used. Fixed at the cause, not masked with `overflow-x: hidden` (which
   would risk clipping legitimate content). Verified `scrollWidth 375 === viewport 375`.
   **Reveals on the homepage must stay y-axis or opacity/scale only** — an x-offset on a
   full-width block in a centred container will always reintroduce horizontal overflow.
7. **Buttons** — 5% darken on hover ✅ done (pass 4). Hero search rest state ✅ done (pass 5):
   the glass panel was treated as one unit and moved onto Terrazzo Cream —
   panel `bg-background/85` + cream border, all 7 inputs and 6 filter pills `bg-background/60`,
   focus/hover → `background`. Still open: **6px radius** (homepage CTAs are 12–16px).

8. **Loud shadows** ✅ homepage is clean as of pass 5 — no `shadow-2xl` remains in
   `src/components/home/`. It is still used on 9 other pages (a-propos, agents, estimer,
   financement, services-pro, weoffice, espace-agent, Navbar) — candidates when those pages
   get their own pass.
