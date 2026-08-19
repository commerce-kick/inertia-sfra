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
| 1.8 | Product-ShowInCategory | PAGE | `Product/Show` | TODO | same page, category-scoped breadcrumbs |
| 1.9 | Product-ShowBonusProducts | JSON | `useBonusProducts` | TODO | pairs with Cart-AddBonusProducts (2.11) |
| 1.10 | Search-Content | JSON | `useContentSearch` | TODO | content results tab |
| 1.11 | Search-ShowAjax | N/A | — | TODO | superseded by the scroll paginator on Search-Show |
| 1.12 | Search-UpdateGrid | N/A | — | TODO | superseded by the scroll paginator on Search-Show |
| 1.13 | Search-Refinebar | N/A | — | TODO | refinements ride as a Search-Show prop |
| 1.14 | Tile-Show | N/A | — | TODO | ISML tile fragment; React renders tiles from `ISearchTileData` |

## Wave 2 — cart

`Cart.js` is fatal (dead `inertiaMiddleware` require) — repair it on row 2.1.

| # | Endpoint | Kind | Page / Hook | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Cart-Show | PAGE | `Cart/Show` | TODO | line items, totals, coupons, shipping methods, bonus products |
| 2.2 | Cart-MiniCart | JSON | `useMiniCart` | TODO | header bag count; already `server.replace`d to a JSON quantity |
| 2.3 | Cart-MiniCartShow | JSON | `useMiniCartContents` | TODO | bag flyout contents |
| 2.4 | Cart-AddProduct | JSON | `useAddToCart` | TODO | POST; unblocks the disabled PDP CTA |
| 2.5 | Cart-Get | JSON | `useCart` | TODO | cart refresh payload |
| 2.6 | Cart-UpdateQuantity | JSON | `useUpdateQuantity` | TODO | qty stepper |
| 2.7 | Cart-RemoveProductLineItem | JSON | `useRemoveLineItem` | TODO | |
| 2.8 | Cart-EditProductLineItem | JSON | `useEditLineItem` | TODO | POST; variant/qty change from the cart |
| 2.9 | Cart-AddCoupon | JSON | `useAddCoupon` | TODO | |
| 2.10 | Cart-RemoveCouponLineItem | JSON | `useRemoveCoupon` | TODO | |
| 2.11 | Cart-AddBonusProducts | JSON | `useAddBonusProducts` | TODO | POST; pairs with 1.9 |
| 2.12 | Cart-EditBonusProduct | JSON | `useEditBonusProduct` | TODO | |
| 2.13 | Cart-SelectShippingMethod | JSON | `useSelectShippingMethod` | TODO | POST; cart-level estimate |
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
