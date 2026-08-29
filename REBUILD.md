# Storefront rebuild — session log & handoff

Fresh storefront on the Inertia-SFRA adapter: full frontend teardown, fresh shadcn install, and three real pages (Home, PLP, PDP) on live SFCC data, with full TypeScript coverage via generation. This file is the running record; the finish review is open and a fresh sandbox is being provisioned.

## Status at a glance

- **Done & committed:** teardown → visual system → controllers/DTOs → pages → SSR parity → live verification → design-detector pass (0 findings).
- **Open:** finish-reviewer verdict is **fix** (8 material findings below), fresh-sandbox migration, DESIGN.md (written by the documenter after the review closes).
- **Paused:** all deploys/verification until the new sandbox is ready.

## Commit log (branch `v2`)

| Commit | What |
|---|---|
| `5861abe` | Phase 1 — teardown to green skeleton (~10.4k lines of dead demo UI removed), PRODUCT.md |
| `a4296a6` | Phase 2 — Hangtag & Garment Bag direction (impeccable roll, later superseded) |
| `ce3c0de` | Phase 3 — fresh shadcn install (17 components) + first theme |
| `934f326` | Phase 4 — DTO type generator plugin + real Search-Show contract |
| `c0aba77` | Phase 5 — real Home-Show controller |
| `b685c19` | Phase 6 — layout, Home, PLP pages |
| `0c66f0d` | Phase 7 — SSR parity via shared app shell |
| `b7c7389` | 409-recovery crash fix, PDP restored, inspection fix batch |
| `bbd156a` | **User-pinned rework: clean enterprise system (Cloudflare as craft bar)** |

## Visual direction (user-pinned, supersedes the seed-df4b12fa roll)

Clean enterprise-web system with **cloudflare.com as the craft bar** (aesthetic inspiration only — no Cloudflare branding anywhere): white ground, deep neutral ink, one confident orange primary `oklch(0.72 0.17 55)`, blue `--link` for interactive, Inter Variable everywhere, mono (Spline Sans Mono) only for counts/SKUs, hairline borders, 8px-radius cards, soft shadows, dark graphite footer. Dark mode = same system on graphite. Storefront copy is Spanish (matches the catalog). Brand name **"meridian" is provisional/synthetic**.

The direction contract lives as the first HTML comment in `<body>` of `store_front/.../templates/default/components/layout/inertia.isml`. The surface brief is at `.impeccable/surfaces/app-pages-default-home-show-tsx.md`.

## Architecture

### Full TS coverage via generation (user directive — never hand-build URLs or prop shapes)
- `plugins/vite-routes-plugin.ts` parses `@queryParam` JSDoc above every `server.*` route → typed helpers in `app/generated/routes` (e.g. `searchShow({ cgid })` with full param types).
- `plugins/vite-dto-types-plugin.ts` (new, same pattern) parses JSDoc-documented `BaseData` schemas in `store_front/.../cartridge/scripts/data/*.js` → interfaces in `app/generated/data` + barrel. Wired into `vite.config.js` and `scripts/generate-routes.ts` (SSR pre-build). `app/generated/**` is gitignored and regenerated — never hand-edit.
- Page prop types (`app/types/{shared,search,home,product}.ts`) compose the generated DTO interfaces; the only raw URLs in the frontend are server-authored ones arriving as props (refinement/sort toggles).

