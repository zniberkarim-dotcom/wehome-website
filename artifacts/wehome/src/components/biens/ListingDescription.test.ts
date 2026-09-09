import { describe, it, expect } from "vitest";
import { toBlocks } from "./ListingDescription";

/**
 * Agents type listing descriptions by hand in the CRM and some use markdown-style
 * bullets. Rendered raw, those asterisks showed up literally on the public site
 * ("* Surface foncière : 2 008 m²"). These pin the parsing that fixes it.
 * The content itself is never rewritten — only how it is grouped for display.
 */

const REAL = [
  "Parking en exploitation à Tétouan.",
  "* Surface foncière : 2 008 m²",
  "* Emplacement premium en plein centre de Tétouan",
  "* Parking en exploitation bénéficiant d'une forte notoriété locale",
  "",
  "Contactez-nous pour une visite.",
].join("\n");

describe("listing description parsing", () => {
  it("groups consecutive markdown bullets into one list", () => {
    const blocks = toBlocks(REAL);
    const lists = blocks.filter((b) => b.type === "ul");

    expect(lists).toHaveLength(1);
    expect(lists[0].type === "ul" && lists[0].items).toHaveLength(3);
  });

  it("strips the bullet marker so no literal asterisk is shown", () => {
    const blocks = toBlocks(REAL);
    const list = blocks.find((b) => b.type === "ul");

    expect(list?.type === "ul" && list.items[0]).toBe("Surface foncière : 2 008 m²");
    for (const item of (list?.type === "ul" && list.items) || []) {
      expect(item.startsWith("*")).toBe(false);
    }
  });

  it("keeps surrounding prose as separate paragraphs", () => {
    const blocks = toBlocks(REAL);
    const paras = blocks.filter((b) => b.type === "p");

    expect(paras).toHaveLength(2);
    expect(paras[0].type === "p" && paras[0].text).toContain("Parking en exploitation à Tétouan");
  });

  it("accepts dash and bullet markers too", () => {
    const blocks = toBlocks("- premier\n• deuxième");
    const list = blocks.find((b) => b.type === "ul");

    expect(list?.type === "ul" && list.items).toEqual(["premier", "deuxième"]);
  });

  it("produces no list at all for ordinary descriptions", () => {
    const blocks = toBlocks("Bel appartement lumineux.\nDeuxième ligne.");

    expect(blocks.some((b) => b.type === "ul")).toBe(false);
    expect(blocks).toHaveLength(2);
  });

  it("does not treat a mid-sentence asterisk as a bullet", () => {
    const blocks = toBlocks("Surface 120 m² * environ");

    expect(blocks.some((b) => b.type === "ul")).toBe(false);
  });
});
