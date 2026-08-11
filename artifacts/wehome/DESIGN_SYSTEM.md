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
- ✅ **CTAs = `rounded-[6px]`** (Bible §7) — pass 6. Five homepage CTAs: `CtaSection` ×2,
  `FeaturedProperties`, `PropertyCard`, Hero search submit.
- ✅ **Hero form inputs = `rounded-[6px]`** — pass 8. All 7 (city text input, type select,
  price-range select, budget min/max, surface min/max); measured live at exactly `6px` each.
  Radius only — fill, 1px border and the pass-4/5 focus treatment are untouched.
- ⚠️ Open: global `--radius` still 16px (cards/panels deliberately stay 16–24px), and the
  `rounded-full` CTA question — see backlog 8.

**Verification note (pass 8):** changing input radius did **not** change the CSS bundle hash,
because the `rounded-[6px]` utility already shipped in pass 6a and `rounded-xl`/`2xl` are still
used elsewhere. When a change only re-points existing utilities, **the JS bundle hash is the
discriminator** — check that, not the CSS.

## 6. Motion — RESOLVED (pass 1)

- One curve site-wide: **`[0.22, 1, 0.36, 1]`** (quintic-out), imperceptibly close to the
  Bible's `cubic-bezier(0.16, 1, 0.3, 1)`. Reveals/hovers 250–350ms, never >400ms.

## 7. Shadows — RESOLVED for the homepage (passes 1, 5, 10)

- No coloured glow shadows. Rest = hairline border; hover = neutral `shadow-black/5–10`.
- ✅ **The two stragglers are fixed (pass 10).** `Hero.tsx:694` (`shadow-lg shadow-primary/25
  hover:shadow-xl hover:shadow-primary/40`) and `Navbar.tsx:132` (`shadow-primary/20 → /30`)
  both became `shadow-md shadow-black/5 hover:shadow-lg`. Measured on the rendered element:
  the shadow resolves to `oklab(0 0 0 / 0.05)` — pure black at 5% alpha, zero chroma.
  **Scope is now verifiably clean: zero `shadow-primary` occurrences in `components/home/`
  + `Navbar.tsx`.**
- ⚠️ Out of scope, still glowing: **20+ `shadow-primary/*` across 16 files** in `src/pages`,
  `dashboard` and `espace-agent` — incl. `agents/index.tsx:290`, `financement.tsx` ×4,
  `publier.tsx` ×2, `DashboardLayout.tsx:101`, `MortgageCalculator.tsx:130`. Bible §9 treats
  those contexts separately. Note these are why a bare `shadow-primary/25` grep still hits the
  production bundle — bundle-level greps cannot prove homepage scope, only source greps can.

### Primary CTA hover — one treatment, four instances (pass 10)

Pass 10 also added `hover:bg-primary-hover` to both CTAs, and this was **not optional**.
Measured first: neither had a hover-darken, so apart from `-translate-y-0.5` the coloured
shadow ramp *was* their whole hover response. Stripping the glow alone would have removed the
affordance — a regression wearing a refinement's clothes.

All four homepage primary CTAs now read identically —
`CtaSection:31`, `Hero:404`, `Hero:694`, `Navbar:132`:

```
bg-primary hover:bg-primary-hover … shadow-md shadow-black/5 hover:shadow-lg
```

| State | Token | Resolves to |
|---|---|---|
| rest | `--primary` `343.3 64.3% 22.0%` | `rgb(92, 20, 40)` `#5C1428` |
| hover | `--primary-hover` `343.3 64.3% 20.9%` | `rgb(88, 19, 38)` `#581326` |

**5.0% relative lightness darken — exactly the Bible spec.** Emitted rule verified in the built
CSS: `.hover\:bg-primary-hover:hover{background-color:hsl(var(--primary-hover))}`.

