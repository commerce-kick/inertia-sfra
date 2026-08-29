'use strict';

/**
 * Recursive prop resolution + page metadata collection.
 *
 * Near-literal port of inertia-laravel/src/PropsResolver.php (v3.3.0). This
 * module has zero dw/* dependencies: it receives a header accessor and reports
 * errors through an injectable callback, so it is fully unit-testable.
 */

var Headers = require('./Headers');
var Prop = require('./Prop');
var utils = require('./utils');

/**
 * @param {Object} requestCtx
 * @param {Function} requestCtx.header - fn(lowercaseName) -> String|null
 * @param {Boolean} [requestCtx.isInertia] - override; derived from the
 *   x-inertia header when omitted
 * @param {String} component - the resolved page component
 * @param {Object} [options]
 * @param {Boolean} [options.exposeSharedPropKeys=true] - emit the sharedProps key
 * @param {Object} [options.reporter] - DevTools seam: {propResolved(path, prop),
 *   propRescued(path, prop)} — never touched when absent
 * @param {Function} [options.onRescuedError] - fn(error, path); wired to
 *   Logger.error by the facade (Laravel's report())
 */
function PropsResolver(requestCtx, component, options) {
    options = options || {};

    this.header = requestCtx.header;
    this.component = component;

    this.isPartial = this.header(Headers.PARTIAL_COMPONENT_REQUEST) === component;
    this.isInertia = requestCtx.isInertia !== undefined
        ? !!requestCtx.isInertia
        : !!this.header(Headers.INERTIA_REQUEST);
    this.only = utils.parseListHeader(this.header(Headers.PARTIAL_DATA_REQUEST));
    this.except = utils.parseListHeader(this.header(Headers.PARTIAL_EXCEPT_REQUEST));
    this.resetProps = utils.parseListHeader(this.header(Headers.RESET)) || [];
    this.loadedOnceProps = utils.parseListHeader(this.header(Headers.EXCEPT_ONCE_PROPS_REQUEST)) || [];

    this.exposeSharedPropKeys = options.exposeSharedPropKeys !== false;
    this.reporter = options.reporter || null;
    this.onRescuedError = options.onRescuedError || null;

    this.sharedPropKeys = [];
    this.mergeProps = [];
    this.prependProps = [];
    this.deepMergeProps = [];
    this.matchPropsOn = [];
    this.deferredProps = {};
    this.rescuedProps = [];
    this.scrollProps = {};
    this.onceProps = {};
}

/**
 * Resolve the given shared and page props, collecting their metadata.
 * @param {Object} shared
 * @param {Object} props
 * @returns {{props: Object, metadata: Object}}
 */
PropsResolver.prototype.resolve = function (shared, props) {
    var merged = Object.assign({}, this.resolveSharedProps(shared || {}), props || {});

    return {
        props: this.resolveProps(this.unpackDotProps(merged), '', false),
        metadata: this.buildMetadata()
    };
};

PropsResolver.prototype.resolveSharedProps = function (shared) {
    if (!this.exposeSharedPropKeys) return shared;

    var seen = {};
    var keys = Object.keys(shared);
    for (var i = 0; i < keys.length; i++) {
        var top = utils.firstSegment(keys[i]);
        if (!seen[top]) {
            seen[top] = true;
            this.sharedPropKeys.push(top);
        }
    }
    return shared;
};

/**
 * Metadata keys are emitted only when non-empty (Laravel array_filter on count).
 */
PropsResolver.prototype.buildMetadata = function () {
    var metadata = {};
    if (this.sharedPropKeys.length > 0) metadata.sharedProps = this.sharedPropKeys;
    if (this.mergeProps.length > 0) metadata.mergeProps = this.mergeProps;
    if (this.prependProps.length > 0) metadata.prependProps = this.prependProps;
    if (this.deepMergeProps.length > 0) metadata.deepMergeProps = this.deepMergeProps;
    if (this.matchPropsOn.length > 0) metadata.matchPropsOn = this.matchPropsOn;
    if (Object.keys(this.deferredProps).length > 0) metadata.deferredProps = this.deferredProps;
    if (this.rescuedProps.length > 0) metadata.rescuedProps = this.rescuedProps;
    if (Object.keys(this.scrollProps).length > 0) metadata.scrollProps = this.scrollProps;
    if (Object.keys(this.onceProps).length > 0) metadata.onceProps = this.onceProps;
    return metadata;
};

function isContainer(value) {
    return Array.isArray(value) || utils.isPlainObject(value);
}

/**
 * Recursively resolve the props tree, collecting metadata along the way.
 * @param {Object|Array} props
 * @param {String} prefix
 * @param {Boolean} parentWasResolved - children of values produced by resolving
 *   a non-container prop bypass partial filtering
 */
