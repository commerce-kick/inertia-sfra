/**
 * Compile-time facts about this repo, shown in the Home stats band.
 * Every number here is enforced by test/unit/facts.test.ts against the
 * actual tree — if regeneration or new tests change a count, the suite
 * fails until the copy is corrected. Never ship a figure the test can't
 * derive.
 */
export const FACTS = {
  /** Adapter unit tests under test/unit/inertia_plugin (bun test). */
  unitTests: 219,
  /** Inertia protocol parity target — see PRODUCT.md, "Positioning". */
  protocolParity: "v3.3.0",
  /** Generated route helpers in app/generated/routes (excluding support modules and tombstones). */
  routeHelpers: 151,
  /** Generated DTO type modules in app/generated/data (minus index). */
  dtoTypes: 52,
} as const;
