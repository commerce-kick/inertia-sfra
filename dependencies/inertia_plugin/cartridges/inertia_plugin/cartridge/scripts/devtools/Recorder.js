'use strict';

/**
 * Per-request devtools recorder (port of inertia-laravel's DevTools
 * RequestRecorder + IncomingEntryBuilder + Collector, collapsed to what SFCC
 * can do — no reflection, so renderSource/shareSource/actionSource are null).
 *
 * Created by initInertia when DevTools.enabled(); fed by Inertia.render through
 * the PropsResolver reporter seam; finalized from route:BeforeComplete, where it
 * stamps the X-SF-CC-Inertia-Devtools-* response headers and stores the entry
 * for the extension's `GET /_inertia/devtools/entries?id={id}` fetch.
 */

var UUIDUtils = require('dw/util/UUIDUtils');
var Headers = require('*/cartridge/scripts/inertia/Headers');
var utils = require('*/cartridge/scripts/inertia/utils');
var Prop = require('*/cartridge/scripts/inertia/Prop');
var EntryStore = require('./EntryStore');

/**
 * Copy request headers into a plain lowercase-keyed object, dropping
 * credentials (parity with Laravel's RedactsSensitiveData defaults).
 * @param {Object} headers - request.httpHeaders (dw Map or plain object)
 * @returns {Object}
 */
function copyRequestHeaders(headers) {
    var copy = {};
    if (!headers) return copy;

    var keys;
    if (typeof headers.keySet === 'function') {
        keys = headers.keySet().toArray();
    } else {
        keys = Object.keys(headers);
    }

    for (var i = 0; i < keys.length; i++) {
        var key = String(keys[i]).toLowerCase();
        if (key === 'cookie' || key === 'authorization') continue;
        var value = typeof headers.get === 'function' ? headers.get(keys[i]) : headers[keys[i]];
        if (value !== null && value !== undefined) {
            copy[key] = String(value);
        }
    }
    return copy;
}

/**
 * Classify a resolved prop into the extension's PropMeta shape (port of
 * Laravel's PropClassifier::classifyResolved).
 * @param {*} prop - the prop wrapper (or plain value) the resolver saw
 * @returns {Object} {inertiaType, deferGroup, once, mergeDirection, deepMerge}
 */
function classifyProp(prop) {
    var meta = {
        inertiaType: null,
        deferGroup: null,
        once: false,
        mergeDirection: null,
        deepMerge: false
    };

    if (!Prop.isPropType(prop)) return meta;

    var isDeferred = Prop.isDeferrable(prop) && prop.shouldDefer();
    var isMerged = Prop.isMergeable(prop) && prop.shouldMerge();
    var isOnce = Prop.isOnceable(prop) && prop.shouldResolveOnce();

    if (Prop.isAlways(prop)) {
        meta.inertiaType = 'always';
    } else if (Prop.isScroll(prop)) {
        meta.inertiaType = 'scroll';
    } else if (isDeferred || Prop.isRescuable(prop)) {
        // DeferProp always self-defers; a rescuable prop is a DeferProp even
        // when re-resolved on the deferred follow-up request.
        meta.inertiaType = 'defer';
    } else if (Prop.isIgnoreFirstLoad(prop)) {
        meta.inertiaType = 'optional';
    } else if (isMerged) {
        meta.inertiaType = 'merge';
    } else if (isOnce) {
        meta.inertiaType = 'once';
    }

    if (Prop.isDeferrable(prop)) {
        meta.deferGroup = prop.group();
    }
    meta.once = isOnce;
    if (isMerged) {
        if (prop.appendsAtRoot()) meta.mergeDirection = 'append';
        else if (prop.prependsAtRoot()) meta.mergeDirection = 'prepend';
        meta.deepMerge = prop.shouldDeepMerge();
    }

    return meta;
}

/**
 * @param {Object} req - SFRA request (falls back to the dw request global)
 */
