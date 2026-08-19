# SFRA → Inertia port tracker

The running record of converting every SFRA storefront endpoint onto the Inertia
adapter, one row at a time. Driven by `/port-page` (or `/loop /port-page`).

**This file is the source of truth for what is done.** The command reads it, takes
the topmost `TODO` row, converts it, and flips it to `DONE`.

---

## Contract

Four artifacts per converted endpoint. Nothing is hand-built that a generator can emit.

| Artifact | Where | Rule |
|---|---|---|
| DTO | `store_front/.../cartridge/scripts/data/<Name>Data.js` | `BaseData.extend({ schema })`; every field carries `/** @type {...} description */` |
| Controller | `store_front/.../cartridge/controllers/<C>.js` | `server.append \| replace("<A>", initInertia.init, shareData, fn)`; doc block with `@queryParam` lines |
| Prop types | `app/types/<page>.ts` | `interface <C><A>Props extends SharedProps`, composing generated `I*Data` |
| Page or hook | `app/pages/default/<C>/<A>.tsx` or `app/lib/queries/<c>.ts` | composes; never implements |

**Never hand-build a URL or a prop shape.** URLs come from `@/generated/routes/*`
(emitted from `@queryParam` JSDoc) or arrive as server-authored props. Prop shapes
come from `@/generated/data/*` (emitted from `BaseData` schemas). `app/generated/**`
is gitignored and regenerated — never hand-edit it.

**UI copy is English-only.** No translation, no locale switcher, no i18n scaffolding
— write strings inline in English. This is a scope decision, not a permanent one: the
adapter still passes `locale` as a shared prop and `Response.resolveComponent` still
honours locale-specific page overrides, so the door stays open. Catalog data stays as
Business Manager holds it.

**`DESIGN.md` is binding** for every pixel: the One Red Rule, the Three Voices, the
Mono-Is-Data rule, the Hairline Chapter rule, no radius, no elevation, and the
closed 8-device motion inventory.

### Reference implementations

| Pattern | File |
|---|---|
| Repair a broken legacy controller | `store_front/.../controllers/Product.js` |
| Closure props, `scroll` + `createPaginator`, `@queryParam` docs | `store_front/.../controllers/Search.js` |
| `server.replace` + `defer(fn, "group")` | `store_front/.../controllers/Home.js` |
| A rich DTO (static mapper, transforms, `@type` hints) | `store_front/.../scripts/data/SearchTileData.js` |
| The DTO parsing contract | header comment of `plugins/vite-dto-types-plugin.ts` |
| The `@queryParam` grammar | `plugins/vite-routes-plugin.ts` |
| Facade API + SFCC caveats | `dependencies/inertia_plugin/README.md` |
| JSON endpoint calls (CSRF, error envelope) | `app/lib/queries/sfra.ts` |

---

## Recipe

### Kind = PAGE

1. **Review first.** Read the base SFRA controller *and* the ISML template(s) it
   renders. The port reproduces the feature set the base actually had — no inventing
   UI, no silently dropping a feature. Anything dropped goes in the row's Notes.
2. **DTOs.** Reuse the existing family (`PriceData`, `ImageData`, `ImageGroupData`,
   `CategoryData`, `SearchTileData`, `ProductDetailData`, `RefinementData`,
   `RefinementValueData`, `SelectedFilterData`, `SortOptionData`,
   `BonusProductLineItemData`) before adding a new one. Composition via
   `type: "collection" | "data", of: X`. A field with `default` is emitted required;
   without, optional. A `transform` without a JSDoc `@type` degrades to `unknown`
   and warns at build — always write the hint.
3. **Controller.** `append` wherever the base already computes useful `viewData`
   (Search/Product pattern); `replace` only when the base render is
   Page-Designer/ISML-specific (Home pattern). Heavy props as closures so partial
   reloads skip their serialization; `res.inertia.defer(fn, "group")` for
   below-the-fold; `res.inertia.scroll` + `createPaginator` for lists. Lazy
   `require` inside the handler. Where the row touches one of the fatal controllers,
   delete the dead `inertiaMiddleware` require and the
   `res.setViewData({ template, props })` shape.
4. **Regenerate** — `bun run scripts/generate-routes.js`, or just let `bun run build`
   do it. Watch for `⚠️ transform fields missing a JSDoc @type hint`.
5. **Types** — `app/types/<page>.ts`, exported from `app/types/index.ts`.
6. **Page** — `app/pages/default/<C>/<A>.tsx`, `export default function <A>()`.
   The `default/` segment is real: `Response.resolveComponent` prefixes it unless a
   locale-specific override exists in the manifest.

### Kind = JSON

1. **DTO for the response**, same as above, so the generator types the wire shape.
   Controller answers `res.json(<Name>Data.from(...))` instead of an ad-hoc object.
2. **Hook** — `app/lib/queries/<controller>.ts`, built on `useSfraRequest()` from
   `app/lib/queries/sfra.ts` (which merges the CSRF pair, unwraps SFRA's error
   envelope, and reloads on `csrfError`). Mutations call
   `router.reload({ only: [...] })` on success to refresh the Inertia props they
   invalidated.

```ts
export function useAddToCart() {
  const request = useSfraRequest();
  return useMutation({
    mutationFn: (v: { pid: string; quantity: number }) =>
      request<ICartActionData>(cartAddProduct(), v),
    onSuccess: () => router.reload({ only: ["cart", "miniCart"] }),
  });
}
```

### React composition rules

- **The page composes, it does not implement.** Target ≤150 lines: read typed props,
  arrange sections, pass data down.
