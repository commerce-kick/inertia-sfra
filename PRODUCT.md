# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: SFCC (Salesforce B2C Commerce) developers and agencies evaluating or adopting a modern React storefront stack on top of SFRA controllers. They arrive skeptical — SFRA's server-rendered ISML is the incumbent they know — and judge the project by developer experience, protocol correctness, and whether the reference storefront proves the approach works end-to-end.

Secondary: shoppers using storefronts built on the adapter. No specific merchant's customers are committed yet; the reference storefront's shoppers are hypothetical evaluators' end users.

## Product Purpose

Two deliverables of equal weight:

1. **The adapter** — an Inertia.js v2 protocol adapter for SFCC/SFRA (`dependencies/inertia_plugin` cartridge: Inertia facade, Response, PropsResolver, SessionFlash, Headers, shareData/initInertia middleware, Vite helper, SSR service), letting SFCC teams write React 19 pages driven by SFRA controllers instead of ISML templates.
2. **The reference storefront** — a production-grade storefront (`app/` + `store_front` cartridge) that demonstrates the adapter across the full commerce surface: Home, Search/PLP, Product, Cart, Checkout, Account, Order, Wishlist, Address, Payment Instruments.

Success: SFCC developers can clone it, see a working modern storefront on their sandbox, and adopt the adapter for real client builds.

## Positioning

The only Inertia.js adapter for Salesforce B2C Commerce. Neighboring approaches (headless PWA Kit, raw SFRA/ISML) either abandon SFRA controllers entirely or abandon modern frontend DX; this keeps SFRA's controller/middleware model and server-side session/auth intact while delivering an SPA React frontend — no separate API layer, no re-implementation of commerce logic. Ported faithfully from `inertia-laravel` (vendored in-repo as the protocol reference), with Inertia v3.3.0 feature parity (DevTools support pending — requires a forked browser extension because SFCC constrains custom headers to an `X-SF-CC` prefix).

## Operating Context

- Runs against an SFCC sandbox (credentials in `dw.json`, deploy via `b2c-tools`). The RefArch site shell hosts a small custom demo catalog ("Sites-my-catalog": Spanish watches/accessories — `relojes`, `accesorios`; products carry `large`/`small`/swatch image view types, no `medium`; no search refinement definitions are configured in Business Manager yet). Developers work locally with Vite dev server + HMR (`bun run dev`) against the remote sandbox.
- Bun is the package manager and test runner (`bun test test/unit`); TypeScript type-checks gate builds; SSR builds via `ssr.config.js` with a route-generation script.
- SFRA cartridge path mechanics govern the server side: `inertia_plugin` (reusable adapter) and `store_front` (reference implementation) are separate cartridges by design — adopters take the plugin without the storefront.

## Capabilities and Constraints

- Inertia v2 protocol: partial reloads, deferred/lazy/merge props, shared props middleware, session flash, redirects, SSR — with unit coverage under `test/unit/inertia_plugin`.
- Frontend stack: React 19, Inertia React v3, Tailwind CSS 4, shadcn/radix components (`app/components/ui`), TanStack Query, react-hook-form + zod, nuqs.
- SFCC platform constraints are hard boundaries future work must respect: custom response headers must use the `X-SF-CC` prefix, page caching interacts with Inertia version headers, and session/state behavior follows SFCC's model, not Laravel's.
- Known open work: Inertia DevTools requires a forked browser extension (stock one reads the raw `x-inertia-devtools-id` header); some legacy SFRA controllers are still broken/unported.
- Frontend pages implemented so far: Home and Search; remaining controllers have server-side support awaiting pages.

## Brand Commitments

None. The reference storefront runs on RefArch demo data with no merchant identity; its visual identity is an open decision, free to define. The project's own name/identity (as an open-source tool) is also not yet fixed — "inertia-sfra" is the working name.

## Evidence on Hand

- The vendored `inertia-laravel/` source is the protocol ground truth the adapter is ported against.
- Working unit test suite for the adapter core.
- No testimonials, adopters, benchmarks, or case studies exist yet — future marketing/docs surfaces must not fabricate any.
- Product content is RefArch placeholder data — real merchandising imagery/copy does not exist.

## Product Principles

1. **Protocol fidelity over convenience** — match inertia-laravel/Inertia v2 semantics exactly; deviations exist only where SFCC platform constraints force them, and are documented.
2. **SFRA-native, not SFRA-replaced** — controllers, middleware chains, and cartridge conventions stay recognizable to SFCC developers; the adapter meets them where they are.
3. **The reference storefront is the pitch** — every storefront surface must be credible production work, because developers judge the adapter by what it visibly produces.
4. **Separable by design** — the `inertia_plugin` cartridge must remain adoptable standalone; nothing storefront-specific leaks into it.
5. **Open-source ready** — code, docs, and demo quality are written for public scrutiny by outside SFCC teams, not just internal use.
