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
| 1.13 | Search-Refinebar | N/A | — | TODO | refinements ride as a Search-Show prop |
| 1.14 | Tile-Show | N/A | — | TODO | ISML tile fragment; React renders tiles from `ISearchTileData` |

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
| 2.14 | Cart-GetProduct | JSON | `useCartProduct` | TODO | edit-line-item dialog payload |
| 2.15 | Cart-AddProductListItem | JSON | `useAddProductListItem` | TODO | `plugin_giftregistry` |

## Wave 3 — auth

`Login.js` and `Account.js` are both fatal — repair on 3.1 and 3.3.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Login-Show | PAGE | `Login/Show` | TODO | login + register in one page; redirects authed users to Account-Show |
| 3.2 | Login-Logout | N/A | — | TODO | pure redirect; link from the layout header |
| 3.3 | Account-Login | JSON | `useLogin` | TODO | POST; plugin_wishlists prepends/appends |
| 3.4 | Account-SubmitRegistration | JSON | `useRegister` | TODO | POST; plugin_wishlists prepends/appends |
| 3.5 | Account-PasswordReset | PAGE | `Account/PasswordReset` | TODO | request-reset form |
| 3.6 | Account-PasswordResetDialogForm | JSON | `useRequestPasswordReset` | TODO | POST |
| 3.7 | Account-SetNewPassword | PAGE | `Account/SetNewPassword` | TODO | token-gated |
| 3.8 | Account-DoSetNewPassword | PAGE | `Account/SetNewPassword` | TODO | POST; re-renders the same page |
| 3.9 | Account-SaveNewPassword | JSON | `useSaveNewPassword` | TODO | POST |
| 3.10 | Login-OAuthLogin | N/A | — | TODO | external redirect to the IdP |
| 3.11 | Login-OAuthReentry | N/A | — | TODO | IdP callback; redirect only |

## Wave 4 — account

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Account-Show | PAGE | `Account/Show` | TODO | dashboard; plugin_wishlists + plugin_giftregistry both append |
| 4.2 | Account-EditProfile | PAGE | `Account/EditProfile` | TODO | |
| 4.3 | Account-SaveProfile | JSON | `useSaveProfile` | TODO | POST |
| 4.4 | Account-EditPassword | PAGE | `Account/EditPassword` | TODO | |
| 4.5 | Account-SavePassword | JSON | `useSavePassword` | TODO | POST |
| 4.6 | Account-Header | N/A | — | TODO | ISML header fragment; `auth.user` shared prop replaces it |

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