- Shared feature UI → `app/components/commerce/<feature>/`, as compound components
  (`<LineItem>` / `<LineItem.Price>` / `<LineItem.Qty>`) so pages assemble rather
  than configure through prop explosions. Single-use sub-components stay above the
  default export in the page file and get promoted only on second use.
- Server state lives in props or react-query. Local state is `useState` in the
  smallest component that owns it. No new global store.
- Providers go in `AppShell` (`app/lib/create-app.tsx`) only — never in one entry,
  that is how hydration drift starts.
- Links via `@/components/link`, never `@inertiajs/react`'s `Link` directly.

### Gates (every invocation)

```bash
bun test test/unit     # adapter suite + facts.test.ts
bun run type-check     # tsc --noEmit, strict
bun run build          # regenerates routes + DTO types, then builds
bun run build:ssr      # catches browser-only imports at module scope
```

`app/lib/facts.ts` carries counts that `test/unit/facts.test.ts` asserts — update it
when DTO or route counts move. The impeccable design detector runs automatically as a
PostToolUse hook on UI edits.

---

## Status legend

| Kind | Meaning |
|---|---|
| **PAGE** | Renders ISML today → becomes an Inertia page |
| **JSON** | Stays JSON → DTO-typed response + a react-query hook |
| **N/A** | Plumbing with no UI surface; enumerated with its reason, never silently skipped |

| Status | Meaning |
|---|---|
| `TODO` | Not started |
| `DONE` | Converted, gates green, committed |
| `BLOCKED` | Needs something this environment lacks (BM config, catalog data, a payment processor). Reason in Notes. |

---

## Wave 0 — composite baseline

Sets the composition bar the rest of the loop copies.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 0.1 | *(refactor)* Home-Show | PAGE | `Home/Show` | DONE | 690 → 35 lines; 7 components in `commerce/home/*`; markup unchanged |
| 0.2 | *(refactor)* Search-Show | PAGE | `Search/Show` | DONE | 182 → 47 lines; 3 components in `commerce/search/*`; fixed a Spanish `aria-label` |
| 0.3 | *(refactor)* Product-Show | PAGE | `Product/Show` | DONE | 262 → 26 lines; 6 components in `commerce/product/*` |

