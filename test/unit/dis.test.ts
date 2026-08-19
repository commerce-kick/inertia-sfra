import { describe, expect, it } from "bun:test";
import { disSrcSet, disUrl } from "../../app/lib/dis";

const CATALOG =
  "https://zzth.dx.commercecloud.salesforce.com/on/demandware.static/-/Sites-apparel-m-catalog/default/dw1a/images/large/PG.jpg?sw=1400&sh=1400&sm=fit";

describe("DIS urls", () => {
  it("replaces the view type's size rather than appending a second one", () => {
    const url = new URL(disUrl(CATALOG, { width: 128, height: 160 }));
    expect(url.searchParams.getAll("sw")).toEqual(["128"]);
    expect(url.searchParams.get("sh")).toBe("160");
    expect(url.searchParams.get("sm")).toBe("fit");
  });

  it("scales by density for the retina variant", () => {
    const url = new URL(disUrl(CATALOG, { width: 64, height: 80, density: 2 }));
    expect(url.searchParams.get("sw")).toBe("128");
    expect(url.searchParams.get("sh")).toBe("160");
  });

  it("leaves a non-Demandware asset alone", () => {
    const other = "https://example.test/demo/hero.png";
    expect(disUrl(other, { width: 100, height: 125 })).toBe(other);
    expect(disSrcSet(other, { width: 100, height: 125 })).toBeUndefined();
  });

  it("offers 1x and 2x", () => {
    expect(disSrcSet(CATALOG, { width: 80, height: 100 })).toContain(" 1x, ");
    expect(disSrcSet(CATALOG, { width: 80, height: 100 })).toContain(" 2x");
  });
});