function Recorder(req) {
    this.id = UUIDUtils.createUUID();
    this.startMs = Date.now();
    this.utime = this.startMs / 1000;
    this.timestamp = new Date(this.startMs).toISOString();

    var dwRequest = typeof request !== 'undefined' ? request : null;
    var headers = (req && req.httpHeaders) || (dwRequest ? dwRequest.httpHeaders : null);
    this._headers = headers;

    this.method = (req && req.httpMethod) || (dwRequest ? dwRequest.httpMethod : 'GET');
    this.url = this._absoluteUrl(dwRequest);
    this.uri = dwRequest ? String(dwRequest.httpPath || '/') : '/';

    this.isInertiaXhr = !!utils.getRequestHeader(headers, Headers.INERTIA_REQUEST);
    this.isPrefetch = this._readPrefetch(headers);
    this.tabUuid = utils.getRequestHeader(headers, Headers.DEVTOOLS_TAB_REQUEST);
    this.visitId = utils.getRequestHeader(headers, Headers.DEVTOOLS_VISIT_REQUEST);
    this.isDeferred = !!utils.getRequestHeader(headers, Headers.DEVTOOLS_DEFERRED_REQUEST);
    this.isPoll = !!utils.getRequestHeader(headers, Headers.DEVTOOLS_POLL_REQUEST);
    this.isPartial = !!utils.getRequestHeader(headers, Headers.PARTIAL_COMPONENT_REQUEST);
    this.resetProps = utils.parseListHeader(utils.getRequestHeader(headers, Headers.RESET)) || [];

    // Lineage (RequestRecorder::resolveLineage): only Inertia XHRs carry a
    // parent; a prefetch inherits the cursor but must not advance it.
    this.batchId = this.isInertiaXhr
        ? utils.getRequestHeader(headers, Headers.DEVTOOLS_PARENT_REQUEST)
        : null;
    this.parentOut = this.isPrefetch ? this.id : (this.batchId || this.id);

    this.component = null;
    this.props = {};
    this.propValues = null;
    this.responseBody = null;
    this.version = null;
    this.sharedKeys = [];
    this.locationUrl = null;
    this._requestBody = this._captureRequestBody(dwRequest);
}

Recorder.prototype._absoluteUrl = function (dwRequest) {
    if (!dwRequest) return '/';
    try {
        var url = String(dwRequest.httpProtocol || 'https') + '://' + String(dwRequest.httpHost || '');
        url += String(dwRequest.httpPath || '/');
        var queryString = dwRequest.httpQueryString;
        if (queryString) url += '?' + queryString;
        return url;
    } catch (e) {
        return '/';
    }
};

Recorder.prototype._readPrefetch = function (headers) {
    var purpose = utils.getRequestHeader(headers, Headers.PURPOSE_REQUEST)
        || utils.getRequestHeader(headers, Headers.SEC_PURPOSE_REQUEST)
        || '';
    return purpose.toLowerCase().indexOf('prefetch') !== -1;
};

/**
 * Capture the request body (IncomingEntryBuilder::captureRequestBody, minus
 * upload summaries — SFCC form posts arrive as parameters, not files here).
 */
Recorder.prototype._captureRequestBody = function (dwRequest) {
    var isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(this.method) !== -1;

    if (isWrite && !this.isInertiaXhr) {
        return { status: 'omitted', reason: 'non-inertia-request' };
    }

    try {
        var body = dwRequest && dwRequest.httpParameterMap
            ? dwRequest.httpParameterMap.requestBodyAsString
            : null;
        if (!body) return { status: 'empty' };

        try {
            return { status: 'present', value: JSON.parse(body) };
        } catch (parseError) {
            return { status: 'present', value: String(body) };
        }
    } catch (e) {
        return { status: 'empty' };
    }
};

/**
 * The PropsResolver reporter seam. Shared-key context comes from the render
 * call, since shared props are known before resolution starts.
 * @param {Array} [sharedKeys] - top-level shared prop keys
 * @returns {Object} {propResolved, propRescued}
 */
