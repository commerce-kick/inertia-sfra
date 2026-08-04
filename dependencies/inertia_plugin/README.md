# inertia_plugin — Inertia.js server adapter for SFRA

A Salesforce B2C Commerce (SFRA) port of the [inertia-laravel](https://github.com/inertiajs/inertia-laravel)
server adapter, at behavioral parity with **v3.3.0** (DevTools excluded — see
*Deferred* below). Client: `@inertiajs/react` ^3.6.

## Usage

```js
var initInertia = require('*/cartridge/scripts/middleware/initInertia');
var shareData = require('*/cartridge/scripts/middleware/shareData');

server.get('Show', initInertia.init, shareData, function (req, res, next) {
    res.inertia.share('locale', req.locale.id);

    res.inertia.render('Home/Show', {
        title: 'Welcome',
        cart: function () { return getCart(); },              // closure prop
        permissions: res.inertia.optional(loadPermissions),   // partial-only
        notifications: res.inertia.defer(loadNotifications, 'sidebar', true), // rescue: true
        feed: res.inertia.merge(loadFeed()).matchOn('id'),
        locale: res.inertia.once(function () { return req.locale.id; }),
        products: res.inertia.scroll(function () {
            return res.inertia.createPaginator(items, total);
        })
    });

    next();
});
```

Other facade APIs: `flash(key, value)`, `flashErrors(formOrPlainObject, bag)`,
`clearHistory()`, `preserveFragment()`, `encryptHistory()`, `location(url)`,
`back()`, `deepMerge()`, `prepend()`, `lazy()` *(deprecated alias of
`optional()`)*, `resolveUrlUsing(fn)`, `setRootView(view)`.

Module layout mirrors the Laravel adapter:

| Module | Laravel counterpart |
| --- | --- |
| `scripts/inertia/Inertia.js` | `ResponseFactory` (facade, one per request) |
| `scripts/inertia/PropsResolver.js` | `PropsResolver` (recursive resolution + metadata) |
| `scripts/inertia/Response.js` | `Response` (page assembly, URL/component) |
| `scripts/inertia/Prop.js` | prop classes + `MergesProps`/`DefersProps`/`ResolvesOnce` traits |
| `scripts/inertia/SessionFlash.js` | session flash (`flash`, `errors`, `clearHistory`, `preserveFragment`) |
| `scripts/middleware/initInertia.js` | `HandleInertiaRequests` + `EnsureGetOnRedirect` |

Tests: `bun test test/unit` at the repo root mirrors the Laravel
`PropsResolverTest` corpus case-by-case.

## SFCC platform caveats

- **Response header prefix.** SFCC only delivers custom response headers named
  `X-SF-CC-*` (declared in `cartridge/config/httpHeadersConf.json`). The client
  bridges them back to `x-inertia-*` in `app/config.ts`. Any new response
  header needs all three: `Headers.js` constant, `httpHeadersConf.json` entry,
  `app/config.ts` bridge line. Request headers arrive unprefixed.
- **Page cache ignores `Vary`.** The middleware sets `Vary: X-Inertia` on every
  response, but the SFCC page cache and eCDN key on the URL only — a cached
  route would serve JSON to HTML visitors (or vice versa). `initInertia`
  therefore **neutralizes `res.cachePeriod` automatically** on every
  Inertia-enabled route (including values applied by appended base
  controllers). If a route must be page-cached, don't put Inertia on it, or
  add an eCDN custom cache rule keyed on the `X-Inertia` request header.
- **Appended routes** (`server.append('Show', ...)`): `render()` emits JSON via
  `res.json()` after resetting `viewData` — SFRA's rendering replacement then
  discards the base controller's queued ISML template, and the reset prevents
  viewData (action/queryString/locale, base-controller models) from leaking
  into the page object.
- **303 redirects.** PUT/PATCH/DELETE redirects use `res.setRedirectStatus(303)`.
  The platform documents 301/302/307 for `Response.redirect` — verify 303 on a
  sandbox; browsers re-GET on 302 in practice if it is rejected.
- **`session.privacy` limits.** One-shot state (flash, error bags, history
  flags) is stored as JSON strings in `session.privacy` (~2000 char cap per
  attribute). Oversized payloads are dropped with a Logger warning — keep flash
  data small.
- **Flash lifetime divergence.** Laravel flash lives exactly one request and is
  re-flashed across redirects. Here, one-shot state is deleted only when a page
  is *rendered*, so it survives redirects and version-409s automatically — but
  state never followed by a rendered Inertia page persists until the next
  render.
- **Remote includes.** `Inertia-Head` (and any remote include) never consumes
  one-shot session state (`request.includeRequest` guard).
- **Scroll prop wire shape.** A scroll prop delivers the full paginator object
  (`{data, meta}`); the item array lives under the `data` wrapper key and the
  client merges at `<prop>.data`. Page components read `prop.data`.

## Deferred: DevTools

Inertia DevTools (server-side recorder + `/_inertia/devtools/entries` read API
+ Chrome extension) is not implemented. The `PropsResolver` accepts a
`reporter` option (`propResolved`/`propRescued`) as the recording seam. Note
the stock extension discovers entries via the raw `x-inertia-devtools-id`
response header, which SFCC cannot emit unprefixed — an SFCC build of the
extension must also match `x-sf-cc-inertia-devtools-id`.
