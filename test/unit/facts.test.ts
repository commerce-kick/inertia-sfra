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

/** The two modules the routes generator emits beside the helpers themselves. */
const SUPPORT_MODULES = new Set(["index.ts", "types.ts", "utils.ts"]);

/**
 * Count the modules that are actually a generated helper.
 *
 * Two kinds of file have to be excluded or the number drifts without anything
 * being generated: the generator's own support modules, and the tombstones it
 * leaves behind for routes that have gone away (a stub whose first line says
 * so, kept so an import that still names it fails loudly rather than at
 * runtime). Counting either turns this fact into a count of build leftovers.
 */
function moduleCount(dir: string): number {
  return readdirSync(join(ROOT, dir))
    .filter((file) => file.endsWith(".ts") && !SUPPORT_MODULES.has(file))
    .filter(
      (file) =>
        !readFileSync(join(ROOT, dir, file), "utf8").startsWith(
          "// This route is no longer available"
        )
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