Recorder.prototype.reporter = function (sharedKeys) {
    var self = this;
    if (sharedKeys) {
        this.sharedKeys = sharedKeys.map(utils.firstSegment);
    }

    return {
        propResolved: function (path, prop) {
            self._recordProp(path, prop, false);
        },
        propRescued: function (path, prop) {
            self._recordProp(path, prop, true);
        }
    };
};

Recorder.prototype._recordProp = function (path, prop, rescued) {
    var classified = classifyProp(prop);
    var meta = {
        inertiaType: classified.inertiaType,
        shared: this.sharedKeys.indexOf(utils.firstSegment(path)) !== -1,
        deferGroup: classified.deferGroup,
        reset: this.resetProps.indexOf(path) !== -1,
        once: classified.once,
        mergeDirection: classified.mergeDirection,
        deepMerge: classified.deepMerge,
        renderSource: null,
        shareSource: null
    };
    if (rescued) meta.rescued = true;
    this.props[path] = meta;
};

/**
 * Called by Inertia.render after buildPage. Captures the page and back-fills
 * metadata for props excluded from this response (deferred/merge/once paths
 * never reach the reporter on the request that omits them).
 * @param {String} component - resolved component name
 * @param {Object} page - the built page object
 * @param {Object} [opts] - {version}
 */
Recorder.prototype.pageRendered = function (component, page, opts) {
    this.component = component;
    this.version = (opts && opts.version) || null;
    this.propValues = page.props;
    this.responseBody = page;

    var self = this;

    function ensureProp(path) {
        if (!self.props[path]) {
            self.props[path] = {
                inertiaType: null,
                shared: self.sharedKeys.indexOf(utils.firstSegment(path)) !== -1,
                deferGroup: null,
                reset: self.resetProps.indexOf(path) !== -1,
                once: false,
                mergeDirection: null,
                deepMerge: false,
                renderSource: null,
                shareSource: null
            };
        }
        return self.props[path];
    }

    if (page.deferredProps) {
        Object.keys(page.deferredProps).forEach(function (group) {
            page.deferredProps[group].forEach(function (path) {
                var meta = ensureProp(path);
                meta.inertiaType = meta.inertiaType || 'defer';
                meta.deferGroup = group;
            });
        });
    }

    (page.mergeProps || []).forEach(function (path) {
        var meta = ensureProp(path);
        meta.inertiaType = meta.inertiaType || 'merge';
        meta.mergeDirection = meta.mergeDirection || 'append';
    });

    (page.prependProps || []).forEach(function (path) {
        var meta = ensureProp(path);
        meta.inertiaType = meta.inertiaType || 'merge';
        meta.mergeDirection = meta.mergeDirection || 'prepend';
    });

    (page.deepMergeProps || []).forEach(function (path) {
        var meta = ensureProp(path);
        meta.inertiaType = meta.inertiaType || 'merge';
        meta.deepMerge = true;
    });

    if (page.onceProps) {
        Object.keys(page.onceProps).forEach(function (key) {
            var meta = ensureProp(page.onceProps[key].prop);
            meta.once = true;
            meta.inertiaType = meta.inertiaType || 'once';
        });
    }

    (page.rescuedProps || []).forEach(function (path) {
        var meta = ensureProp(path);
        meta.inertiaType = meta.inertiaType || 'defer';
        meta.rescued = true;
    });
};

/**
 * Called by Inertia.location (covers external redirects and version 409s).
 * @param {String} url
 */
Recorder.prototype.locationCalled = function (url) {
    this.locationUrl = String(url);
};

/**
 * IncomingEntryBuilder::resolveRequestType, minus precognition.
 * @returns {String}
 */
Recorder.prototype.requestType = function () {
    if (!this.isInertiaXhr) {
        return this.component ? 'initial' : 'http';
    }
    if (this.isDeferred) return 'deferred';
    if (this.isPoll) return 'poll';
    if (this.isPartial) return 'partial';
    if (this.isPrefetch) return 'prefetch';
    return 'navigate';
};

