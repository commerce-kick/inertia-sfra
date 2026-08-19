'use strict';

/**
 * Inertia facade (Laravel's ResponseFactory).
 *
 * One instance per request, created by the initInertia middleware and attached
 * as res.inertia. Prop resolution lives in PropsResolver, page assembly in
 * Response, one-shot session state in SessionFlash.
 */

var Headers = require('./Headers');
var Prop = require('./Prop');
var Response = require('./Response');
var SessionFlash = require('./SessionFlash');
var utils = require('./utils');
var config = require('*/cartridge/config/inertia');
var vite = require('*/cartridge/helpers/vite');

/**
 * @param {Object} req - SFRA request object
 * @param {Object} res - SFRA response object
 */
function Inertia(req, res) {
    this.req = req;
    this.res = res;
    this.sharedProps = {};
    this.rootView = config.rootView;
    this.version = null;
    this._encryptHistory = false;
    this._urlResolver = null;
    this._recorder = null;
}

/* ---------------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------------- */

Inertia.prototype.setRootView = function (view) {
    this.rootView = view;
};

Inertia.prototype.setVersion = function (version) {
    this.version = version;
};

/**
 * Override how the page URL is resolved (Laravel Inertia::resolveUrlUsing).
 * @param {Function} resolver - fn() -> String
 */
Inertia.prototype.resolveUrlUsing = function (resolver) {
    this._urlResolver = resolver;
};

/* ---------------------------------------------------------------------------
 * History
 * ------------------------------------------------------------------------- */

/**
 * @param {Boolean} [encrypt=true]
 */
Inertia.prototype.encryptHistory = function (encrypt) {
    this._encryptHistory = encrypt === undefined ? true : !!encrypt;
};

/**
 * Session-backed one-shot: survives redirects, consumed by the next rendered
 * Inertia page (Laravel Inertia::clearHistory()).
 * @param {Boolean} [clear=true]
 */
Inertia.prototype.clearHistory = function (clear) {
    if (clear === undefined || clear) {
        SessionFlash.setFlag(SessionFlash.KEYS.CLEAR_HISTORY);
    }
};

/**
 * Preserve the URL fragment across the next Inertia visit.
 */
Inertia.prototype.preserveFragment = function () {
    SessionFlash.setFlag(SessionFlash.KEYS.PRESERVE_FRAGMENT);
};

/* ---------------------------------------------------------------------------
 * Shared props
 * ------------------------------------------------------------------------- */

/**
 * @param {String|Object} key - key or object of props
 * @param {*} [value]
 */
Inertia.prototype.share = function (key, value) {
    if (typeof key === 'object' && key !== null && value === undefined) {
        Object.assign(this.sharedProps, key);
    } else {
        this.sharedProps[key] = value;
    }
};

/**
 * @param {String} [key] - omit for all shared props
 */
Inertia.prototype.getShared = function (key) {
    return key === undefined ? this.sharedProps : this.sharedProps[key];
};

Inertia.prototype.flushShared = function () {
    this.sharedProps = {};
};

/* ---------------------------------------------------------------------------
 * Flash data & validation errors
 * ------------------------------------------------------------------------- */

/**
 * Flash data for the next rendered Inertia page (top-level `flash` page key).
 * @param {String|Object} key - key or object of values
 * @param {*} [value]
 */
Inertia.prototype.flash = function (key, value) {
    var data = {};
    if (typeof key === 'object' && key !== null && value === undefined) {
        data = key;
    } else {
        data[key] = value;
    }
    SessionFlash.merge(SessionFlash.KEYS.FLASH, data);
};

/**
 * Flash validation errors for the next request's `errors` prop.
 * Accepts a plain {field: message} object or an SFRA form object.
 * @param {Object} errors
 * @param {String} [bag='default'] - error bag name
 */
Inertia.prototype.flashErrors = function (errors, bag) {
    var mapped = errors && errors.formType === 'formGroup'
        ? mapSfraFormErrors(errors)
        : errors || {};
    var update = {};
    update[bag || 'default'] = mapped;
    SessionFlash.merge(SessionFlash.KEYS.ERRORS, update);
};

