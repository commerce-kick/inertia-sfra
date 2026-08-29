'use strict';

/**
 * Page-object assembly for the Inertia adapter (Laravel's Response.php).
 * Builds the request context for the resolver, resolves the URL and component,
 * and assembles the page with correct key-omission semantics.
 */

var Logger = require('dw/system/Logger');
var PropsResolver = require('./PropsResolver');
var SessionFlash = require('./SessionFlash');
var utils = require('./utils');
var config = require('*/cartridge/config/inertia');

/**
 * Build the header accessor the resolver reads from. Uses the SFRA req when it
 * carries httpHeaders, falling back to the dw request global.
 * @param {Object} req - SFRA req (or the dw request global)
 * @returns {Object} requestCtx with header(name)
 */
function buildRequestContext(req) {
    var headers = (req && req.httpHeaders)
        || (typeof request !== 'undefined' ? request.httpHeaders : null);
    return {
        header: function (name) {
            return utils.getRequestHeader(headers, name);
        }
    };
}

/**
 * Resolve the page URL the way Laravel does: raw path + query, relative to the
 * origin, trailing slash and duplicate query params preserved.
 * @param {Function|null} urlResolver - optional override (Inertia.resolveUrlUsing)
 * @returns {String}
 */
function resolveUrl(urlResolver) {
    if (typeof urlResolver === 'function') {
        return String(urlResolver());
    }

    try {
        var path = typeof request !== 'undefined' ? request.httpPath : null;
        if (path) {
            var queryString = request.httpQueryString;
            return queryString ? path + '?' + queryString : String(path);
        }
    } catch (e) {
        Logger.warn('Inertia: could not derive URL from request.httpPath: {0}', e.message);
    }

    // Fallback for contexts without a request path (should not happen on
    // a storefront request).
    return '/';
}

/**
 * Resolve the component name, honoring locale-specific page overrides in the
 * Vite manifest (app/pages/<locale>/<Component>.tsx).
 * @param {String} component
 * @param {String} locale
 * @returns {String}
 */
function resolveComponent(component, locale) {
    var manifest = {};
    try {
        manifest = require('*/cartridge/static/default/manifest.json');
    } catch (e) {
        // no manifest in dev — fall through to default
    }

    if (locale && manifest['app/pages/' + locale + '/' + component + '.tsx']) {
        return locale + '/' + component;
    }

    return 'default/' + component;
}

/**
 * Assemble the Inertia page object.
 *
 * Key-omission parity with Laravel: every metadata key is absent when empty;
 * clearHistory / encryptHistory / preserveFragment are emitted only as `true`;
 * flash only when non-empty. clearHistory, flash, and preserveFragment are
 * one-shot session state pulled here — and only here — so they survive
 * redirects and version-409s without an explicit reflash.
 *
 * @param {Object} opts
 * @param {Object} opts.req - SFRA req
 * @param {String} opts.component - resolved component name
 * @param {Object} opts.sharedProps
 * @param {Object} opts.props
 * @param {String|null} opts.version
 * @param {Boolean} opts.encryptHistory
 * @param {Function|null} [opts.urlResolver]
 * @param {Object} [opts.reporter] - DevTools seam, forwarded to the resolver
 * @returns {Object} the page object
 */
function buildPage(opts) {
    var requestCtx = buildRequestContext(opts.req);

    var resolver = new PropsResolver(requestCtx, opts.component, {
        exposeSharedPropKeys: config.exposeSharedPropKeys,
        reporter: opts.reporter || null,
        onRescuedError: function (e, path) {
            Logger.error('Inertia: rescued prop "{0}" failed to resolve: {1}', path, e.message);
        }
    });

    var resolved = resolver.resolve(opts.sharedProps, opts.props);

    var page = {
        component: opts.component,
        props: resolved.props,
        url: resolveUrl(opts.urlResolver),
        version: opts.version
    };

    Object.assign(page, resolved.metadata);

    if (SessionFlash.pullFlag(SessionFlash.KEYS.CLEAR_HISTORY)) {
        page.clearHistory = true;
    }

    if (opts.encryptHistory) {
        page.encryptHistory = true;
    }

    var flashData = SessionFlash.pull(SessionFlash.KEYS.FLASH);
    if (utils.isPlainObject(flashData) && Object.keys(flashData).length > 0) {
        page.flash = flashData;
    }

    if (SessionFlash.pullFlag(SessionFlash.KEYS.PRESERVE_FRAGMENT)) {
        page.preserveFragment = true;
    }

    return page;
}

module.exports = {
    buildRequestContext: buildRequestContext,
    resolveUrl: resolveUrl,
    resolveComponent: resolveComponent,
    buildPage: buildPage
};
