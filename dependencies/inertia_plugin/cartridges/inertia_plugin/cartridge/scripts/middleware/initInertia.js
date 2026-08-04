'use strict';

/**
 * Inertia middleware (Laravel's HandleInertiaRequests + EnsureGetOnRedirect).
 *
 * Registers as the first middleware of an Inertia route:
 *   server.get('Show', initInertia.init, shareData, function (req, res, next) { ... });
 *
 * Responsibilities:
 *  - attach res.inertia (with the asset version derived from the Vite manifest)
 *  - set Vary: X-Inertia on every response
 *  - share the `errors` always-prop (validation error bags)
 *  - intercept res.redirect: 303 for PUT/PATCH/DELETE, 409 X-SF-CC-Inertia-Redirect
 *    for fragment redirects
 *  - turn an empty 200 into a redirect back (Laravel onEmptyResponse)
 */

var Logger = require('dw/system/Logger');
var Inertia = require('*/cartridge/scripts/inertia/Inertia');
var Headers = require('*/cartridge/scripts/inertia/Headers');
var SessionFlash = require('*/cartridge/scripts/inertia/SessionFlash');
var utils = require('*/cartridge/scripts/inertia/utils');

function hashString(str) {
    var hash = 5381;
    var input = String(str || '');
    for (var i = 0; i < input.length; i++) {
        hash = (hash << 5) + hash + input.charCodeAt(i);
        hash = hash & 0xffffffff;
    }
    if (hash < 0) {
        hash = 0xffffffff + hash + 1;
    }
    return ('00000000' + hash.toString(16)).slice(-8);
}

/**
 * Derive the asset version from the Vite manifest contents.
 * @returns {String}
 */
function assetsVersion() {
    try {
        var manifest = require('*/cartridge/static/default/manifest.json') || {};
        var keys = Object.keys(manifest).sort();
        var parts = [];

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var entry = manifest[key];

            if (!entry || typeof entry !== 'object') {
                parts.push(key + ':' + String(entry));
                continue;
            }

            var file = entry.file ? String(entry.file) : '';
            var css = Array.isArray(entry.css) ? entry.css.map(String).sort().join(',') : '';
            var imports = Array.isArray(entry.imports) ? entry.imports.map(String).sort().join(',') : '';
            parts.push(key + ':' + file + '|' + css + '|' + imports);
        }

        return hashString(parts.join(';'));
    } catch (e) {
        return '1.0';
    }
}

/**
 * Laravel's $request->prefetch(): Purpose/Sec-Purpose header contains "prefetch".
 * @param {Object} headers
 * @returns {Boolean}
 */
function isPrefetch(headers) {
    var purpose = utils.getRequestHeader(headers, Headers.PURPOSE_REQUEST)
        || utils.getRequestHeader(headers, Headers.SEC_PURPOSE_REQUEST)
        || '';
    return purpose.toLowerCase().indexOf('prefetch') !== -1;
}

/**
 * Resolve the flashed validation error bags into the `errors` prop shape
 * (Laravel Middleware::resolveValidationErrors):
 *  - only a `default` bag + X-Inertia-Error-Bag header -> { [bagHeader]: bag }
 *  - a `default` bag -> its fields, flat
 *  - only named bags -> the whole bag map
 *  - nothing -> {}
 * @param {Object} headers - request headers
 * @returns {Object}
 */
function resolveValidationErrors(headers) {
    var bags = SessionFlash.pull(SessionFlash.KEYS.ERRORS, null);
    if (!bags || typeof bags !== 'object') return {};

    var bagNames = Object.keys(bags);
    if (bagNames.length === 0) return {};

    var hasDefault = Object.prototype.hasOwnProperty.call(bags, 'default');
    var errorBag = utils.getRequestHeader(headers, Headers.ERROR_BAG_REQUEST);

    if (hasDefault && errorBag) {
        var named = {};
        named[errorBag] = bags.default;
        return named;
    }

    if (hasDefault) {
        return bags.default;
    }

    return bags;
}

/**
 * Middleware entry point. Runs with the SFRA Route as `this`.
 */
function init(req, res, next) {
    var inertia = new Inertia(req, res);
    inertia.setVersion(assetsVersion());
    res.inertia = inertia;

    var headers = (req && req.httpHeaders)
        || (typeof request !== 'undefined' ? request.httpHeaders : null);
    var isInertiaReq = !!utils.getRequestHeader(headers, Headers.INERTIA_REQUEST);

    // Vary on EVERY response (Laravel sets it unconditionally). Note: the SFCC
    // page cache and eCDN key on the URL and ignore Vary — Inertia routes must
    // not enable page caching, or an eCDN cache rule keyed on X-Inertia is
    // required.
    try {
        res.setHttpHeader('Vary', 'X-Inertia');
    } catch (e) {
        Logger.warn('Inertia: could not set Vary header: {0}', e.message);
    }

    // Validation errors, always present and surviving partial reloads
    // (Laravel Middleware::share wraps them in an AlwaysProp).
    inertia.share('errors', inertia.always(function () {
        return resolveValidationErrors(headers);
    }));

    // Intercept redirects on this response instance (own property — the
    // prototype stays untouched). SFRA's server.js reads res.redirectUrl after
    // events fire, so this is the only reliable seam.
    var baseRedirect = res.redirect;
    res.redirect = function (url) {
        if (isInertiaReq) {
            // A redirect to a URL with a #fragment cannot round-trip through
            // the Inertia XHR flow — signal the client to follow it itself.
            if (String(url).indexOf('#') !== -1 && !isPrefetch(headers)) {
                res.setStatusCode(409);
                res.setHttpHeader(Headers.REDIRECT, String(url));
                res.print('');
                return;
            }

            // 303 makes the browser follow with GET after PUT/PATCH/DELETE.
            var method = (req && req.httpMethod)
                || (typeof request !== 'undefined' ? request.httpMethod : 'GET');
            if ((method === 'PUT' || method === 'PATCH' || method === 'DELETE')
                && typeof res.setRedirectStatus === 'function') {
                res.setRedirectStatus(303);
            }
        }
        baseRedirect.call(res, url);
    };

    if (this && typeof this.on === 'function') {
        this.on('route:BeforeComplete', function (eventReq, eventRes) {
            var target = eventRes || res;

            // The SFCC page cache keys on the URL and ignores Vary, so a
            // cached response would be served to BOTH html visitors and
            // Inertia XHRs on the same URL. Inertia-enabled routes must never
            // be page-cached — neutralize any cachePeriod a base controller
            // (e.g. an appended Search-Show) applied, before route:Complete
            // turns it into setExpires().
            target.cachePeriod = null;

            // An OK response with no renderings would leave the Inertia
            // client hanging — redirect back instead (Laravel onEmptyResponse).
            var isEmpty = !target.redirectUrl
                && (!target.renderings || target.renderings.length === 0)
                && (!target.statusCode || target.statusCode === 200);
            if (isInertiaReq && isEmpty) {
                inertia.back();
            }
        });
    }

    next();
}

module.exports = {
    init: init,
    assetsVersion: assetsVersion,
    resolveValidationErrors: resolveValidationErrors,
    isPrefetch: isPrefetch
};
