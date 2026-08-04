'use strict';

/**
 * Inertia prop wrapper classes.
 *
 * Port of inertia-laravel's prop classes and traits (MergesProps, DefersProps,
 * ResolvesOnce). Laravel marker interfaces become capability checks (isMergeable,
 * isDeferrable, ...) so the resolver never relies on instanceof, which is fragile
 * when a cartridge module is loaded through different require paths.
 */

/**
 * Resolve a value that may be a callback. Only functions are invoked — a plain
 * string is never treated as callable (parity with Laravel's ResolvesCallables).
 * @param {*} value
 * @returns {*}
 */
function resolveCallable(value) {
    return typeof value === 'function' ? value() : value;
}

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

/* ---------------------------------------------------------------------------
 * Mixin: mergesProps (Laravel trait MergesProps)
 * ------------------------------------------------------------------------- */

function initMergesProps() {
    this._merge = false;
    this._deepMerge = false;
    this._matchOn = [];
    this._append = true;
    this._appendsAtPaths = [];
    this._prependsAtPaths = [];
}

var mergesProps = {
    merge: function () {
        this._merge = true;
        return this;
    },
    deepMerge: function () {
        this._deepMerge = true;
        return this.merge();
    },
    /** @deprecated use deepMerge() */
    deep: function () {
        return this.deepMerge();
    },
    /**
     * @param {String|Array} matchOn - property path(s) to match on for merging
     */
    matchOn: function (matchOn) {
        this._matchOn = Array.isArray(matchOn) ? matchOn.slice() : [matchOn];
        return this;
    },
    /**
     * Append at the root (boolean), at a nested path (string), or several
     * paths at once (array of strings / object of path -> matchOn).
     * @param {Boolean|String|Array|Object} [path]
     * @param {String} [matchOnKey]
     */
    append: function (path, matchOnKey) {
        if (path === undefined) path = true;
        if (typeof path === 'boolean') {
            this._append = path;
        } else if (typeof path === 'string') {
            this._appendsAtPaths.push(path);
        } else if (Array.isArray(path)) {
            for (var i = 0; i < path.length; i++) this.append(path[i]);
        } else if (isPlainObject(path)) {
            for (var key in path) {
                if (Object.prototype.hasOwnProperty.call(path, key)) this.append(key, path[key]);
            }
        }
        if (typeof path === 'string' && matchOnKey) {
            this._matchOn.push(path + '.' + matchOnKey);
        }
        return this;
    },
    /**
     * @param {Boolean|String|Array|Object} [path]
     * @param {String} [matchOnKey]
     */
    prepend: function (path, matchOnKey) {
        if (path === undefined) path = true;
        if (typeof path === 'boolean') {
            this._append = !path;
        } else if (typeof path === 'string') {
            this._prependsAtPaths.push(path);
        } else if (Array.isArray(path)) {
            for (var i = 0; i < path.length; i++) this.prepend(path[i]);
        } else if (isPlainObject(path)) {
            for (var key in path) {
                if (Object.prototype.hasOwnProperty.call(path, key)) this.prepend(key, path[key]);
            }
        }
        if (typeof path === 'string' && matchOnKey) {
            this._matchOn.push(path + '.' + matchOnKey);
        }
        return this;
    },
    shouldMerge: function () {
        return this._merge;
    },
    shouldDeepMerge: function () {
        return this._deepMerge;
    },
    matchesOn: function () {
        return this._matchOn;
    },
    _mergesAtRoot: function () {
        return this._appendsAtPaths.length === 0 && this._prependsAtPaths.length === 0;
    },
    appendsAtRoot: function () {
        return this._append && this._mergesAtRoot();
    },
    prependsAtRoot: function () {
        return !this._append && this._mergesAtRoot();
    },
    appendsAtPaths: function () {
        return this._appendsAtPaths;
    },
    prependsAtPaths: function () {
        return this._prependsAtPaths;
    }
};

/* ---------------------------------------------------------------------------
 * Mixin: defersProps (Laravel trait DefersProps)
 * ------------------------------------------------------------------------- */

function initDefersProps() {
    this._deferred = false;
    this._deferGroup = null;
}

var defersProps = {
    defer: function (group) {
        this._deferred = true;
        this._deferGroup = group === undefined ? null : group;
        return this;
    },
    shouldDefer: function () {
        return this._deferred;
    },
    group: function () {
        return this._deferGroup === null || this._deferGroup === undefined
            ? 'default'
            : this._deferGroup;
    }
};

