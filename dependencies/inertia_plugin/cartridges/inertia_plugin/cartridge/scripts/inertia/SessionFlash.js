'use strict';

/**
 * One-shot session state for the Inertia adapter (flash data, validation error
 * bags, clearHistory / preserveFragment flags).
 *
 * Laravel keeps these in session flash (one request lifetime, re-flashed across
 * redirects). SFCC has no flash concept and session.privacy accepts only
 * primitives, so values are stored as JSON strings under "inertia_"-prefixed
 * keys and deleted only when pulled. Pulls happen exclusively while building a
 * rendered Inertia page, so the state survives redirects and version-409s
 * without an explicit reflash. Divergence from Laravel (documented): state
 * written but never followed by a rendered Inertia page persists until the
 * next render instead of expiring after one request.
 */

var Logger = require('dw/system/Logger');

// session.privacy string attributes are capped by the platform (~2000 chars).
var MAX_LENGTH = 2000;

var PREFIX = 'inertia_';

function storageKey(key) {
    return PREFIX + key;
}

/**
 * Remote includes (e.g. Inertia-Head) run as separate requests against the
 * same session and must never consume one-shot state meant for the page.
 * @returns {Boolean}
 */
function isIncludeRequest() {
    try {
        return typeof request !== 'undefined' && !!request.includeRequest;
    } catch (e) {
        return false;
    }
}

/**
 * Store a JSON-serializable value.
 * @param {String} key
 * @param {*} value
 * @returns {Boolean} false when the value was too large to store
 */
function put(key, value) {
    var encoded;
    try {
        encoded = JSON.stringify(value);
    } catch (e) {
        Logger.warn('Inertia SessionFlash: value for "{0}" is not JSON-serializable: {1}', key, e.message);
        return false;
    }
    if (encoded === undefined) return false;
    if (encoded.length > MAX_LENGTH) {
        Logger.warn(
            'Inertia SessionFlash: value for "{0}" is {1} chars, exceeding the ~{2} char session.privacy limit; dropped.',
            key, encoded.length, MAX_LENGTH
        );
        return false;
    }
    session.privacy[storageKey(key)] = encoded;
    return true;
}

/**
 * Read without deleting.
 * @param {String} key
 * @param {*} [defaultValue]
 * @returns {*}
 */
function peek(key, defaultValue) {
    var raw = session.privacy[storageKey(key)];
    if (raw === null || raw === undefined) return defaultValue;
    try {
        return JSON.parse(String(raw));
    } catch (e) {
        Logger.warn('Inertia SessionFlash: corrupt JSON for "{0}"; discarded.', key);
        // session.privacy is a host object — clear by assigning null (delete is
        // unreliable on SFCC custom attribute containers).
        session.privacy[storageKey(key)] = null;
        return defaultValue;
    }
}

/**
 * Read and delete. No-ops (peek only) inside remote include requests.
 * @param {String} key
 * @param {*} [defaultValue]
 * @returns {*}
 */
function pull(key, defaultValue) {
    var value = peek(key, defaultValue);
    if (!isIncludeRequest()) {
        session.privacy[storageKey(key)] = null;
    }
    return value;
}

/**
 * Shallow-merge an object into the stored object value.
 * @param {String} key
 * @param {Object} obj
 */
function merge(key, obj) {
    var current = peek(key, {});
    var target = Object.prototype.toString.call(current) === '[object Object]' ? current : {};
    Object.keys(obj || {}).forEach(function (k) {
        target[k] = obj[k];
    });
    return put(key, target);
}

/**
 * Set a boolean one-shot flag.
 * @param {String} key
 */
function setFlag(key) {
    session.privacy[storageKey(key)] = '1';
}

/**
 * Read and clear a boolean flag. No-op clear inside remote includes.
 * @param {String} key
 * @returns {Boolean}
 */
function pullFlag(key) {
    var raw = session.privacy[storageKey(key)];
    if (!isIncludeRequest()) {
        session.privacy[storageKey(key)] = null;
    }
    return raw === '1' || raw === true;
}

module.exports = {
    put: put,
    peek: peek,
    pull: pull,
    merge: merge,
    setFlag: setFlag,
    pullFlag: pullFlag,
    KEYS: {
        FLASH: 'flash',
        ERRORS: 'errors',
        CLEAR_HISTORY: 'clear_history',
        PRESERVE_FRAGMENT: 'preserve_fragment'
    }
};
