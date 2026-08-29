'use strict';

/**
 * Shared helpers for the Inertia adapter.
 */

/**
 * Read a request header, tolerating both dw.util.Map (.get()) and plain-object
 * index access. Returns null when absent or empty.
 * @param {Object} headers - request.httpHeaders (dw Map or plain object)
 * @param {String} name - lowercase header name
 * @returns {String|null}
 */
function getRequestHeader(headers, name) {
    if (!headers) return null;
    var value;
    if (typeof headers.get === 'function') {
        value = headers.get(name);
    } else {
        value = headers[name];
    }
    if (value === null || value === undefined) return null;
    value = String(value);
    return value === '' ? null : value;
}

/**
 * Parse a comma-separated header into a list, dropping empty entries.
 * Returns null when the header is absent or yields no entries — parity with
 * Laravel's PropsResolver::parseHeader (array_filter(explode(...)) ?: null).
 * @param {String|null} value
 * @returns {Array|null}
 */
function parseListHeader(value) {
    if (value === null || value === undefined || value === '') return null;
    var parts = String(value).split(',');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] !== '') out.push(parts[i]);
    }
    return out.length > 0 ? out : null;
}

/**
 * True for plain JS objects only — not arrays, Dates, dw API objects, or prop
 * wrapper instances.
 * @param {*} value
 * @returns {Boolean}
 */
function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]'
        && value.__inertiaProp !== true;
}

/**
 * Set a nested value by dot path, creating intermediate plain objects
 * (Laravel Arr::set).
 * @param {Object} target
 * @param {String} path - dot-separated
 * @param {*} value
 */
function deepSet(target, path, value) {
    var segments = String(path).split('.');
    var node = target;
    for (var i = 0; i < segments.length - 1; i++) {
        var segment = segments[i];
        if (!isPlainObject(node[segment]) && !Array.isArray(node[segment])) {
            node[segment] = {};
        }
        node = node[segment];
    }
    node[segments[segments.length - 1]] = value;
}

/**
 * The segment of a key before the first dot ("auth.user" -> "auth").
 * @param {String} key
 * @returns {String}
 */
function firstSegment(key) {
    key = String(key);
    var index = key.indexOf('.');
    return index === -1 ? key : key.slice(0, index);
}

module.exports = {
    getRequestHeader: getRequestHeader,
    parseListHeader: parseListHeader,
    isPlainObject: isPlainObject,
    deepSet: deepSet,
    firstSegment: firstSegment
};