/* ---------------------------------------------------------------------------
 * Mixin: resolvesOnce (Laravel trait ResolvesOnce)
 * ------------------------------------------------------------------------- */

function initResolvesOnce() {
    this._once = false;
    this._refresh = false;
    this._ttlSeconds = null;
    this._onceKey = null;
}

var resolvesOnce = {
    /**
     * @param {Boolean} [value=true]
     * @param {String} [as] - custom once key
     * @param {Number|Date} [until] - ttl seconds or absolute expiry
     */
    once: function (value, as, until) {
        this._once = value === undefined ? true : !!value;
        if (as !== null && as !== undefined) this.as(as);
        if (until !== null && until !== undefined) this.until(until);
        return this;
    },
    shouldResolveOnce: function () {
        return this._once;
    },
    shouldBeRefreshed: function () {
        return this._refresh;
    },
    getKey: function () {
        return this._onceKey;
    },
    as: function (key) {
        this._onceKey = String(key);
        return this;
    },
    fresh: function (value) {
        this._refresh = value === undefined ? true : !!value;
        return this;
    },
    /**
     * @param {Number|Date} delay - relative seconds or absolute Date
     */
    until: function (delay) {
        if (delay instanceof Date) {
            this._ttlSeconds = Math.max(0, Math.round((delay.getTime() - Date.now()) / 1000));
        } else {
            this._ttlSeconds = Math.max(0, parseInt(delay, 10) || 0);
        }
        return this;
    },
    /**
     * @returns {Number|null} expiration epoch in milliseconds
     */
    expiresAt: function () {
        if (this._ttlSeconds === null) return null;
        return (Math.floor(Date.now() / 1000) + this._ttlSeconds) * 1000;
    }
};

function applyMixins(Ctor, mixins) {
    for (var i = 0; i < mixins.length; i++) {
        Object.assign(Ctor.prototype, mixins[i]);
    }
}

/* ---------------------------------------------------------------------------
 * AlwaysProp — included in every response, bypasses partial filtering
 * ------------------------------------------------------------------------- */

function AlwaysProp(value) {
    this.value = value;
}
AlwaysProp.prototype.__inertiaProp = true;
AlwaysProp.prototype.__alwaysProp = true;
AlwaysProp.prototype.resolve = function () {
    return resolveCallable(this.value);
};

/* ---------------------------------------------------------------------------
 * OptionalProp — omitted on first load, resolved only when requested
 * (LazyProp is a deprecated alias)
 * ------------------------------------------------------------------------- */

function OptionalProp(callback) {
    this.callback = callback;
    initResolvesOnce.call(this);
}
OptionalProp.prototype.__inertiaProp = true;
OptionalProp.prototype.__ignoreFirstLoad = true;
applyMixins(OptionalProp, [resolvesOnce]);
OptionalProp.prototype.resolve = function () {
    return resolveCallable(this.callback);
};

/* ---------------------------------------------------------------------------
 * DeferProp — omitted on first load, announced in deferredProps
 * ------------------------------------------------------------------------- */

/**
 * @param {Function} callback
 * @param {String} [group='default']
 * @param {Boolean} [rescue=false] - swallow resolver errors, report in rescuedProps
 */
function DeferProp(callback, group, rescue) {
    this.callback = callback;
    this._rescue = !!rescue;
    initMergesProps.call(this);
    initDefersProps.call(this);
    initResolvesOnce.call(this);
    this.defer(group);
}
DeferProp.prototype.__inertiaProp = true;
DeferProp.prototype.__ignoreFirstLoad = true;
applyMixins(DeferProp, [mergesProps, defersProps, resolvesOnce]);
DeferProp.prototype.shouldRescue = function () {
    return this._rescue;
};
DeferProp.prototype.resolve = function () {
    return resolveCallable(this.callback);
};

/* ---------------------------------------------------------------------------
 * MergeProp — merged with existing client-side data on the client
 * ------------------------------------------------------------------------- */

function MergeProp(value) {
    this.value = value;
    initMergesProps.call(this);
    initResolvesOnce.call(this);
    this._merge = true;
}
MergeProp.prototype.__inertiaProp = true;
applyMixins(MergeProp, [mergesProps, resolvesOnce]);
MergeProp.prototype.resolve = function () {
    return resolveCallable(this.value);
};

