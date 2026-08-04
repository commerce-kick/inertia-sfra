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
Primary evaluators are SFCC developers/agencies judging whether the Inertia-SFRA adapter produces production-credible storefronts; the designed-for visitor is a shopper of the demo catalog (Spanish watches/accessories). Home must state the offer in one line and route into a collection; PLP must let a shopper refine, sort, and infinite-scroll; PDP shows one product credibly (cart flow deferred, labeled as upcoming).

## Chosen direction (USER-PINNED — supersedes the seed-df4b12fa hangtag roll)
Clean enterprise-web system with cloudflare.com as the craft bar: white ground, deep neutral ink, one confident orange primary (oklch 0.72 0.17 55), blue for links/interactive, hairline borders, 8px-radius cards with soft shadows, dark graphite footer, Inter Variable for all text with mono reserved for counts/SKUs. No skeuomorphism — the earlier hangtag/ticket/barcode/stamp atoms were removed at the user's direction ("pretty ugly"). Aesthetic inspiration only: no Cloudflare branding, name, or logo may appear.

## Memorable moment
The hero's gradient panel with floating product-card silhouettes — the storefront's own UI as illustration; the "Construido sobre Inertia + SFRA" stack strip speaks honestly to the developer audience.

## Constraints
Demo catalog truth only (no fabricated shipping/returns/testimonial claims); refinement/sort URLs are server-authored; refinement groups render data-driven (currently empty — no BM definitions); theme expressed through the shadcn CSS-variable contract; dark mode supported; storefront copy is Spanish to match the catalog.

## Unresolved
Final brand name ("meridian" provisional); cart/checkout flows; page caching for the replaced Home route; BM refinement definitions.
