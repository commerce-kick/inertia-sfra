---
description: Port the next TODO endpoint from docs/SFRA_PORT.md to Inertia and mark it complete
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Port exactly **one** row. One row per invocation, so `/loop /port-page` produces
steady, reviewable commits.

## 1. Pick the row

Read `docs/SFRA_PORT.md`. Take the **topmost row whose Status is `TODO`**, skipping
lower waves entirely — wave order is dependency order. If the user passed an
argument (`$ARGUMENTS`), port that endpoint instead. If no `TODO` row remains, say
so and stop.

State the row you picked before doing anything else.

## 2. Review the source

Read the base SFRA controller for the endpoint, and the ISML template(s) it renders,
under `dependencies/storefront-reference-architecture/cartridges/app_storefront_base/cartridge/`.

This is the review step. The port reproduces the feature set the base actually had.
Do not invent UI the base did not have, and do not silently drop a feature — anything
deliberately left out goes in the row's Notes.

Also check whether `store_front/.../controllers/<C>.js` already exists. Several are
fatal: they `require("*/cartridge/scripts/middleware/inertiaMiddleware")`, a module
that no longer exists, so the controller 500s on every endpoint. Repairing that file
is part of the row. `store_front/.../controllers/Product.js` is the reference repair.

## 3. Convert

Follow the recipe in `docs/SFRA_PORT.md` for the row's Kind (PAGE, JSON, or N/A).
The contract, the reference implementations, and the React composition rules are all
in that file — read them, don't reconstruct them from memory.

Non-negotiables:

- URLs only from `@/generated/routes/*` or server-authored props.
- Prop shapes only from `@/generated/data/*`, emitted from a `BaseData` schema.
- `app/generated/**` is gitignored and regenerated — never hand-edit it.
- Every DTO schema field carries a JSDoc `@type` hint.
- Every route carries `@queryParam` doc lines for its parameters.
- `DESIGN.md` is binding for anything visual.
- The page composes; feature UI lives in `app/components/commerce/<feature>/`.

For Kind = N/A, there is nothing to build: confirm the endpoint genuinely has no UI
surface, write the reason in Notes, and go to step 5.

## 4. Gates

```bash
bun run scripts/generate-routes.js   # if you touched a controller or DTO
bun test test/unit
bun run type-check
bun run build
bun run build:ssr
```

Fix what they surface. `app/lib/facts.ts` carries counts asserted by
`test/unit/facts.test.ts` — update it when DTO or route counts move.

Live verification needs a sandbox; `dw.json` currently points at a retired one. Skip
the deploy step and say so rather than claiming a live check you did not run.

## 5. Close the row

Edit `docs/SFRA_PORT.md`: flip the Status to `DONE` (or `BLOCKED`, with the blocker
in Notes — a blocker is a legitimate outcome, faking data is not), and put a one-line
note in the Notes column saying what shipped.

Commit:

```
feat(port): <Endpoint> -> Inertia
```

Then report, in three lines: the row you closed, what shipped, and which gates ran.
