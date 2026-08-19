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
  /** Generated route-helper modules in app/generated/routes (minus index). */
  routeHelpers: 155,
  /** Generated DTO type modules in app/generated/data (minus index). */
  dtoTypes: 35,
} as const;
