# PIR — `properties` coordinate naming mismatch (`lat/lng` vs `latitude/longitude`)

> **Numbering:** no ADR register exists in this repo, so no ADR number is claimed here.
> Assign one (the ADR-0xx sequence referenced in the task brief) when filing.

**Status:** corrected in code; end-to-end write verification outstanding (see *Follow-ups*).
**Severity:** high — blocked all agent publications, and silently disabled the public map.
**Scope of change:** `src/lib/data.ts` only. No migration, no DDL, no new columns, no RLS change.

## Symptom

Publishing a property from the agent portal failed with:

```
PGRST204: Could not find the 'lat' column of 'properties' in the schema cache
```

## Presumed cause (incorrect)

That `properties.lat` / `properties.lng` were missing and should be added, or that the PostgREST
schema cache was stale.

## Confirmed root cause

**Neither.** A code/schema naming mismatch.

`properties` carries a complete geocoding quartet — `formatted_address`, **`latitude`**,
**`longitude`** (`double precision`, nullable), `place_id`. **No table in the `public` schema has
ever had a `lat` or `lng` column.** `src/lib/data.ts` spoke `lat`/`lng` on both sides of the DB
boundary.

## Evidence (read-only recon, before any change)

| Probe | Result |
|---|---|
| `information_schema` → `properties.lat` / `.lng` | absent |
| `information_schema` → `properties.latitude` / `.longitude` | present, `double precision`, nullable |
| `GET /rest/v1/properties?select=lat` | **HTTP 400** |
| `GET /rest/v1/properties?select=latitude` | **HTTP 200** |
| Tables in `public` with `lat` or `lng` | **0** |

The 400/200 split proves the cache was **not** stale: PostgREST agreed with `information_schema`
exactly. A `NOTIFY pgrst, 'reload schema'` would have changed nothing.

## Latent defect uncovered

The same mismatch also broke the **read** path, which nobody had connected to the same cause:

- `mapSupabaseProperty` read `p.lat` from a row that only ever contained `latitude`, so the
  mapped value was always `undefined`.
- `PropertyMap` filters on `typeof p.lat === "number" && typeof p.lng === "number"`, so
  `mappable` was **always empty** and the map rendered zero pins for every property, including
  those that did have coordinates.
- This had previously been misattributed in `DESIGN_SYSTEM.md` as a Supabase *data gap*. It was
  not. That entry has been corrected.

## Why the originally-instructed fix was rejected

`ALTER TABLE properties ADD COLUMN lat, lng` would have cleared `PGRST204` and made everything
worse: two competing coordinate pairs with no source of truth; new publications writing to
`lat`/`lng` while the geocoding pipeline kept filling `latitude`/`longitude`; the already-geocoded
properties invisible on the map permanently; and `place_id`/`formatted_address` orphaned from the
pair actually in use. It was escalated instead of applied.

## Correction

Translate at the DB boundary only. The application-level `Property` and `AgentProperty`
interfaces deliberately keep `lat`/`lng`; `src/lib/data.ts` is the sole translation point.

| Site | Before | After |
|---|---|---|
| `toDbRow` (write) | `row.lat`, `row.lng` | `row.latitude`, `row.longitude` |
| `mapSupabaseProperty` (read) | `p.lat`, `p.lng` | `p.latitude`, `p.longitude` |
| `fetchAgentPropertyById` (read) | `(p as any).lat/.lng` | `(p as any).latitude/.longitude` |
| `SupabaseProperty` (row type) | `lat?`, `lng?` | `latitude?`, `longitude?` |

`toDbRow` was exported solely to make the boundary unit-testable.

## Regression cover

`src/lib/data.coords.test.ts` — 8 tests pinning both directions, plus a round-trip and a
`0`-is-a-valid-coordinate case. Verified meaningful by mutation: reverting only the two write
lines turns 4 red with real assertions, including
`expected [ 'lat', 'lng' ] to not include 'lat'` — the exact `PGRST204` shape.

This required introducing `vitest`; the repo previously had **no test runner at all**.

## Verification

- Gates: lockfile `--frozen-lockfile` exit 0 · prettier clean · eslint 0 errors · **8/8 tests** ·
  build clean. `tsc` reports 4 errors, byte-identical to the pre-change baseline and none in the
  touched files — a pre-existing red gate, not a regression.
- Production read path: the map badge now reports **"3 biens sur la carte"**, matching the 3
  published rows that have coordinates. Previously it showed "Coordonnées GPS manquantes".

## Follow-ups

1. **End-to-end write verification is still outstanding.** It requires an authenticated agent
   session, which this workstream does not hold. Must be run by a credentialed operator.
2. **Coordinate back-fill:** only 11/151 properties have coordinates, but all 151 have `place_id`
   and `formatted_address` — the rest are recoverable from the existing geocoding pipeline.
3. The 4 pre-existing `tsc` errors leave the typecheck gate red; worth its own cleanup.

## Lessons

- `PGRST204` says *"I cannot find that name"*, not *"the column does not exist."* Check for a
  synonym in the table before concluding anything is missing.
- Recon-before-code caught this. The two-sided probe (`information_schema` **and** a live REST
  call) eliminated the stale-cache hypothesis in one step and exposed a third case the brief had
  not anticipated.
- A read path failing silently to `undefined` produces a symptom ("empty map") indistinguishable
  from missing data, which is what sent the earlier diagnosis down the wrong path.