**Grep trap, cost me two false alarms:** searching built CSS for this selector needs the right
escaping — `hover\:` is *two* characters. `grep -c 'hover\\:bg-primary-hover'` and a
`/hover.bg-primary-hover/` regex both returned zero and looked like the utility wasn't
generating. It was. Search the bare fragment `bg-primary-hover` and walk to the brace instead.

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
| Key facts on one line separated by thin dashes | ✅ **resolved** (pass 6) — `3 Ch. · 2 Sal. · 2 SdB · 240 m²` on one baseline-aligned line. **All four items kept**: the Bible's objection was the boxy `divide-x` grid, not the item count, and `salons` is real local signal tied to a live `/biens` `salons[]` filter. Band height 74px → 54px, uniform across all cards. Logic untouched — the `Pces.` fallback (beds *and* salons absent) and the Terrain surface-only bypass are byte-identical and were regression-tested across 9 cases |

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
2. ~~**`--card` / `--popover` pure `#FFFFFF`, `--muted` cool grey**~~ ✅ **investigated and
   closed (pass 6) — no change, and none warranted.** The audit called these "cold against the
   warm cream"; measured on the rendered homepage, that claim does not hold up:
   - **`--card` is neutral, not cool.** White vs Terrazzo Cream is **ΔE2000 2.36**, and the b\*
     axis runs 2.15 → **0.00** — it stops at neutral rather than crossing into blue. There is no
     cool cast to point at. All **8** homepage instances (3 PropertyCard, 3 Services, PepiteDuMois,
     CtaSection) carry a 1px Zellige Sand border, and that border is **ΔE 7.24** from cream and
     **ΔE 9.54** from white — 3–4× stronger than the difference it separates. So no white/cream
     shared edge exists anywhere on the homepage; the small delta is always mediated. A card
     reading as a slightly brighter plane is what a card is *for*.
   - **`--muted` genuinely is cool** (`#F3F4F6` = stock Tailwind gray-100; b\* crosses to
     **−1.08**, ΔE 3.29) — but all 3 homepage uses are unreachable at rest: `BeforeAfter` frame
     (fully covered — a 1064×598 image content-box inside the 1066×600 border box), a
     `hover:bg-muted` tab state, and a `Pill` that only renders in the Hero "Vendre" panel.
   - Cross-context risk confirms leaving them alone: `bg-muted` has **162 uses / 40 files**
     (13 shadcn primitives, 13 agent-dashboard), `bg-popover` **12 / 9** (all 9 primitives),
     `bg-card` **49 / 25**. Bible §9 treats public site and dashboard differently, so a shared-token
     edit is wrong for one context even where right for the other.
   - **If a warm homepage surface is ever wanted, it needs a new token, not an edit to `--card`** —
     homepage cards *are* `bg-card` (PropertyCard does not override it).
3. ~~**Type scale + tracking**~~ ✅ resolved (pass 4) — see §3.
4. ~~**PropertyCard remaining Bible specs**~~ ✅ **all resolved** — see §8. Every row in that
   table is now done (radius, ratio, rest-shadow, hover scale, heart stroke, key-facts line).
7. **Hardcoded `#8B1A2E` is not Crimson Atlas** (`#5C1428`) — found while removing the stat-grid
   icons. ✅ **Navbar resolved (pass 8)** — `Navbar.tsx:170` / `:358` (the agent-initials avatar
   fallback) now use `bg-primary`; verified that `bg-primary` computes to `rgb(92, 20, 40)` =
   `#5C1428`. Approved as a narrow exception because Navbar is the site header on every route.
   ⚠️ Still hardcoded, **not** touched — `DashboardLayout.tsx:75` and `PortalLayout.tsx:160`
   (agent dashboard / portal, which Bible §9 treats separately). `HowItWorks.tsx` ×3 and
   `a-propos.tsx` use it only as a `var(--primary, …)` fallback, so those are inert.
   *Scope caveat:* both Navbar sites are the initials fallback, which renders only for a
   logged-in agent with no `photo_url` — so this was a latent stale-brand bug, not something an
   anonymous homepage visitor was seeing.
8. **`rounded-full` CTAs vs chips** ⚠️ open, awaiting a call. Census of pill-shaped elements
   across homepage + layout separates cleanly into three kinds:
   - **Genuine CTAs** (static className, `font-bold`/`semibold`, `py-2.5`–`py-3.5`, wrapped in
     `<Link href>`, hover-lift + shadow): `BeforeAfter.tsx:261` (`/services-pro`, solid),
     `BeforeAfter.tsx:268` (`/publier`, outlined), `Hero.tsx:694` (`/publier`, solid) — **plus
     `Navbar.tsx:132`** (`/publier`, solid), the site-header CTA on every route.
   - **Chips / segmented controls** (template-literal className with an active/inactive branch,
     `text-sm`, `py-2`–`py-2.5`, `border`): `Hero.tsx:311` (Acheter/Louer/Vendre tabs),
     `Hero.tsx:628`, `BeforeAfter.tsx:166`, `Ecosystem.tsx:237` / `:248`. These match Bible §7B
     ("discrete tabs, neutral background, not big coloured buttons") — pill is likely *correct* here.
   - **Badge**, non-interactive: `Hero.tsx:663`.

   ✅ **Resolved (pass 9)** — all 4 CTAs converted to `rounded-[6px]`, Navbar included on the
   same narrow-exception logic as the colour fix (diff is 4 lines, radius only). Every chip,
   segmented control and badge verified still `rounded-full` — measured live, 12 chips all at
   the `rounded-full` computed value while all 4 CTAs measured exactly `6px`.

   **Shape is now a semantic signal: `6px` = "this navigates or submits"; `rounded-full` =
   "interactive but not a CTA" (chip / selector) or a badge.** 16 CTAs across passes 6–9
   (5 + 7 inputs + 4) now share one radius.

   ⚠️ Out of scope, still pills: 9 CTAs on other pages — `financement` ×3, `publier` ×2,
   `contact` ×2, `weoffice`, `biens`. Worth a pass if site-wide consistency is ever wanted.
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
