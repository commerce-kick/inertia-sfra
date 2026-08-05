import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { FACTS } from "../../app/lib/facts";

/**
 * The Home stats band shows real numbers about this repo (app/lib/facts.ts).
 * These tests derive each figure from the tree itself, so the band can never
 * drift into fiction: regenerate routes/DTOs or grow the adapter suite and
 * this fails until the published constants are corrected.
 */

const ROOT = join(import.meta.dir, "..", "..");

function moduleCount(dir: string): number {
  return readdirSync(join(ROOT, dir)).filter(
    (file) => file.endsWith(".ts") && file !== "index.ts"
  ).length;
}

describe("Home stats band facts", () => {
  it("counts the adapter unit tests", () => {
    const dir = join(ROOT, "test", "unit", "inertia_plugin");
    const declarations = readdirSync(dir)
      .filter((file) => file.includes(".test."))
      .flatMap((file) =>
        readFileSync(join(dir, file), "utf8").match(/^\s*(?:it|test)\(/gm) ?? []
      );
    expect(declarations.length).toBe(FACTS.unitTests);
  });

  it("counts the generated route helpers", () => {
    expect(moduleCount("app/generated/routes")).toBe(FACTS.routeHelpers);
  });

  it("counts the generated DTO types", () => {
    expect(moduleCount("app/generated/data")).toBe(FACTS.dtoTypes);
  });

  it("matches the parity claim in PRODUCT.md", () => {
    const product = readFileSync(join(ROOT, "PRODUCT.md"), "utf8");
    expect(product).toContain(`Inertia ${FACTS.protocolParity} feature parity`);
  });
});