/**
 * Map an SFRA form object into {fieldName: message}, recursing into nested
 * form groups. Mirrors app_storefront_base's formErrors.getFormErrors: invalid
 * formFields keyed by htmlName (falling back to the form key), flat result.
 * @param {Object} form
 * @returns {Object}
 */
function mapSfraFormErrors(form) {
    var results = {};
    if (!form) return results;
    Object.keys(form).forEach(function (key) {
        var item = form[key];
        if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, 'formType')) {
            if (item.formType === 'formField' && !item.valid && item.error) {
                results[item.htmlName || key] = item.error;
            } else if (item.formType === 'formGroup') {
                Object.assign(results, mapSfraFormErrors(item));
            }
        }
    });
    return results;
}

/* ---------------------------------------------------------------------------
 * Prop factories
 * ------------------------------------------------------------------------- */

/** @deprecated use optional() */
Inertia.prototype.lazy = function (callback) {
    return new Prop.OptionalProp(callback);
};

Inertia.prototype.optional = function (callback) {
    return new Prop.OptionalProp(callback);
};

Inertia.prototype.always = function (value) {
    return new Prop.AlwaysProp(value);
};

/**
 * @param {Function} callback
 * @param {String} [group='default']
 * @param {Boolean} [rescue=false]
 */
Inertia.prototype.defer = function (callback, group, rescue) {
    return new Prop.DeferProp(callback, group, rescue);
};

Inertia.prototype.merge = function (value) {
    return new Prop.MergeProp(value);
};

Inertia.prototype.deepMerge = function (value) {
    return new Prop.MergeProp(value).deepMerge();
};

Inertia.prototype.prepend = function (value) {
    return new Prop.MergeProp(value).prepend();
};

Inertia.prototype.once = function (callback) {
    return new Prop.OnceProp(callback);
};

/**
 * @param {*} value - paginator or callback returning one
 * @param {String} [wrapper='data']
 * @param {Object|Function} [metadata]
 */
Inertia.prototype.scroll = function (value, wrapper, metadata) {
    return new Prop.ScrollProp(value, wrapper, metadata);
};

/* ---------------------------------------------------------------------------
 * Pagination helper
 * ------------------------------------------------------------------------- */

/**
 * Create a paginator for infinite scroll from SFCC start/sz paging.
 * @param {Array} items - items for the current page
 * @param {Number} total - total item count
 * @returns {Object} {data, meta: {pageName, previousPage, nextPage, currentPage}}
 */
Inertia.prototype.createPaginator = function (items, total) {
    var queryString = this.req.querystring;

    var start = parseInt(queryString.start, 10);
    var size = parseInt(queryString.sz, 10);

    start = isFinite(start) && start >= 0 ? start : 0;
    size = isFinite(size) && size > 0 ? size : 12;
    total = isFinite(total) && total >= 0 ? total : 0;

    var nextStart = start + size;
    var next = nextStart < total ? nextStart : null;
    var previous = start - size;
    previous = previous >= 0 ? previous : null;

    return {
        data: items,
        meta: {
            pageName: 'start',
            previousPage: previous,
            nextPage: next,
            currentPage: start
        }
    };
};

/* ---------------------------------------------------------------------------
 * Response rendering
 * ------------------------------------------------------------------------- */

Inertia.prototype.isInertiaRequest = function () {
    var ctx = Response.buildRequestContext(this.req);
    return !!ctx.header(Headers.INERTIA_REQUEST);
};

/**
 * Render an Inertia response: JSON for Inertia XHRs, the root ISML view with
 * the serialized page for full loads.
 * @param {String} component
 * @param {Object} props
 */
