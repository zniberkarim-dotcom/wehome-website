# WeHome — Design System & Brand Bible (codebase reconciliation)

> Source of truth: **WeHome Design System & Brand Bible V1.0** ("Architecture of Silence").
> This file maps the Bible to how *this* codebase (React + Vite + Tailwind v4) expresses
> tokens, and records what is **resolved** vs still **open**. Keep it updated each pass.

Philosophy: **Clarity over decoration · Proof over promise · Fluid tactile realism.**
80 / 15 / 5 rule — 80% background space, 15% text, **5% Crimson Atlas** for key actions only.

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
⚠️ Open: Hero H1 currently renders **72px desktop / 48px mobile** (Bible: 56/38) and all
headings inherit `tracking-tight` (−0.025em) from `@layer base`, vs the Bible's −0.02em (H1),
−0.01em (H2), 0 (H3). Serif faces generally want looser tracking than geometric sans — worth
a dedicated typographic pass.

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
| No shadow at rest; hover 4px lift + `rgba(18,19,20,0.04)` | ⚠️ open — still `shadow-sm` → `hover:shadow-2xl` |
| Hover image scale 1.03 | ⚠️ open — not implemented |
| Key facts on one line separated by thin dashes | ⚠️ open — currently a 4-up divided stat grid |

Verified after the pass-2 change on every consumer: **`/` (FeaturedProperties)**,
**`/biens`**, **`/favoris`**, **`/agents/:slug`** — radius 8px, ratio exactly 1.333, no
content overflow, grids unaffected, desktop + 375px mobile.

---

## Open decisions / backlog (next passes)

1. **`HowItWorks` uses `bg-white`** as a full section background — now renders as a pure-white
   band against Terrazzo Cream, which the Bible explicitly warns against ("never pure #FFFFFF").
   On-Bible fix is to drop the band (match the page) or tint it Zellige Sand — but that changes
   section *banding*, i.e. page composition, so it needs sign-off.
2. **`--card` / `--popover` are pure `#FFFFFF`** and `--muted` is a cool grey (`220 14% 96%`) —
   both read slightly cold against the warm cream. Candidate for a warm-surface pass.
3. **Type scale + tracking** — see §3.
4. **PropertyCard remaining Bible specs** — see §8.
5. **Loading skeleton on `/biens`** (`src/pages/biens.tsx`, `aspect-[4/5]`) still mirrors the
   old card ratio → causes a small reflow when real cards (4:3) replace it. One-line fix, held
   back because it edits another page's layout.
6. **Pre-existing 4px mobile horizontal overflow** — sections below the fold rest at their
   `initial={{ x: ±20 }}` reveal offset, pushing `scrollWidth` to 379 on a 375px viewport.
   Predates this work (verified against `c6c5759`); fix by animating `opacity`+`transform`
   with `overflow-x-clip` on the section wrapper.
7. **Buttons** — Bible wants 6px radius, flat crimson fill, 5% darken on hover.
