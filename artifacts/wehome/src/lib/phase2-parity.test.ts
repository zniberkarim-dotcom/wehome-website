import { describe, expect, it } from "vitest";
import fixture from "./__phase2_fixture.json";
import { mapApiProperty, mapSupabaseProperty, type SupabaseProperty } from "./data";
import type { ApiProperty } from "./wehome-api";

/**
 * Migration parity (ADR-015 Phase 2).
 *
 * The site used to build its `Property` objects from raw `properties` rows read
 * with `select("*")`; it now builds them from the API's PublicPropertyDTO. This
 * test runs BOTH mappers over the same 28 published listings, captured from
 * production, and asserts they agree — except on four differences that are
 * intentional and are pinned here, each with its reason, so none can drift back.
 * Two of the four are live bugs the migration fixes.
 *
 * Comparing every field of every listing is stronger than looking at the page:
 * a regression on the 27th property cannot hide below the fold. The fixture is
 * committed so this stays reproducible once the old read path is deleted.
 */
const rows = fixture.rows as unknown as SupabaseProperty[];
const dtos = fixture.dtos as unknown as ApiProperty[];

/** `gradientClass` is a function of list position only — identical by construction. */
const strip = (p: ReturnType<typeof mapApiProperty>) => {
  const { gradientClass: _g, ...rest } = p;
  return rest as Record<string, unknown>;
};

/** What the OLD site code decided, reproduced so the bug can be asserted. */
const siteSaidFurnished = (p: SupabaseProperty) =>
  p.meuble === true ||
  String(p.furnished ?? "")
    .toLowerCase()
    .includes("meublé");

describe("Phase 2 — the API path renders what the Supabase path rendered", () => {
  it("has a fixture covering the real published inventory", () => {
    expect(rows.length).toBeGreaterThan(0);
    expect(dtos.length).toBe(rows.length);
  });

  it("returns the listings in the same order", () => {
    expect(dtos.map((d) => d.reference)).toEqual(rows.map((r) => r.reference));
  });

  it("produces an identical Property, field for field, apart from the four known differences", () => {
    const diffs: string[] = [];
    rows.forEach((row, i) => {
      const before = strip(mapSupabaseProperty(row, i));
      const after = strip(mapApiProperty(dtos[i], i));
      for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
        // The four intentional differences are each asserted on their own below.
        if (["furnished", "description", "address", "price"].includes(key)) continue;
        const a = JSON.stringify(before[key]);
        const b = JSON.stringify(after[key]);
        if (a !== b) diffs.push(`${row.reference} · ${key}\n    avant: ${a}\n    après: ${b}`);
      }
    });
    expect(diffs, `\n${diffs.join("\n")}\n`).toEqual([]);
  });
});

describe("difference 1 — `furnished` was wrong on the site, and is now right", () => {
  /**
   * The old code asked `furnished.toLowerCase().includes("meublé")`. A substring
   * test cannot see a negation, so "Non meublé" CONTAINS "meublé" and every
   * unfurnished listing was rendered as furnished. The mirror-image failure hit
   * the one row stored as "Meubl " — the é lost to an encoding accident — which
   * the substring missed, so a genuinely furnished flat showed as unfurnished.
   *
   * The API uses `parseFurnished`, which checks negation first and tolerates
   * the mojibake. Measured on the fixture: the site is wrong on 18 of 28
   * published listings, in both directions.
   */
  it("disagrees with the old code exactly where the old code was wrong", () => {
    const wrong = rows
      .map((row, i) => ({ row, dto: dtos[i] }))
      .filter(({ row, dto }) => siteSaidFurnished(row) !== (dto.furnished === "furnished"));

    for (const { row, dto } of wrong) {
      const raw = String(row.furnished ?? "");
      const negated = /non\s*meubl/i.test(raw);
      if (negated) {
        // Unfurnished listing that the site advertised as furnished.
        expect(dto.furnished, raw).toBe("unfurnished");
      } else {
        // Furnished listing the substring test missed (encoding damage).
        expect(dto.furnished, raw).toBe("furnished");
      }
    }
    // Guard the headline number: if inventory changes this should be revisited,
    // not silently pass with zero coverage.
    expect(wrong.length).toBeGreaterThan(0);
  });

  it("never reports a negated value as furnished", () => {
    for (const d of dtos) {
      const row = rows.find((r) => r.reference === d.reference)!;
      if (/non\s*meubl/i.test(String(row.furnished ?? ""))) {
        expect(d.furnished, d.reference).toBe("unfurnished");
      }
    }
  });
});