### Server (cartridges)
- **DTO family** (`scripts/data/`, all JSDoc'd for the generator): `PriceData` (flattens default/range/tiered), `SearchTileData` (+`fromTile` mapper with medium→large→small image fallback), `RefinementData`/`RefinementValueData`, `SortOptionData`, `SelectedFilterData`, `CategoryData`, `ProductDetailData` (+`fromModel`), plus `searchUrls.normalizeSearchUrl` (`Search-ShowAjax`/`Search-UpdateGrid` → `Search-Show`).
- **Search.js** (`server.append`): tile-model rows (`pview: 'tile'`) through the scroll paginator; `search`/`refinements`/`selectedFilters`/`sort` props are closures so InfiniteScroll partial reloads (`only: ['products']`) skip their serialization. Full `@queryParam` docs (cgid, q, srule, start, sz, prefn/prefv, pmin, pmax).
- **Home.js** (`server.replace`): `categoryShowcase` from the site catalog root; `showcases` product rows in one deferred `"showcase"` group (single follow-up XHR). Demo endpoints (Contact/ClearHistory/Demo) deleted. Ships uncached (base cache middleware bypassed — documented follow-up).
- **Product.js** (`server.append`): was 500ing on a dead `inertiaMiddleware` require (legacy); rewritten to the v2 API with `ProductDetailData`.
- `models/product/productTile.js` override: requests `medium/large/small` image types (base only asks for `medium`, which this catalog lacks).

### Frontend
- `app/lib/create-app.tsx`: shared page resolver + provider stack (ThemeProvider/QueryClient/Toaster) for both entries — fixes the pre-existing SSR hydration drift (SSR had no layout/providers). `theme-provider.tsx` is SSR-safe now.
- `app/config.ts` — **the X-SF-CC header bridge, critical**: SFCC's `httpHeadersConf.json` stamps `X-SF-CC-Inertia: true` on *every* response (including 409s/HTML 500s), which made the client treat them as Inertia pages and crash in `setPage`. Bridge policy now: 409 → recovery headers only (location/redirect/version), JSON <400 → full bridge, anything else → nothing.
- Layout: sticky white header (wordmark + orange dot, nav links, search → `searchShow({q})`, theme toggle, auth-aware account, bag placeholder), graphite footer, flash→sonner toasts.
- Pages: Home (gradient hero panel with floating card silhouettes, category cards, deferred showcase carousels, honest "Construido sobre Inertia + SFRA" strip), PLP (breadcrumb header + count, filter sheet/rail, applied-filter pills, sort select, InfiniteScroll grid + skeletons + manual fallback, empty state), PDP (gallery + thumbs, price, swatches, availability, description, disabled cart CTA labeled "próximamente").

## Live verification (old sandbox zzth-005, before pause)

- Search-Show: correct wire shape (`scrollProps`, `mergeProps: ["products.data"]`, paginator meta), normalized sort URLs, tile price/image/swatch/rating.
- Home-Show: first paint with `deferredProps {showcase:[showcases]}`; the deferred partial filled both rows in one XHR.
- Product-Show: 200 with full typed props (was 500).
- 409 stale-version probe: carries `x-sf-cc-inertia-location` + the poisoned `x-sf-cc-inertia: true` default — confirming the bridge fix was required.
- Gates: `bun test test/unit` 181 pass · `type-check` clean · `build` + `build:ssr` green · detector 0 findings.

## Finish review — OPEN (disposition: fix)

Reviewer ran in a fresh context (no shipped reviewer agent in this harness — degraded reference used, disclosed). Material fixes to apply next round:

1. Sort select shows English "Best Matches" on the Spanish storefront → localize (BM rule names or client label map).
2. Category-card imagery at `opacity-10` is invisible (compliance token) → make photography visible or commit to the icon-plate card.
3. Home's first showcase row leads with a photo-less product ("Sin foto") → curate image-bearing products first or fix the catalog asset.
4. ~~PDP variation swatches are inert → wire SFRA variation URLs.~~ **Resolved 2026-08-19** (port row 1.5): values carry normalized Product-Show URLs; selection is a partial visit.
5. PLP price slider shows a full orange track at default, reading as an applied filter → mute until narrowed.
6. Home deferred fallback renders 1 skeleton section but 2 real sections arrive → mirror `categoryShowcase.length`.
7. 16px photo-in-circle tile swatches read as specks → flat color chips or true crops, cap at 4.
8. PDP ends ~700px above the footer at 1440 → tighten bottom rhythm.

Also unreviewed: dark mode and PLP/PDP mobile (no captures yet). Reviewer's "keep": the hero (headline + orange CTA pair + gradient panel), mono-caps meta voice, graphite footer — fix around them, don't dilute.

After the fix batch: recapture → send back to the same reviewer for a resolved/partial/unresolved verdict → then the documenter writes **DESIGN.md** from the built world (a new world without DESIGN.md is an incomplete run).

## Fresh sandbox checklist (when it's up)

1. Update `dw.json` (hostname, code-version) — deploys go via `bun run deploy` (b2c-tools; note: code-version reload needs an OAuth client ID, otherwise activate manually in BM).
2. The old catalog ("Sites-my-catalog": `relojes`/`accesorios`, Spanish product names, `large`/`small`/swatch image types only) was hand-built in BM — the new instance needs site + catalog data imported or rebuilt.
3. **Configure search refinement definitions in BM** (e.g. color + price on the root category) — the old sandbox had none, which is why PLP refinement groups render empty. The UI is data-driven and lights up automatically.
4. `bun run build && bun run deploy`, then smoke: Home first paint + deferred fill, PLP refine/sort/scroll, PDP, login → header reflects `auth.user`, theme toggle, 409 recovery after a redeploy.

## Known follow-ups (beyond the review)

- Cart/checkout flows (bag icon + PDP CTA are placeholders); remaining legacy controllers (Account, Cart, Checkout, Order, Wishlist…) still unported.
- Home page caching strategy (replaced route ships uncached).
- Final brand name; Inertia DevTools fork (`X-SF-CC` header prefix); content slots (deferred: content assets as HTML-string props or `PageMgr.renderPage`).