Inertia.prototype.render = function (component, props) {
    var res = this.res;
    var requestCtx = Response.buildRequestContext(this.req);

    var locale = res.getViewData().locale;
    var resolvedComponent = Response.resolveComponent(component, locale);

    var isInertiaRequest = !!requestCtx.header(Headers.INERTIA_REQUEST);
    var httpMethod = (this.req && this.req.httpMethod)
        || (typeof request !== 'undefined' ? request.httpMethod : 'GET');

    // Asset versioning: a stale client gets a 409 pointing back at the same
    // URL, carrying the current version. Flash state survives because nothing
    // is pulled on this path.
    if (
        isInertiaRequest
        && httpMethod === 'GET'
        && this.version
        && requestCtx.header(Headers.VERSION_REQUEST) !== this.version
    ) {
        res.setHttpHeader(Headers.VERSION, this.version);
        this.location(Response.resolveUrl(this._urlResolver));
        return;
    }

    var page = Response.buildPage({
        req: this.req,
        component: resolvedComponent,
        sharedProps: this.sharedProps,
        props: props || {},
        version: this.version,
        encryptHistory: this._encryptHistory,
        urlResolver: this._urlResolver,
        reporter: this._recorder
            ? this._recorder.reporter(Object.keys(this.sharedProps))
            : null
    });

    if (this._recorder) {
        this._recorder.pageRendered(resolvedComponent, page, { version: this.version });
    }

    if (isInertiaRequest) {
        res.setHttpHeader(Headers.INERTIA, 'true');
        if (this.version) {
            res.setHttpHeader(Headers.VERSION, this.version);
        }
        // res.json() is required: SFRA's appendRenderings REPLACES the last
        // queued 'render' entry, which is what discards the base controller's
        // ISML rendering on appended routes (e.g. server.append('Show')).
        // But SFRA serializes the whole viewData bag into the JSON body, so
        // reset it first — otherwise action/queryString/locale and any
        // base-controller models leak into (or break) the page object.
        res.viewData = {};
        res.json(page);
        return;
    }

    // Full HTML load
    var viteTags = vite([
        'app/app.tsx',
        'app/pages/' + resolvedComponent + '.tsx'
    ]);

    // The @inertiajs/* v3.6 client reads the initial page from a
    // <script data-page="app" type="application/json"> tag, not from a
    // data-page attribute. The JSON is printed raw inside that tag, so "<"
    // is escaped to < to prevent </script> breakout.
    var pageJson = JSON.stringify(page).replace(/</g, '\\u003c');

    res.render(this.rootView, {
        page: page,
        pageJson: pageJson,
        viteTags: viteTags,
        // The devtools extension reads the initial entry id from this tag
        // (script[data-inertia-devtools-id]) — the DOM is the only channel a
        // panel attached after the page load can still read.
        devtoolsIdJson: this._recorder ? JSON.stringify(this._recorder.id) : null,
        CurrentSession: typeof session !== 'undefined' ? session : null,
        CurrentRequest: typeof request !== 'undefined' ? request : null,
        CurrentCustomer: typeof customer !== 'undefined' ? customer : null
    });
};

/**
 * External redirect / version-conflict response (Laravel Inertia::location).
 * Inertia requests get a 409 with the location header and an empty body; plain
 * requests are redirected normally.
 * @param {String} url
 */
Inertia.prototype.location = function (url) {
    if (!this.isInertiaRequest()) {
        this.res.redirect(String(url));
        return;
    }
    if (this._recorder) {
        this._recorder.locationCalled(String(url));
    }
    this.res.setStatusCode(409);
    this.res.setHttpHeader(Headers.LOCATION, String(url));
    this.res.print('');
};

/**
 * Redirect back to the referring page (Laravel back()).
 * @param {String} [fallbackAction='Home-Show']
 */
Inertia.prototype.back = function (fallbackAction) {
    var referer = typeof request !== 'undefined' ? request.httpReferer : null;
    if (referer) {
        this.res.redirect(String(referer));
        return;
    }
    var URLUtils = require('dw/web/URLUtils');
    this.res.redirect(URLUtils.url(fallbackAction || 'Home-Show').toString());
};

/**
 * @deprecated Flash is now a top-level page key written via flash(); kept for
 * modules still writing session.custom.flash directly.
 */
Inertia.prototype.resolveFlashMessages = function () {
    return SessionFlash.peek(SessionFlash.KEYS.FLASH, {});
};

module.exports = Inertia;
module.exports.mapSfraFormErrors = mapSfraFormErrors;