/* ---------------------------------------------------------------------------
 * OnceProp — resolved once; client remembers via X-Inertia-Except-Once-Props
 * ------------------------------------------------------------------------- */

function OnceProp(callback) {
    this.callback = callback;
    initResolvesOnce.call(this);
    this._once = true;
}
OnceProp.prototype.__inertiaProp = true;
applyMixins(OnceProp, [resolvesOnce]);
OnceProp.prototype.resolve = function () {
    return resolveCallable(this.callback);
};

/* ---------------------------------------------------------------------------
 * ScrollProp — paginated prop for infinite scroll
 * ------------------------------------------------------------------------- */

/**
 * @param {*} value - paginator object (e.g. createPaginator result) or callback
 * @param {String} [wrapper='data'] - key holding the item array
 * @param {Object|Function} [metadata] - {pageName, previousPage, nextPage,
 *   currentPage} or a function(resolvedValue) returning that shape; defaults
 *   to reading resolvedValue.meta (the createPaginator shape)
 */
function ScrollProp(value, wrapper, metadata) {
    this.value = value;
    this.wrapper = wrapper || 'data';
    this._metadataProvider = metadata || null;
    this._resolved = undefined;
    this._hasResolved = false;
    initMergesProps.call(this);
    initDefersProps.call(this);
    this._merge = true;
}
ScrollProp.prototype.__inertiaProp = true;
ScrollProp.prototype.__scrollProp = true;
applyMixins(ScrollProp, [mergesProps, defersProps]);
ScrollProp.prototype.resolve = function () {
    if (!this._hasResolved) {
        this._resolved = resolveCallable(this.value);
        this._hasResolved = true;
    }
    return this._resolved;
};
/**
 * The frontend InfiniteScroll component sends its merge intent directly.
 * @param {String|null} intentHeaderValue - value of X-Inertia-Infinite-Scroll-Merge-Intent
 */
ScrollProp.prototype.configureMergeIntent = function (intentHeaderValue) {
    return intentHeaderValue === 'prepend'
        ? this.prepend(this.wrapper)
        : this.append(this.wrapper);
};
/**
 * @returns {Object} {pageName, previousPage, nextPage, currentPage}
 */
ScrollProp.prototype.metadata = function () {
    var provider = this._metadataProvider;
    if (typeof provider === 'function') {
        provider = provider(this.resolve());
    }
    if (!provider) {
        var value = this.resolve();
        provider = (value && value.meta) || {};
    }
    return {
        pageName: provider.pageName !== undefined ? provider.pageName : null,
        previousPage: provider.previousPage !== undefined ? provider.previousPage : null,
        nextPage: provider.nextPage !== undefined ? provider.nextPage : null,
        currentPage: provider.currentPage !== undefined ? provider.currentPage : null
    };
};

/* ---------------------------------------------------------------------------
 * Capability checks (Laravel marker interfaces)
 * ------------------------------------------------------------------------- */

function isPropType(value) {
    return !!(value && value.__inertiaProp === true);
}
function isAlways(value) {
    return !!(value && value.__alwaysProp === true);
}
function isIgnoreFirstLoad(value) {
    return !!(value && value.__ignoreFirstLoad === true);
}
function isScroll(value) {
    return !!(value && value.__scrollProp === true);
}
function isDeferrable(value) {
    return !!(value && typeof value.shouldDefer === 'function');
}
function isMergeable(value) {
    return !!(value && typeof value.shouldMerge === 'function');
}
function isOnceable(value) {
    return !!(value && typeof value.shouldResolveOnce === 'function');
}
function isRescuable(value) {
    return !!(value && typeof value.shouldRescue === 'function');
}

module.exports = {
    AlwaysProp: AlwaysProp,
    OptionalProp: OptionalProp,
    LazyProp: OptionalProp, // deprecated alias
    DeferProp: DeferProp,
    MergeProp: MergeProp,
    OnceProp: OnceProp,
    ScrollProp: ScrollProp,

    resolveCallable: resolveCallable,
    isPropType: isPropType,
    isAlways: isAlways,
    isIgnoreFirstLoad: isIgnoreFirstLoad,
    isScroll: isScroll,
    isDeferrable: isDeferrable,
    isMergeable: isMergeable,
    isOnceable: isOnceable,
    isRescuable: isRescuable
};