## Wave 1 — catalog completion

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Home-Show | PAGE | `Home/Show` | DONE | `server.replace`; `categoryShowcase` + deferred `showcases` |
| 1.2 | Search-Show | PAGE | `Search/Show` | DONE | `server.append`; scroll paginator + closure props |
| 1.3 | Product-Show | PAGE | `Product/Show` | DONE | `server.append`; `ProductDetailData.fromModel` |
| 1.4 | SearchServices-GetSuggestions | JSON | `useSuggestions` | DONE | fatal require removed; 3 DTOs + `HeaderSearch` combobox with arrow-key nav |
| 1.5 | Product-Variation | JSON | `useVariation` | DONE | PDP selection rides Product-Show partial visits (per-value `url`); quickview needs the JSON endpoint to swap variants without navigating, so 1.6 ported it and added per-value `variationUrl` |
| 1.6 | Product-ShowQuickView | JSON | `useQuickView` | DONE | `server.replace` → typed product + productUrl; QuickView sheet on every PLP tile. Cart CTA disabled until 2.4; quantity/options/mainAttributes deferred with it |
| 1.7 | Product-SizeChart | JSON | `useSizeChart` | DONE | `server.replace` → `SizeChartData` (miss = `success:false`); `sizeChartId` added to `ProductDetailData`; PDP disclosure under the swatches. Base's outside-click dismissal dropped — the panel is inline, not an overlay |
| 1.8 | Product-ShowInCategory | PAGE | `Product/Show` | DONE | `server.append` → same page/props as 1.3 via a shared `renderProductDetail`; breadcrumbs now walk the `cgid` (base ignored it and repeated the primary-category trail), falling back when it does not resolve. Nothing links here — SEO URL rules do, as in base |
| 1.9 | Product-ShowBonusProducts | JSON | `useBonusProducts` | DONE | `server.replace` → `BonusProductsData` (3 DTOs; `BonusProductLineItemData` fleshed out, base's option-id typo fixed); `useBonusProducts` is an infinite query walking server-authored `moreUrl`. No chooser UI yet — the DUUID only exists once 2.4/2.12 land, so the dialog ships with 2.11. Options/`renderedTemplate` copy dropped |
| 1.10 | Search-Content | JSON | `useContentSearch` | DONE | `server.replace` → `ContentSearchData` + `ContentResultData`; Products/Articles tabs (shadcn `ui/tabs`, line variant) on keyword searches only, articles fetched on first open and paged by `moreUrl`. Base's `hasMessage` compared a query string to a number so its count line never rendered — repaired. Dropped: the `noresults-help` PD slot (no slot surface yet) and `consentTracking` on the JSON route (it merges `tracking_consent`/csrf onto the wire; Search-Show already consents) |
| 1.11 | Search-ShowAjax | N/A | — | DONE | Confirmed no UI surface: it re-rendered the same `productSearch` as Search-Show into `searchResultsNoDecorator` for jQuery to swap in. Base emits refinement URLs against it (`attributeRefinementValue/*`, `productSearch`), and `searchUrls.normalizeSearchUrl` rewrites every one to Search-Show at the DTO boundary, so filters are partial visits and paging is the scroll paginator. Nothing in the port targets the route |
| 1.12 | Search-UpdateGrid | N/A | — | DONE | Confirmed no UI surface: it answered a raw `productSearch` JSON for jQuery to re-render the grid on sort or "More Results". Both producers are covered — `productSortOptions` URLs are normalized to Search-Show by `SortOptionData`, and `productSearch.showMoreUrl` is replaced by `res.inertia.scroll` + `createPaginator`, which reads the same `start`/`sz` params. Stale `search/productGrid.isml` still names `showMoreUrl` but is no longer rendered |
| 1.13 | Search-Refinebar | N/A | — | DONE | Confirmed no UI surface: it re-ran the same search and rendered `search/searchRefineBar.isml` — the same `productSearch.refinements` Search-Show already computes — for jQuery to swap into the sidebar. Its only base producers are `searchHelpers`' `refineurl` (built for that template) and the Page Designer `productList` include. The port serves `refinements`, `selectedFilters` and `search.resetLink` as Search-Show props, rendered by `commerce/refinement-panel.tsx` and `commerce/applied-filters.tsx`, and every refinement URL is normalized to Search-Show at the DTO boundary (1.11), so filtering is a partial visit. Nothing in the port targets the route |
| 1.14 | Tile-Show | N/A | — | DONE | Confirmed no UI surface: it built one product from the factory and rendered `product/gridTile.isml` as a remote `<isinclude url>`, once per tile, from four base call sites (search `productTiles`, the Page Designer `productList`, `components/products`, the home product slot) — a per-product cache-scoped fragment is the only thing ISML could do there. Both URLs its context carried are already in the port: `Product-Show` as `ISearchTileData.url` and `Product-ShowQuickView` through the quick-look sheet (1.6). Tiles render from grid props in `commerce/product-tile.tsx`; the `ratings`/`swatches` display flags become the component's own arrangement — the rating rides the name row, and base's swatch dots read as a colour count, since choosing a variant belongs to the PDP and the quick-look, not the grid |

## Wave 2 — cart

`Cart.js` is fatal (dead `inertiaMiddleware` require) — repair it on row 2.1.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Cart-Show | PAGE | `Cart/Show` | DONE | fatal `inertiaMiddleware` require removed; `server.append` → `CartData` (7 modules: Cart/CartLineItem/CartBonusLineItem/CartTotals/CartDiscount/ShippingMethod + a shared `lineItemFields`). Page composes lines (ordinary / bundle / uncategorized as one compound `LineItem`), nested bonus products, applied coupons + promotions, delivery estimate, totals rail, checkout gate. Base assembled the approaching-promo sentence server-side from a resource template — the two facts (`distance`, `calloutMsg`) arrive separately and the sentence is written in the component. Dropped: `actionUrls`/`resources` bags (generated routes + inline English), `discountsHtml` (a server-rendered copy of the same array), `numOfShipments` (base shipped no multi-shipment cart), `reportingURLs` (row 10.4). Added one row base's totals lacked: subtotal. Base never linked a cart line to its PDP — kept as base had it. Controls arrive with their own rows: coupon form 2.9, coupon remove 2.10, qty 2.6, remove 2.7, edit 2.8/2.14, shipping select 2.13, bonus chooser 2.11/2.12 |
| 2.2 | Cart-MiniCart | JSON | `useMiniCart` | DONE | `server.replace` → `MiniCartData`; the pre-existing untyped replace now answers the DTO. Base rendered an ISML fragment as a remote include (`server.middleware.include`) — replacing drops the include guard, which is what makes the route callable. `useMiniCart` feeds a `BagLink` in the header (link to Cart-Show + mono count, nothing printed on an empty bag). Deliberately a query, not a shared prop: as a shared prop every page would recompute it. `CART_KEY` is the root every cart query hangs off, so a mutation can invalidate the lot |
| 2.3 | Cart-MiniCartShow | JSON | `useMiniCartContents` | DONE | `server.append` → the same `CartData` the page renders, so the flyout is a narrower arrangement of the same components. Adds the `answer(res, payload)` seam in Cart.js: `res.json` *merges* into view data, so a typed JSON step must reset it first (the adapter's own move) — that is what lets every cart row append and keep base's transactions and error handling instead of replacing them. Base hung the contents off a hover popover and made the glyph a link; the glyph now opens a drawer carrying both destinations (Checkout, View bag) — same affordances, reachable by keyboard and touch. Contents fetched on first open |
| 2.4 | Cart-AddProduct | JSON | `useAddToCart` | DONE | `server.append` → `CartActionData` + `BonusOfferData`; base's whole add path (sets, bundles, option merging, bonus detection) is kept. The basket does not ride back — the cart page partial-reloads its own prop and the header count is Cart-MiniCart; what only this answer carries is the bonus offer, which exists in the difference between the basket before and after. Base put failure text in `message` with `error: true`, which the client envelope never reads — split into `errorMessage` so a failure rejects with something worth showing, and base's two candidate chooser URLs resolve to one `chooserUrl` server-side. Closes 1.6's deferrals: `ProductDetailData` gains `readyToOrder`, `selectedQuantity`, `quantities` and `options`, so `AddToBag` (PDP + quickview) holds no state — quantity and every option are resolved by the URL, exactly like variation values. **POST fields are `@formParam`, not `@queryParam`**: `getFormData` skips any key that also appears in the query string, so a POST field put in the URL never arrives, and `@queryParam` would make the generated helper demand it there. Deferred: the chooser dialog the returned offer opens (2.11) |
| 2.5 | Cart-Get | JSON | — | DONE | `server.append` → the same `CartData`. No hook, deliberately: the cart page gets the basket as an Inertia prop and refreshes it with a partial reload, and the flyout has its own route (Cart-MiniCartShow, which base also gave the currency revalidation this one lacks), so `useCart` would be an export with no caller. The route is typed anyway — it stays part of the storefront's public surface either way |
| 2.6 | Cart-UpdateQuantity | JSON | `useUpdateQuantity` | DONE | `server.append` → `CartData`. Adds the `answerCart` seam: base signals a refusal as a 500 *and* an `errorMessage`, and a 500 rejects in the browser before anything reads the body — so the status is normalized to 200 and the reason travels in the envelope `sfra.ts` already unwraps; a hook still only ever sees a DTO or a rejection carrying real text. `sfra.ts` now follows base's `redirectUrl` (its "basket is gone" signal) as an Inertia visit instead of a full page load. Base's pull-down of allowed quantities becomes a stepper on the same bounds (min order quantity, available-to-sell capped by max order qty); nothing moves optimistically. Left standing: base reads `matchingLineItem.product` before checking the line was found, so an unknown pid/uuid pair throws instead of answering its own message — repairing it means replacing the route and reimplementing the bonus-discount bookkeeping, and no storefront surface can produce that pair |
| 2.7 | Cart-RemoveProductLineItem | JSON | `useRemoveLineItem` | DONE | `server.append` → `CartData` (`answerCart` gained a model override — base wraps this one in `basket`). Base's `toBeDeletedUUIDs` dropped: it told jQuery which bonus rows to delete from the DOM beside the clicked one, and a re-render has no rows to reconcile. Keeps base's confirmation, on shadcn `ui/alert-dialog` (added, with `ui/dialog` for 2.11/2.14) |
| 2.8 | Cart-EditProductLineItem | JSON | `useEditLineItem` | DONE | `server.append` → `CartData`; base's merge path (new product already in the basket → sum the quantities, drop the duplicate), product replacement, option move and revalidation all kept. Base answered `{cartModel, newProductId, uuidToBeDeleted, renderedTemplate}` — a rendered card for jQuery plus the two ids telling it which node to swap and which to delete; all three are DOM bookkeeping, only the basket survives. `@formParam`, as 2.4 established. The dialog that drives it ships with 2.14, which supplies the product to edit |
| 2.9 | Cart-AddCoupon | JSON | `useAddCoupon` | DONE | `server.append` → `CartData`; base's error-code mapping ("already in the cart", "already redeemed", "cannot be combined") arrives through the envelope and lands under the field, where base put it — those are answers to what was just typed. Base left the route a GET behind `csrfProtection.validateAjaxRequest`, so the token must ride in the query string (`req.form` skips any key also in the query string): `useCsrfParams` in `sfra.ts`. The token is not a `@queryParam` — transport, not a route parameter, and typing it would make every caller name it |
| 2.10 | Cart-RemoveCouponLineItem | JSON | `useRemoveCoupon` | DONE | `server.append` → `CartData`, behind base's "Remove Coupon?" confirmation. `code` is documented but optional: the UUID identifies the line, and base only accepted `code` so its jQuery could read it back to name the coupon in that confirmation — the applied list already carries it here |
| 2.11 | Cart-AddBonusProducts | JSON | `useAddBonusProducts` | DONE | `server.append` → `CartActionData` (its `fromResult` now reads the three routes' aliases for the same two fields: `msg`/`msgSuccess`, `totalQty`). Base declares the route a POST but reads all three fields off `req.querystring`, so they are `@queryParam` despite the method. Ships the chooser row 1.9 deferred, built from the PDP's own components; a master is picked by choosing its variant in place (`useVariation`, quickview's mode) since the dialog must not navigate. **Repairs 1.9**: `BonusProductsData.products` was `type: "collection"` over objects the controller had *already* mapped, so every transform ran twice and the second pass — seeing a normalized image bag and swatch — dropped both; images and swatches never reached the chooser. Now a transform over raw models. Dropped: base's per-product quantity pull-down — every RefArch choice-of-bonus grants whole items and one tap per product is the interaction; each pick counts one toward the allowance. Left standing: base calls `getBonusProductLineItems()` on an unfound discount, so an unknown uuid throws |
| 2.12 | Cart-EditBonusProduct | JSON | `useEditBonusProduct` | DONE | `server.append` → `BonusOfferData` — base names the fields identically to the offer Cart-AddProduct hands back, so the same DTO and the same chooser serve both. The cart line's offers become base's button, labelled as base labelled it (room left → "Select", full → "Change"). A query, not a mutation: it changes nothing. Dropped: `selectedBonusProducts` (the chooser reads what was picked from Product-ShowBonusProducts' own `selected`), `pageSize` (baked into the server-built chooser URL), `addToCartUrl` (generated helper), the label bag and the always-empty `selectprods`. Left standing: base reads the discount off the basket and its line items off the result unchecked, so no basket or an unknown duuid throws |
| 2.13 | Cart-SelectShippingMethod | JSON | `useSelectShippingMethod` | DONE | `server.append` → `CartData`; the read-only estimate 2.1 shipped becomes base's select of every applicable method. Base takes both fields from either the query string or the form and prefers the query string; they go in the body, which is what a POST is for. `shipmentUUID` left unnamed on purpose — base falls back to the default shipment and the cart is single-shipment. Choosing is what resolves the shipping and tax totals the platform prints as "-" until a method exists, so the whole basket refreshes on the answer |
| 2.14 | Cart-GetProduct | JSON | `useCartProduct` | DONE | `server.replace` → `CartEditProductData`. Replaced, not appended: base defers its answer to a `route:BeforeComplete` handler that renders quickView.isml out of view data, so it would run *after* an appended step and render from the view data that step reset. Ships the dialog 2.8 waited for — variant, quantity and option all re-resolve in place through Product-Variation (quickview's mode), and Save writes what is on screen. `QuantitySelect`/`OptionSelects` promoted out of `AddToBag` on this second use. Repairs: base reads `allProductLineItems` off the basket and `quantityValue` off the found line unchecked, so an expired basket or stale uuid threw — both now answer the error envelope; and base sent the chosen option down twice (once as `selectedOptionValueId`, once inside a `selectedOptions` array), now one field |
| 2.15 | Cart-AddProductListItem | JSON | — | DONE | `server.append` → `CartActionData`, bonus offer and all, so an item added from a list opens the same chooser. `fromResult` now reconciles the third naming: this route flags success with `success` and never sets `error`, where Cart-AddProduct sets `error` and Cart-AddBonusProducts sets both. No hook yet — nothing renders a product list until the wishlist and gift-registry waves, and the caller belongs with the surface that has a list item to add; the route is typed now regardless |

## Wave 3 — auth

`Login.js` and `Account.js` are both fatal — repair on 3.1 and 3.3.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Login-Show | PAGE | `Login/Show` | DONE | `Login.js` repaired (fatal `inertiaMiddleware` require and the `setViewData({template, props})` shape gone); `server.append` → sign-in and registration in one page, base's two nav tabs on shadcn `ui/tabs` with `action` choosing which opens. Forms arrive as *data*: three DTOs (`FormFieldData`, `FormOptionData`, `ProfileFormData` — named `RegistrationFormData` until 4.2 gave it its second surface) carry the label, required flag and length/pattern constraints the site's form definition declares, so the browser enforces what the server will and nothing about `dwfrm_profile_*` is written by hand — the family every later form row reuses. Base's login fields are its own (`loginEmail`/`loginPassword`, written into the ISML, not declared), so those keep inline labels; remembered username and its checkbox kept. OAuth destinations are server-authored, since base builds them with `URLUtils.https` and an OAuth flow over http is a different URL; they are named in words, as the brand colours have no place in an achromatic world, and still need providers configured in BM. Added over base: an authenticated shopper is redirected to Account-Show. Dropped: the single Home breadcrumb (the header wordmark is that link) and base's dead `href="#"` privacy link. Deferred: the guest order-tracking card that shares this page posts to Order-Track (7.5), and the forgot-password link lands with 3.5 |
| 3.2 | Login-Logout | N/A | — | DONE | Confirmed no UI surface: it logs the customer out and redirects to Home-Show, and the redirect needs no adapter help — the route is not Inertia-enabled, so its 302 is followed by the visit's own XHR and Home-Show answers it as a page. What the row ships is the entry point base rendered through the Account-Header remote include (4.6): `AccountMenu` in the layout header, replacing a glyph that had been a button with nothing behind it. Signed out it is the way to Login-Show; signed in it names who is signed in (from the `auth.user` shared prop — no round trip) and offers the way out. Sign out carries `prefetch={false}`: the storefront's `Link` prefetches on hover, and a hover that ends the session is a trap, not a link. The account dashboard joins the menu with 4.1 |
| 3.3 | Account-Login | JSON | `useLogin` | DONE | Ported ahead of 3.1: the login surface composes this hook, so the endpoint lands first. `Account.js` repaired — the fatal `inertiaMiddleware` require and the two `setViewData({template, props})` appends it carried (Show, EditProfile, both naming pages that do not exist) are gone; 4.1/4.2 add them back as real rows. `server.append` → `AuthResultData`, keeping base's authentication, remember-me, account-locked email and `rurl` resolution (1 → Account-Show, 2 → Checkout-Begin). Deliberately the *last* append: plugin_wishlists appends here to merge the guest wish list and reads `authenticatedCustomer` off view data, which the answer seam resets. Base wrapped its refusal in `{error: [message]}` — an array the client envelope never reads, so a wrong password would have surfaced as "Something went wrong"; it now travels in the envelope and lands under the form. `answer`/`answerError` promoted out of Cart.js into `scripts/helpers/answerJson.js` on this second use |
| 3.4 | Account-SubmitRegistration | JSON | `useRegister` | DONE | `server.append` → `AuthResultData`, the same DTO 3.3 answers with. Base does the creation inside a `route:BeforeComplete` handler — the account has to exist before the answer is written — so an appended step runs *before* base has decided anything; the port registers a `route:BeforeComplete` of its own instead, which fires last (handlers run in registration order, and plugin_wishlists' new-account list merge registers before it). Base's three answers normalize to two: a valid registration and a refused form both arrive typed (`fields` kept — a message per form field name, which is the key the register form renders each input under), while the creation that threw stops being a 500 the browser rejects before reading and becomes the error envelope. Base's own validation stands, including `isAcceptablePassword` against the site's password policy, which no client rule can know. The hook takes the values keyed by the server-authored field names, so nothing in the frontend knows a first name is `dwfrm_profile_customer_firstname` |
| 3.5 | Account-PasswordReset | PAGE | `Account/PasswordReset` | DONE | `server.append` → a page with no props of its own: base's form is two fields written into the ISML, not a form definition, and where to go once the link is sent comes back with 3.6's answer. Base rendered the same form twice — this page *and* a Bootstrap modal on the login page — and the port keeps one surface, since an Inertia visit costs a fraction of the page load the modal existed to avoid; the login form's "Forgot password?" link, deferred from 3.1, now points here. The confirmation copy is deliberately non-committal ("if that address has an account…"), because that is exactly what the server checked |
| 3.6 | Account-PasswordResetDialogForm | JSON | `useRequestPasswordReset` | DONE | Ported ahead of 3.5, which composes it. `server.append` → `AuthResultData`, reused rather than added to: the shape is already a verdict, a place to go next (base's `returnUrl`, back to sign-in) and a per-field message. Base answers the same success whether or not the address has an account, emailing only when it does — that silence is the feature, not an oversight, and it is kept. Dropped: the three copy fields base pre-resolved (`receivedMsgHeading`, `receivedMsgBody`, `buttonText`) and the `mobile` echo, which only told base's jQuery whether it was answering the modal or the page — the port has one surface for both |
| 3.7 | Account-SetNewPassword | PAGE | `Account/SetNewPassword` | DONE | `server.append` → the same page 3.8 renders, in its handoff mode. The emailed link carries the token as a query parameter and base's whole reason for this route is to get it out of there: it renders a form that posts the token onward and clicks it with a line of script. The port keeps that — the post is an effect, so the URL the shopper is left on is Account-DoSetNewPassword with no token in it — and keeps base's Continue button as what stands behind it rather than a script that must run. The post fires once; a second would land the shopper on the same form twice. Base's redirect for a token that resolves to nobody is untouched |
| 3.8 | Account-DoSetNewPassword | PAGE | `Account/SetNewPassword` | DONE | `server.append` → the new-password page, with `NewPasswordFormData` (the `newPasswords` form as two `FormFieldData`, so the browser holds the shopper to the same 8–255 the platform will) and the reset token as a prop. The token is a prop and not a parameter on purpose: base's two-step shape exists to keep it out of the address bar, where it would ride in history and referrers, and the port keeps that shape. Base's bad-token redirect to Account-PasswordReset is untouched — a pending redirect breaks the middleware chain before this step runs. Base's Cancel link to Login-Show kept |
| 3.9 | Account-SaveNewPassword | JSON | `useSaveNewPassword` | DONE | Ported ahead of 3.7/3.8, which compose it. `server.replace` → `AuthResultData`, and replaced for a defect an append cannot reach: base does the work inside a `route:BeforeComplete` handler that reads `getCustomerByToken(token).profile` unchecked, and that token comes from an email, so it expires in the ordinary course — yesterday's link was a 500 from a null dereference, and a handler registered after base's never runs to say otherwise. An expired, used or unknown token now answers base's own "Invalid entry. Please try again." through the envelope. Everything else is base's in base's order: the confirmation match, `setPasswordWithToken` (which enforces the site's password policy and consumes the token), the password-changed email, and Login-Show as the destination — carried as `redirectUrl` rather than the redirect an XHR would have followed into a whole page |
| 3.10 | Login-OAuthLogin | N/A | — | DONE | Confirmed no UI surface: it stores the re-entry endpoint in the privacy cache and redirects to the provider's own authorization page — the one thing an Inertia visit must *not* do, since the destination is another origin. Its only producer in the port is the sign-in page's provider buttons (3.1), which are plain anchors carrying server-authored `URLUtils.https` URLs, so the browser leaves the SPA the way base did. Base's failure branch renders the standalone `/error` template directly (not the Error controller), which a full page load renders as base rendered it; with no provider configured in BM that is the only branch reachable here |
| 3.11 | Login-OAuthReentry | N/A | — | DONE | Confirmed no UI surface: the provider calls it, not the storefront. It finalizes the OAuth login, creates or finds the externally-authenticated customer, logs them in and redirects to the endpoint 3.10 stashed in the privacy cache (Account-Show, or Login-Show when finalization fails) — all of it server state, none of it rendered. Nothing in the port targets or links to it; the pages it redirects into are ported rows. Base's `/error` renders on failure, as in 3.10 |

## Wave 4 — account

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Account-Show | PAGE | `Account/Show` | DONE | `server.append` → `AccountData` (4 DTOs: Account/Address/PaymentCard/OrderSummary — the address and card shapes wave 5 will reuse, the order summary wave 7). Base's five cards become a hairline grid: structure drawn with rules, not card chrome. Both plugin cartridges decorate the same account model on the way past and this appends last, so their wish list and registries survive — untyped until wave 8. Base's `userLoggedIn.validateLoggedIn` stands in front, so a signed-out visitor is redirected before this step runs. The header menu gains the dashboard link 3.2 deferred. Dropped: `reportingURLs` (10.4), the two payment URLs (generated helpers), base's `********` password placeholder (the dots are drawn client-side — a fake secret is not a fact worth sending), and the `registration=submitted` flag, whose only consumer was the analytics beacon. `creationDate` is formatted server-side (a JSON prop cannot carry a Date, and the storefront is English-only). Left pointing nowhere on purpose: the address, payment and order panels show what base showed but carry no links yet — Address-List, PaymentInstruments-List and Order-History sit behind controllers that are still fatal, so those links arrive with 5.1/5.7/7.2 rather than pointing at a 500 today |
| 4.2 | Account-EditProfile | PAGE | `Account/EditProfile` | DONE | `server.append` → the same `profile` form the registration surface renders, prefilled by base from the account. That second surface is what turned 3.1's `RegistrationFormData` into `ProfileFormData`: one DTO for one server form, composed differently by each — registration prints eight fields, this prints six, and neither configures the other through props. The two confirmations start empty even though the profile holds values for them, because a confirmation the browser prefills confirms nothing. Base's "Back to my account" link kept. Base's `consentApi`/`caOnline` view data belongs to the tracking-consent banner (9.17), not to this form |
| 4.3 | Account-SaveProfile | JSON | `useSaveProfile` | DONE | Ported ahead of 4.2, which composes it. `server.append` with its own `route:BeforeComplete` (base decides inside one of its own, so an appended step alone would run too early) → `AuthResultData`, the fourth surface that shape already fits. Base makes the change conditional on the account's own password in a way worth naming: it calls `setPassword(password, password, true)` — setting the password to itself — purely to have the platform verify it before `setLogin` moves the email. That check stays, as does its per-field verdict and base's own destination, the dashboard |
| 4.4 | Account-EditPassword | PAGE | `Account/EditPassword` | DONE | `server.append` → `PasswordChangeFormData`: the `profile` form's `login.currentpassword` plus the `newpasswords` group its definition includes, which is the trio base's changePasswordForm.isml printed. Shipped in one commit with 4.5, because the dashboard's Change link would otherwise point at a page whose endpoint could not answer. Deliberately *not* merged with `NewPasswordFormData` (3.8): a different form, a different authorization — the current password here, an emailed token there — and three fields against two |
| 4.5 | Account-SavePassword | JSON | `useSavePassword` | DONE | `server.append` with its own `route:BeforeComplete` → `AuthResultData`, as 3.4 and 4.3 do. Base checks both halves in one call — `setPassword(new, current, true)` — then reads the failure apart: a new password the site's policy refuses lands on the new field, otherwise the current one was wrong. That distinction is the whole usefulness of the error, and it is base's; the port keeps it per field |
| 4.6 | Account-Header | N/A | — | DONE | Confirmed no UI surface of its own: it was a remote include rendering `account/header` (or `account/mobileHeader`) with one fact — the customer's first name — behind a `server.middleware.include` guard, because ISML had no other way to keep a per-customer fragment out of a cached page. The `auth.user` shared prop carries that fact on every page already, so `AccountMenu` (3.2, extended in 4.1) renders both states with no round trip and one menu for both breakpoints instead of base's desktop/mobile pair. Base's third menu item, "My orders", arrives with 7.2 — Order-History sits behind a controller that is still fatal, and the dashboard's order panel waits on the same row |

## Wave 5 — address + payment

`Address.js` and `PaymentInstruments.js` are both fatal — repair on 5.1 and 5.7.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Address-List | PAGE | `Address/List` | TODO | address book |
| 5.2 | Address-AddAddress | PAGE | `Address/Edit` | TODO | shares the page with EditAddress |
| 5.3 | Address-EditAddress | PAGE | `Address/Edit` | TODO | |
| 5.4 | Address-SaveAddress | JSON | `useSaveAddress` | TODO | POST |
| 5.5 | Address-DeleteAddress | JSON | `useDeleteAddress` | TODO | plugin_giftregistry appends |
| 5.6 | Address-SetDefault | N/A | — | TODO | redirect back to Address-List |
| 5.7 | PaymentInstruments-List | PAGE | `PaymentInstruments/List` | TODO | saved cards |
| 5.8 | PaymentInstruments-AddPayment | PAGE | `PaymentInstruments/Add` | TODO | |
| 5.9 | PaymentInstruments-SavePayment | JSON | `useSavePayment` | TODO | POST |
| 5.10 | PaymentInstruments-DeletePayment | JSON | `useDeletePayment` | TODO | |
| 5.11 | Address-Header | N/A | — | TODO | ISML fragment |
| 5.12 | PaymentInstruments-Header | N/A | — | TODO | ISML fragment |

## Wave 6 — checkout

`Checkout.js` is fatal — repair on 6.1. The whole flow is one page driven by `stage`.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Checkout-Begin | PAGE | `Checkout/Begin` | TODO | `stage` querystring drives shipping → payment → place-order |
| 6.2 | CheckoutServices-Get | JSON | `useCheckout` | TODO | |
| 6.3 | CheckoutServices-SubmitCustomer | JSON | `useSubmitCustomer` | TODO | POST; guest checkout |
| 6.4 | CheckoutServices-LoginCustomer | JSON | `useCheckoutLogin` | TODO | POST |
| 6.5 | CheckoutShippingServices-SubmitShipping | JSON | `useSubmitShipping` | TODO | POST |
| 6.6 | CheckoutShippingServices-SelectShippingMethod | JSON | `useSelectCheckoutShipping` | TODO | POST |
| 6.7 | CheckoutShippingServices-UpdateShippingMethodsList | JSON | `useShippingMethods` | TODO | POST |
| 6.8 | CheckoutShippingServices-ToggleMultiShip | JSON | `useToggleMultiShip` | TODO | POST |
| 6.9 | CheckoutAddressServices-CreateNewAddress | JSON | `useCreateCheckoutAddress` | TODO | POST |
| 6.10 | CheckoutAddressServices-AddNewAddress | JSON | `useAddCheckoutAddress` | TODO | POST |
| 6.11 | CheckoutServices-SubmitPayment | JSON | `useSubmitPayment` | TODO | POST; likely BLOCKED without a configured processor |
| 6.12 | CheckoutServices-PlaceOrder | JSON | `usePlaceOrder` | TODO | POST; plugin_wishlists appends |

## Wave 7 — order

`Order.js` is fatal — repair on 7.1.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Order-Confirm | PAGE | `Order/Confirm` | TODO | POST-rendered thank-you page |
| 7.2 | Order-History | PAGE | `Order/History` | TODO | paginated; candidate for the scroll paginator |
| 7.3 | Order-Details | PAGE | `Order/Details` | TODO | |
| 7.4 | Order-Filtered | JSON | `useFilteredOrders` | TODO | order-list filter |
| 7.5 | Order-Track | PAGE | `Order/Track` | TODO | guest order lookup |
| 7.6 | Order-CreateAccount | JSON | `useCreateAccountFromOrder` | TODO | POST; plugin_wishlists prepends/appends |

## Wave 8 — plugin cartridges

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 8.1 | Wishlist-Show | PAGE | `Wishlist/Show` | TODO | fix the bad `sharedData` require in `store_front/.../Wishlist.js` first |
| 8.2 | Wishlist-ShowOthers | PAGE | `Wishlist/Show` | TODO | public view of someone else's list |
| 8.3 | Wishlist-AddProduct | JSON | `useAddToWishlist` | TODO | POST |
| 8.4 | Wishlist-RemoveProduct | JSON | `useRemoveFromWishlist` | TODO | |
| 8.5 | Wishlist-RemoveProductAccount | JSON | `useRemoveFromWishlist` | TODO | account-context variant |
| 8.6 | Wishlist-EditProductListItem | JSON | `useEditWishlistItem` | TODO | POST |
| 8.7 | Wishlist-MoreList | JSON | `useMoreWishlistItems` | TODO | pagination |
| 8.8 | Wishlist-GetListJson | JSON | `useWishlist` | TODO | |
| 8.9 | Wishlist-GetProduct | JSON | `useWishlistProduct` | TODO | |
| 8.10 | Wishlist-RemoveList | JSON | `useRemoveWishlist` | TODO | |
| 8.11 | Wishlist-Search | PAGE | `Wishlist/Search` | TODO | find a friend's list |
| 8.12 | Wishlist-Results | JSON | `useWishlistSearch` | TODO | POST |
| 8.13 | Wishlist-MoreResults | JSON | `useWishlistSearch` | TODO | POST |
| 8.14 | GiftRegistry-* (26 endpoints) | PAGE/JSON | `GiftRegistry/*` | TODO | expand into rows when the wave starts; lowest value, do last |
| 8.15 | ProductList-TogglePublic | JSON | `useToggleListPublic` | TODO | POST; `lib_productlist` |

## Wave 9 — content, locale, errors

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 9.1 | Page-Show | PAGE | `Page/Show` | TODO | content asset; body ships as an HTML-string prop |
| 9.2 | Page-SetLocale | N/A | — | N/A | English-only storefront (user directive) — no locale switcher |
| 9.3 | Page-Locale | N/A | — | N/A | English-only storefront (user directive) — no locale selector |
| 9.4 | ContactUs-Landing | PAGE | `ContactUs/Landing` | TODO | |
| 9.5 | ContactUs-Subscribe | JSON | `useContactUs` | TODO | POST |
| 9.6 | EmailSubscribe-Subscribe | JSON | `useEmailSubscribe` | TODO | POST; footer signup |
| 9.7 | Stores-Find | PAGE | `Stores/Find` | TODO | likely BLOCKED — needs store data in BM |
| 9.8 | Stores-FindStores | JSON | `useFindStores` | TODO | |
| 9.9 | Error-Start | PAGE | `Error/Start` | TODO | `Error.js` is entirely commented out — uncomment and port |
| 9.10 | Error-ErrorCode | PAGE | `Error/Start` | TODO | same page, code-driven copy |
| 9.11 | Error-Forbidden | N/A | — | TODO | redirect to Login-Show |
| 9.12 | Home-ErrorNotFound | PAGE | `Error/NotFound` | TODO | 404 |
| 9.13 | Default-Start | N/A | — | TODO | redirect to Home-Show; `Default.js` is fatal — repair the require |
| 9.14 | Default-Offline | PAGE | `Error/Offline` | TODO | site-offline page |
| 9.15 | ConsentTracking-SetSession | JSON | `useConsent` | TODO | |
| 9.16 | ConsentTracking-SetConsent | JSON | `useConsent` | TODO | POST |
| 9.17 | ConsentTracking-GetContent | JSON | `useConsentContent` | TODO | banner copy from a content asset |
| 9.18 | ConsentTracking-Check | JSON | `useConsent` | TODO | |

## Wave 10 — plumbing audit

Confirm each is genuinely UI-less, record the reason, close the row.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 10.1 | Link-Page / Link-Category / Link-Product / Link-CategoryProduct | N/A | — | TODO | pure redirects |
| 10.2 | RedirectURL-Start / RedirectURL-Hostname | N/A | — | TODO | redirect resolution |
| 10.3 | SourceCodeRedirect-Start | N/A | — | TODO | source-code redirect |
| 10.4 | ReportingEvent-Start / ReportingEvent-MiniCart | N/A | — | TODO | analytics beacons |
| 10.5 | Page-Include / Page-IncludeHeaderMenu | N/A | — | TODO | ISML remote includes |
| 10.6 | PageDesigner-CommerceAssets_ProductTile / _ShopTheLook | N/A | — | TODO | Page Designer component renderers |
| 10.7 | EinsteinCarousel-Load | N/A | — | TODO | Einstein recs fragment; revisit if recs are wanted |
| 10.8 | CSRF-Fail / CSRF-AjaxFail / CSRF-Generate | N/A | — | TODO | token plumbing; handled by the always() `csrf` shared prop + `app/lib/queries/sfra.ts` |

---

## Environment blockers

Recorded once here so rows can reference them instead of repeating the reason.

- **Sandbox** — `dw.json` points at `zzth-005`, retired per `REBUILD.md`. Live
  verification needs a fresh sandbox plus a catalog import.
- **No search refinement definitions in BM** — PLP refinement groups render empty.
- **No payment processor configured** — Wave 6 payment rows will land `BLOCKED`.
- **No store data** — `Stores-Find` (9.7) will land `BLOCKED`.
