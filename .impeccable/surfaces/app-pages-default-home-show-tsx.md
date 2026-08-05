---
version: 1
slug: "app-pages-default-home-show-tsx"
primary_target: "app/pages/default/Home/Show.tsx"
related_targets: ["app/pages/default/Search/Show.tsx","app/pages/default/Product/Show.tsx","app/layouts/default.tsx"]
---

# Storefront surface brief — Home (Persuade) + PLP (Operate) + PDP (Operate)

## Scope and mode
Home (`app/pages/default/Home/Show.tsx`) is Persuade; PLP (`app/pages/default/Search/Show.tsx`) and PDP (`app/pages/default/Product/Show.tsx`) are Operate. One visual world, shared shell in `app/layouts/default.tsx`; direction contract lives as the first child of `<body>` in `store_front/.../components/layout/inertia.isml`.

## Audience, job, action
Primary evaluators are SFCC developers/agencies judging whether the Inertia-SFRA adapter produces production-credible storefronts; the designed-for visitor is a shopper of the sandbox catalog — as of 2026-08-04 the full RefArch catalog (user decision: copy is generic full-storefront, no watch-specific language). Home must stop the visitor with the headline and route into a collection; PLP must let a shopper refine, sort, and infinite-scroll a lookbook grid; PDP shows one product credibly (cart flow deferred, labeled as upcoming). All UI copy is English (user decision, supersedes the earlier Spanish-copy rule; catalog data remains whatever Business Manager holds).

## Chosen direction (USER-PINNED — supersedes the earlier clean-enterprise/cloudflare world)
Stark atelier grotesk — high-fashion design agency register (Saint Laurent / SSENSE as the craft bar, aesthetic only, no branding): strict black & white, zero radius, no shadows, depth by inversion and hairline rules only. Type at architectural scale is the interface: expanded-caps Archivo Variable (wdth 125) via the `display-caps` utility, tracked `label-caps` for nav/CTAs/control labels, mono `meta-caps` strictly for data (counts, SKUs, prices, code). Dark mode is the same world inverted (footer inverts to white). Motion: the closed eight-device inventory of DESIGN.md — hero reveal (masked line rise + rule draw via `useMaskedReveal`), CSS typographic marquee, tw-animate entrances, inversion/scale hovers (incl. `link-draw` underline draw), chapter reveals (section heads replay the hero grammar once on first in-view), mono tickers (stat count-ups, hero clock, carousel counter — data only), the live protocol trace (chips settle only on real Inertia events), and the line current (light traveling the hero's full-height drafting lines); reduced-motion honored everywhere.

## Memorable moment
The full-viewport "COMMERCE, / COMPOSED." hero rising line-by-line over a full-bleed drafting field whose hairlines carry traveling light in both axes — no rule above the title (with a live mono clock in the meta row); the black stack band whose protocol strip settles chip-by-chip as the visitor's own deferred XHR actually resolves (stamped with the real +ms) above a test-enforced stats grid; the viewport-wide MERIDIAN footer wordmark rising once into view. The band hands off flush to the footer — no paper slab between inverted surfaces.

## Constraints
Demo catalog truth only (no fabricated shipping/returns/testimonial claims); refinement/sort URLs are server-authored; theme expressed through the shadcn CSS-variable contract (`app/styles/globals.css` is the single source); SSR-safe — anime.js only via `loadAnime()` dynamic import inside effects (`app/lib/motion.ts`); deferred `showcases` fallback must mirror real category rows without layout shift.

## Unresolved
Final brand name ("meridian" provisional); cart/checkout flows; PDP variation-URL wiring; BM refinement definitions; sandbox re-import (visual QA currently runs on a scratchpad fixture harness).
