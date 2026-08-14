import { describe, it, expect, vi } from "vitest";

// data.ts imports the Supabase client, which calls createClient() at module load.
// Stub it so these stay pure unit tests of the naming boundary, with no env or network.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import { toDbRow, mapSupabaseProperty, type SupabaseProperty } from "@/lib/data";

/**
 * Regression cover for PGRST204: "Could not find the 'lat' column of 'properties'".
 *
 * The DB columns are `latitude` / `longitude`. The application-level Property and
 * AgentProperty interfaces deliberately keep `lat` / `lng`. src/lib/data.ts is the only
 * place allowed to translate between the two, so these tests pin that boundary in both
 * directions. If someone renames the DB side back to lat/lng, publishing breaks and the
 * public map silently shows nothing — exactly the original defect.
 */

const CASA = { lat: 33.56382, lng: -7.646 };

function makeRow(overrides: Partial<SupabaseProperty> = {}): SupabaseProperty {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    reference: "WEH-TEST-0001",
    type: "Appartement",
    transaction: "Vente",
    neighborhood: "Maarif",
    city: "Casablanca",
    price: 1_500_000,
    surface: 120,
    surface_construite: 120,
    furnished: null,
    rooms: 4,
    chambres: 3,
    salons: 1,
    salles_de_bains: 2,
    status: "Disponible",
    agent: null,
    photos: [],
    description: null,
    notes: null,
    owner: null,
    photo_status: null,
    published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as SupabaseProperty;
}

describe("DB coordinate naming boundary", () => {
  describe("write path — toDbRow", () => {
    it("maps app lat/lng onto the latitude/longitude columns", () => {
      const row = toDbRow({ lat: CASA.lat, lng: CASA.lng }) as Record<string, unknown>;

      expect(row.latitude).toBe(CASA.lat);
      expect(row.longitude).toBe(CASA.lng);
    });

    it("never emits lat/lng keys — no such columns exist (PGRST204)", () => {
      const row = toDbRow({ lat: CASA.lat, lng: CASA.lng }) as Record<string, unknown>;

      expect(Object.keys(row)).not.toContain("lat");
      expect(Object.keys(row)).not.toContain("lng");
    });

    it("omits both columns entirely when the property has no coordinates", () => {
      const row = toDbRow({ titre: "Sans GPS" }) as Record<string, unknown>;

      expect(Object.keys(row)).not.toContain("latitude");
      expect(Object.keys(row)).not.toContain("longitude");
    });

    it("treats 0 as a real coordinate rather than dropping it", () => {
      const row = toDbRow({ lat: 0, lng: 0 }) as Record<string, unknown>;

      expect(row.latitude).toBe(0);
      expect(row.longitude).toBe(0);
    });
  });

  describe("read path — mapSupabaseProperty", () => {
    it("exposes latitude/longitude columns to the app as lat/lng", () => {
      const mapped = mapSupabaseProperty(makeRow({ latitude: CASA.lat, longitude: CASA.lng }), 0);

      expect(mapped.lat).toBe(CASA.lat);
      expect(mapped.lng).toBe(CASA.lng);
    });

    it("leaves lat/lng undefined when the row has no coordinates", () => {
      const mapped = mapSupabaseProperty(makeRow({ latitude: null, longitude: null }), 0);

      expect(mapped.lat).toBeUndefined();
      expect(mapped.lng).toBeUndefined();
    });

    it("produces coordinates PropertyMap will accept as mappable", () => {
      // PropertyMap filters on `typeof p.lat === "number" && typeof p.lng === "number"`.
      // Before the fix this was always false, so the map rendered zero pins.
      const mapped = mapSupabaseProperty(makeRow({ latitude: CASA.lat, longitude: CASA.lng }), 0);

      expect(typeof mapped.lat === "number" && typeof mapped.lng === "number").toBe(true);
    });
  });

  it("round-trips app -> DB -> app without losing precision", () => {
    const row = toDbRow({ lat: CASA.lat, lng: CASA.lng }) as Record<string, unknown>;
    const mapped = mapSupabaseProperty(
      makeRow({
        latitude: row.latitude as number,
        longitude: row.longitude as number,
      }),
      0
    );

    expect(mapped.lat).toBe(CASA.lat);
    expect(mapped.lng).toBe(CASA.lng);
  });
});