/**
 * The SFCC route in Controller-Method form, parsed from the request path.
 * SEO-rewritten URLs carry no pipeline name — then only the uri is reported.
 * @returns {Object} {name, uri, action}
 */
Recorder.prototype._route = function () {
    var segments = this.uri.split('/');
    var last = segments[segments.length - 1] || '';
    var isPipeline = /^[A-Za-z0-9_]+-[A-Za-z0-9_]+$/.test(last);

    return {
        name: isPipeline ? last : null,
        uri: this.uri,
        action: isPipeline ? last : null
    };
};

/**
 * SFCC offers no way to enumerate set response headers, so the map is
 * reconstructed from what the adapter itself stamps.
 * @param {Number} status
 * @param {String|null} redirectLocation
 * @returns {Object}
 */
Recorder.prototype._responseHeaders = function (status, redirectLocation) {
    var headers = {};
    headers[Headers.DEVTOOLS_ID.toLowerCase()] = this.id;
    headers[Headers.DEVTOOLS_PARENT_OUT.toLowerCase()] = this.parentOut;
    headers.vary = 'X-Inertia';

    if (this.locationUrl) {
        headers[Headers.LOCATION.toLowerCase()] = this.locationUrl;
    } else if (redirectLocation) {
        headers.location = redirectLocation;
    } else if (this.component) {
        headers['content-type'] = this.isInertiaXhr
            ? 'application/json; charset=UTF-8'
            : 'text/html; charset=UTF-8';
        if (this.isInertiaXhr) {
            headers[Headers.INERTIA.toLowerCase()] = 'true';
            if (this.version) headers[Headers.VERSION.toLowerCase()] = this.version;
        }
    }

    return headers;
};

/**
 * Stamp the devtools response headers and store the entry. Called from
 * route:BeforeComplete, after status and redirect are final. Never throws —
 * recording must not break the response it observes.
 * @param {Object} res - the SFRA response
 */
Recorder.prototype.finalize = function (res) {
    try {
        res.setHttpHeader(Headers.DEVTOOLS_ID, this.id);
        res.setHttpHeader(Headers.DEVTOOLS_PARENT_OUT, this.parentOut);

        EntryStore.put(this.id, this._buildEntry(res));
    } catch (e) {
        var Logger = require('dw/system/Logger');
        Logger.warn('Inertia DevTools: could not record entry {0}: {1}', this.id, e.message);
    }
};

Recorder.prototype._buildEntry = function (res) {
    var status;
    var redirectLocation = null;

    if (res.redirectUrl) {
        status = res.redirectStatus || 302;
        redirectLocation = String(res.redirectUrl);
    } else {
        status = res.statusCode || 200;
        redirectLocation = this.locationUrl;
    }

    var responseBody;
    if (this.responseBody) {
        responseBody = { status: 'present', value: this.responseBody };
    } else {
        responseBody = { status: 'empty' };
    }

    return {
        __meta: {
            id: this.id,
            tabUuid: this.tabUuid,
            batchId: this.batchId,
            timestamp: this.timestamp,
            utime: this.utime,
            method: this.method,
            url: this.url,
            component: this.component,
            requestType: this.requestType(),
            status: status,
            redirectLocation: redirectLocation,
            serverTimingMs: Date.now() - this.startMs,
            visitId: this.visitId
        },
        http: {
            requestHeaders: copyRequestHeaders(this._headers),
            responseHeaders: this._responseHeaders(status, redirectLocation),
            requestBody: this._requestBody,
            responseBody: responseBody
        },
        props: this.props,
        propValues: this.propValues || {},
        route: this._route(),
        renderSource: null,
        componentPath: this.component ? 'app/pages/' + this.component + '.tsx' : null
    };
};

module.exports = Recorder;
module.exports.classifyProp = classifyProp;
