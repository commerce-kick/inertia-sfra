---
version: 1
slug: "app-pages-default-home-show-tsx"
primary_target: "app/pages/default/Home/Show.tsx"
related_targets: ["app/pages/default/Search/Show.tsx","app/layouts/default.tsx"]
---

# Storefront surface brief — Home (Persuade) + PLP (Operate)

## Scope and mode
Home (`app/pages/default/Home/Show.tsx`) is Persuade; PLP (`app/pages/default/Search/Show.tsx`) is Operate. One visual world, two registers. Root layout (`app/layouts/default.tsx`) carries the shared shell and the direction contract comment.

## Audience, job, action
Primary evaluators are SFCC developers/agencies judging whether the Inertia-SFRA adapter produces production-credible storefronts; the designed-for visitor is a shopper of a fashion brand on RefArch apparel data. Home must make the offer intelligible and route to a category PLP; PLP must let a shopper refine, sort, and scroll the catalog without friction.

## Chosen direction (user-confirmed, seed key df4b12fa, assigned roll)
Hangtag & Garment Bag world: the store as the moment of wrapping — every product a ticketed, tissue-wrapped good. Kraft stock ground (#b98d5f family), tissue off-white (#f4efe6), rubber-stamp red (#c8341f) as the committed accent, near-black ink (#1e1a16). Component grammar: swing tags with twine as CTAs/price carriers, punched-ticket rows for categories/filters, barcode tickets for SKU/meta, stamped type for headlines. Retail-industrial, never Etsy-twee: stamps imperfect, tickets utilitarian.

## Memorable moment
The primary CTA is a string-tied swing tag; product prices live on hangtags attached to the tiles.

## Constraints
RefArch demo data; no real brand — "MERIDIAN" is a provisional synthetic brand name (user-replaceable). No fabricated commercial claims. Refinement/sort URLs are server-authored; PLP clarity outranks expression. Theme must express through the shadcn CSS-variable contract; dark mode supported.

## Unresolved
Final brand name; page caching for the replaced Home route.