PropsResolver.prototype.resolveProps = function (props, prefix, parentWasResolved) {
    var isArray = Array.isArray(props);
    var result = isArray ? [] : {};
    var keys = isArray ? null : Object.keys(props);
    var length = isArray ? props.length : keys.length;

    for (var i = 0; i < length; i++) {
        var key = isArray ? i : keys[i];
        var prop = props[key];
        var path = prefix === '' ? String(key) : prefix + '.' + key;

        // On partial requests, only include props matching the requested paths.
        // AlwaysProp and children of already-resolved values bypass this filter.
        if (!this.shouldIncludeInPartialResponse(prop, path, parentWasResolved)) {
            continue;
        }

        // On initial page loads, certain prop types (DeferProp, OptionalProp)
        // are excluded before resolution so their closures never execute.
        if (!this.isPartial && this.excludeFromInitialResponse(prop, path)) {
            continue;
        }

        var value = this.resolveValue(prop, path);

        if (this.rescuedProps.indexOf(path) !== -1) {
            if (this.reporter) this.reporter.propRescued(path, prop);
            continue;
        }

        // A closure may return a prop type instead of a plain value; unwrap it
        // one more level so it participates in filtering and metadata below.
        if (value !== prop && Prop.isPropType(value)) {
            prop = value;

            if (!this.isPartial && this.excludeFromInitialResponse(prop, path)) {
                continue;
            }

            value = this.resolveValue(prop, path);
        }

        this.collectMetadata(prop, path);
        if (this.reporter) this.reporter.propResolved(path, prop);

        // Recurse into containers. If the original prop was not itself a
        // container (e.g. a closure returning an object), its children bypass
        // partial filtering.
        result[key] = isContainer(value)
            ? this.resolveProps(value, path, parentWasResolved || !isContainer(prop))
            : value;
    }

    return result;
};

PropsResolver.prototype.shouldIncludeInPartialResponse = function (prop, path, parentWasResolved) {
    if (!this.isPartial || Prop.isAlways(prop) || parentWasResolved) {
        return true;
    }
    return this.pathMatchesPartialRequest(path);
};

PropsResolver.prototype.pathMatchesPartialRequest = function (path) {
    if (this.only !== null && !this.matchesOnly(path) && !this.leadsToOnly(path)) {
        return false;
    }
    if (this.except !== null && this.matchesExcept(path)) {
        return false;
    }
    return true;
};

/**
 * Each exclusion type collects its metadata before the prop is removed.
 */
PropsResolver.prototype.excludeFromInitialResponse = function (prop, path) {
    // OptionalProp and DeferProp are never sent on the initial page load but
    // still contribute deferred, merge, and once metadata.
    if (Prop.isIgnoreFirstLoad(prop)) {
        return this.excludeIgnoredProp(prop, path);
    }

    // ScrollProp and other Deferrable types may be configured to defer.
    if (Prop.isDeferrable(prop) && prop.shouldDefer()) {
        return this.excludeDeferredProp(prop, path);
    }

    // Once-props the client already holds are excluded on Inertia visits.
    if (this.isInertia && this.wasAlreadyLoadedByClient(prop, path)) {
        this.collectOnceMetadata(path, prop);
        return true;
    }

    return false;
};

PropsResolver.prototype.excludeIgnoredProp = function (prop, path) {
    if (Prop.isDeferrable(prop) && prop.shouldDefer() && !this.wasAlreadyLoadedByClient(prop, path)) {
        this.collectDeferredPropMetadata(path, prop);
    }
    if (Prop.isMergeable(prop) && prop.shouldMerge()) {
        this.collectMergeableMetadata(path, prop);
    }
    if (Prop.isOnceable(prop) && prop.shouldResolveOnce()) {
        this.collectOnceMetadata(path, prop);
    }
    return true;
};

PropsResolver.prototype.excludeDeferredProp = function (prop, path) {
    this.collectDeferredPropMetadata(path, prop);
    if (Prop.isMergeable(prop) && prop.shouldMerge()) {
        this.collectMergeableMetadata(path, prop);
    }
    return true;
};

PropsResolver.prototype.wasAlreadyLoadedByClient = function (prop, path) {
    return Prop.isOnceable(prop)
        && prop.shouldResolveOnce()
        && !prop.shouldBeRefreshed()
        && this.loadedOnceProps.indexOf(prop.getKey() || path) !== -1;
};

/**
 * Resolve a single prop value. Rescuable props swallow resolver errors,
 * reporting the path in rescuedProps instead of failing the response.
 */