describe("difference 2 — `price` was wrong on the site, and is now right", () => {
  /**
   * The old mapper did `parseFloat(price.replace(/[\s\u00a0,]/g, ""))`, which
   * reads "25.000 HT" as twenty-five: the dot is treated as a decimal point.
   * The listing is a Casablanca OFFICE let at 25 000 MAD/month, and the site
   * has been advertising it at 25 MAD — a thousandth of its price.
   *
   * The API uses `parseAmount`, the same parser the CRM uses everywhere else,
   * which reads a dot in that position as a thousands separator.
   */
  it("differs only where the naive parseFloat misread the format", () => {
    const siteParse = (v: unknown) => parseFloat(String(v ?? "0").replace(/[\s\u00a0,]/g, "")) || 0;
    const diffs = rows
      .map((row, i) => ({ row, api: mapApiProperty(dtos[i], i).price, site: siteParse(row.price) }))
      .filter((d) => d.api !== d.site);

    for (const d of diffs) {
      // Every disagreement is a dotted-thousands value, and the API's answer is
      // the larger, sane one.
      expect(String(d.row.price), d.row.reference).toMatch(/\d\.\d{3}/);
      expect(d.api, d.row.reference).toBeGreaterThan(d.site);
    }
    expect(diffs.length).toBeGreaterThan(0);
  });
});

describe("difference 3 — `description` is trimmed", () => {
  it("differs only by leading/trailing whitespace", () => {
    rows.forEach((row, i) => {
      const before = mapSupabaseProperty(row, i).description;
      const after = mapApiProperty(dtos[i], i).description;
      expect(after, row.reference).toBe(before.trim());
    });
  });
});

describe("difference 4 — `address` is not in the public projection", () => {
  it("is undefined rather than an empty string, and renders the same", () => {
    // `address` is empty on every published row; publishing an exact street
    // address is a decision to take deliberately, not to inherit from an empty
    // column. Both values are falsy, so nothing renders differently.
    rows.forEach((row, i) => {
      expect(String((row as unknown as Record<string, unknown>).address ?? "")).toBe("");
      expect(mapApiProperty(dtos[i], i).address).toBeUndefined();
    });
  });
});

describe("the wire no longer carries what it used to", () => {
  it("has no sensitive key in the rendered object", () => {
    const body = JSON.stringify(dtos.map((d, i) => mapApiProperty(d, i)));
    for (const key of [
      "owner",
      "owner_id",
      "notes",
      "acces_proprietaire",
      "agency_commission",
      "marketing_budget",
      "canva_url",
      "google_drive_url",
      "photo_status",
      "portal_statut",
      "published",
    ]) {
      expect(body, `"${key}" reached the rendered Property`).not.toContain(`"${key}"`);
    }
  });

  it("no longer receives owner names, phones or internal links", () => {
    const wire = JSON.stringify(dtos);
    const secrets: string[] = [];
    for (const r of rows as unknown as Record<string, unknown>[]) {
      const owner = r.owner as { name?: string; phone?: string } | null;
      for (const v of [owner?.name, owner?.phone, r.canva_url, r.google_drive_url]) {
        if (typeof v === "string" && v.length > 4 && wire.includes(v)) secrets.push(v);
      }
    }
    expect(secrets, `still on the wire: ${secrets.join(", ")}`).toEqual([]);
  });
});
