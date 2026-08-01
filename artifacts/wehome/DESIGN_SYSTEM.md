# WeHome — Design System & Brand Bible (codebase reconciliation)

> Source of truth: **WeHome Design System & Brand Bible V1.0** ("Architecture of Silence").
> This file maps the Bible to how *this* codebase (React + Vite + Tailwind v4) already
> expresses tokens, records where they **match** vs **diverge**, and flags decisions that
> require sign-off before execution. Keep it updated as the homepage-refinement passes land.

Philosophy: **Clarity over decoration · Proof over promise · Fluid tactile realism.**
80 / 15 / 5 rule — 80% background space, 15% text, **5% Crimson Atlas** for key actions only.

---

## 1. Where tokens live

- Tailwind v4 theme: `src/index.css` → `@theme inline { … }` (maps `--color-*` → HSL vars).
- Palette + radius: `src/index.css` → `:root { … }` (light) and `.dark { … }`.
- Fonts: Google Fonts `@import` at top of `src/index.css`; families in `@theme` (`--font-sans`, `--font-display`).

## 2. Color — Bible target vs current token

| Bible token | Hex | ≈ HSL | Current var | Current value | Status |
|---|---|---|---|---|---|
| Crimson Atlas (primary) | `#5C1428` | `335 64% 22%` | `--primary` | `345 68% 33%` (`#8E1B3B`) | **DIVERGE** — current is brighter/lighter. Branding change → sign-off. |
| Terrazzo Cream (bg) | `#FBF9F5` | `40 33% 97%` | `--background` | `0 0% 99%` (`#FCFCFC`) | **DIVERGE** — current is cool, not warm. Low-risk reconciliation → recommend next. |
| Taza Stone (text/black) | `#121314` | `220 6% 8%` | `--foreground` | `220 18% 28%` (`#3A4152`) | **DIVERGE** — current is blue-charcoal, lighter. |
| Zellige Sand (hairlines) | `#EAE3D2` | `44 33% 87%` | `--border` | `220 13% 91%` (cool gray) | **DIVERGE** — current border is cool, not warm sand. |
| Cedar Smoke (2ndary text) | `#6E6D6B` | `40 1% 43%` | `--muted-foreground` | `220 10% 46%` (cool gray) | Near-match in value, cooler in hue. |
| Kasbah Ochre (badges) | `#C28E48` | `33 51% 52%` | `--accent` | `38 60% 50%` (`#CC9A33`) | Near-match, slightly more saturated. |

No saturated alert colors: success = soft olive, warning = sienna/terracotta (not yet tokenized — TODO).

## 3. Typography — Bible target vs current

| Role | Bible | Current | Status |
|---|---|---|---|
| Display / headings | **Serif** (Canela / GT Super → Playfair fallback) | `Outfit` (geometric **sans**) `--font-display` | **DIVERGE (major)** — biggest identity lever & biggest "different-product" risk. Sign-off required. |
| Interface / body / data | Inter / SF Pro → system | `DM Sans` `--font-sans` | Acceptable equivalent (neutral, legible sans). |

Type scale (Bible): H1 56/38 · H2 40/28 · H3 24/20 · Body-lg 18/16 · Body 15/14 · Caption 12/11 UPPERCASE +0.05em.
Headings get `tracking-tight` globally (`@layer base`). H1 desktop currently ~clamp to ~72px in Hero — larger than the 56px spec; revisit with the serif decision.

## 4. Spacing & rhythm

- Base unit **8px**. Container `max-w-7xl` (1280px; Bible target 1360px — acceptable).
- **Vertical rhythm (Bible ≥112–128px desktop between sections).** Standardized this pass:
  - Editorial sections → `py-24 md:py-32` (96 → **128**): FeaturedProperties, HowItWorks, Services, WhyChooseUs, CtaSection.
  - Feature-showcase blocks → `md:py-28` (**112**): BeforeAfter, Ecosystem, PepiteDuMois.
  - No section now sits below the 112px desktop floor.

## 5. Radius

- Global `--radius: 1rem` (16px). Bible ethos: **restraint** — cards 8px, buttons 6px, "never app-cute."
- **Decision (deferred):** lowering the global radius touches every page/component → sign-off.
- **This pass (homepage only):** tamed the two outliers `rounded-[3rem]`/`rounded-[2.5rem]` (48/40px) → `rounded-3xl` (24px) so the homepage card language is consistent. Full 8px alignment deferred.

## 6. Motion

- **Standard easing:** Bible `cubic-bezier(0.16, 1, 0.3, 1)`. Codebase already standardized on the near-identical **`[0.22, 1, 0.36, 1]`** (quintic-out) in several components.
- **Decision:** keep **one** curve across the site — we standardize on the existing `[0.22, 1, 0.36, 1]` (imperceptibly close to the Bible's numbers) rather than introduce a second. Reveals/hovers 250–350ms, never >400ms.

## 7. Shadows

- Bible: rest = **no shadow / 1px hairline**; hover = **ultra-soft** `rgba(18,19,20,0.04)`. No colored glows.
- This pass: replaced the loudest **colored glow** CTA shadows (`shadow-primary/25`, `/40`, `shadow-red/blue-*`) on the homepage with restrained neutral shadows. Heavy `shadow-2xl` on hero/cta/pépite cards softened where it read as noise.

## 8. Property Card (Bible §7) — DEFERRED (shared component)

`src/components/home/PropertyCard.tsx` is shared by `/biens`, `/favoris`, `/agents`.
Bible spec (8px radius · 4:3 image · no rest shadow + 1px border · hover 4px lift + image scale 1.03 + title→crimson). Title→crimson **already present**. Radius (24px→8px), ratio (4:5→4:3), and hover-image-scale changes are deferred to a dedicated cross-page pass to respect *homepage-only* scope.

---

## Open decisions (need sign-off before execution)

1. **Serif display headings** — swap `--font-display` to a serif (Playfair Display available on Google Fonts as the Bible's named fallback). Flagship identity move; global.
2. **Crimson Atlas `#5C1428`** — deepen `--primary`. Global branding.
3. **Terrazzo Cream `#FBF9F5` + Taza Stone `#121314` + Zellige Sand borders** — warm the neutral tokens. Global, low-risk; recommended as the next approved step.
4. **Global radius 16→8px & PropertyCard 8px / 4:3** — cross-page proportion pass.