PropsResolver.prototype.resolveValue = function (value, path) {
    if (Prop.isScroll(value)) {
        value.configureMergeIntent(this.header(Headers.INFINITE_SCROLL_MERGE_INTENT));
    }

    var shouldRescue = Prop.isRescuable(value) && value.shouldRescue();

    try {
        return Prop.isPropType(value) ? value.resolve() : Prop.resolveCallable(value);
    } catch (e) {
        if (!shouldRescue) throw e;
        if (this.onRescuedError) this.onRescuedError(e, path);
        this.rescuedProps.push(path);
        return null;
    }
};

/**
 * Collect metadata for a prop that will be included in the response.
 */
PropsResolver.prototype.collectMetadata = function (prop, path) {
    if (Prop.isMergeable(prop) && prop.shouldMerge()) {
        this.collectMergeableMetadata(path, prop);
    }
    if (Prop.isScroll(prop)) {
        this.scrollProps[path] = Object.assign({}, prop.metadata(), {
            reset: this.resetProps.indexOf(path) !== -1
        });
    }
    if (Prop.isOnceable(prop) && prop.shouldResolveOnce()) {
        this.collectOnceMetadata(path, prop);
    }
};

PropsResolver.prototype.collectDeferredPropMetadata = function (path, prop) {
    var group = prop.group();
    if (!this.deferredProps[group]) this.deferredProps[group] = [];
    this.deferredProps[group].push(path);
};

PropsResolver.prototype.collectMergeableMetadata = function (path, prop) {
    if (this.resetProps.indexOf(path) !== -1) return;
    if (this.isPartial && !this.isIncludedInPartialMetadata(path)) return;

    var i;
    if (prop.shouldDeepMerge()) {
        this.deepMergeProps.push(path);
    } else if (prop.appendsAtRoot()) {
        this.mergeProps.push(path);
    } else if (prop.prependsAtRoot()) {
        this.prependProps.push(path);
    } else {
        var appendPaths = prop.appendsAtPaths();
        for (i = 0; i < appendPaths.length; i++) {
            this.mergeProps.push(path + '.' + appendPaths[i]);
        }
        var prependPaths = prop.prependsAtPaths();
        for (i = 0; i < prependPaths.length; i++) {
            this.prependProps.push(path + '.' + prependPaths[i]);
        }
    }

    var strategies = prop.matchesOn();
    for (i = 0; i < strategies.length; i++) {
        this.matchPropsOn.push(path + '.' + strategies[i]);
    }
};

PropsResolver.prototype.collectOnceMetadata = function (path, prop) {
    if (!Prop.isOnceable(prop) || !prop.shouldResolveOnce()) return;
    if (this.isPartial && !this.isIncludedInPartialMetadata(path)) return;

    this.onceProps[prop.getKey() || path] = {
        prop: path,
        expiresAt: prop.expiresAt()
    };
};

/**
 * Stricter than pathMatchesPartialRequest: metadata is only emitted for paths
 * actually selected, not for ancestors traversed via leadsToOnly.
 */
PropsResolver.prototype.isIncludedInPartialMetadata = function (path) {
    if (this.only !== null && !this.matchesOnly(path)) return false;
    if (this.except !== null && this.matchesExcept(path)) return false;
    return true;
};

PropsResolver.prototype.matchesOnly = function (path) {
    for (var i = 0; i < this.only.length; i++) {
        var onlyPath = this.only[i];
        if (path === onlyPath || path.indexOf(onlyPath + '.') === 0) return true;
    }
    return false;
};

PropsResolver.prototype.leadsToOnly = function (path) {
    for (var i = 0; i < this.only.length; i++) {
        if (this.only[i].indexOf(path + '.') === 0) return true;
    }
    return false;
};

PropsResolver.prototype.matchesExcept = function (path) {
    for (var i = 0; i < this.except.length; i++) {
        var exceptPath = this.except[i];
        if (path === exceptPath || path.indexOf(exceptPath + '.') === 0) return true;
    }
    return false;
};

/**
 * Unpack top-level dot-notation keys into nested objects.
 */
PropsResolver.prototype.unpackDotProps = function (props) {
    var keys = Object.keys(props);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.indexOf('.') === -1) continue;

        var value = props[key];
        if (typeof value === 'function') value = value();

        this.ensurePathIsTraversable(props, key);
        utils.deepSet(props, key, value);
        delete props[key];
    }
    return props;
};

/**
 * Resolve closures along the intermediate segments of a dot-notation path so
 * deepSet can nest into them.
 */
PropsResolver.prototype.ensurePathIsTraversable = function (props, dotKey) {
    var segments = dotKey.split('.');
    segments.pop();

    var current = props;
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (!(segment in current) || current[segment] === undefined) return;

        if (typeof current[segment] === 'function') {
            current[segment] = current[segment]();
        }
        if (!isContainer(current[segment])) return;

        current = current[segment];
    }
};

module.exports = PropsResolver;
