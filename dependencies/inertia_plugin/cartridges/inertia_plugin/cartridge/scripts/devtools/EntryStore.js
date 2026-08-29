'use strict';

/**
 * Storage for recorded devtools entries (Laravel's DevTools EntryStore).
 *
 * Backed by a custom CacheMgr cache (registered in the cartridge's caches.json):
 * in-memory, TTL-bound, no metadata or transactions — the right weight for a
 * dev-only recorder. Sandboxes run a single app server, so the extension's
 * separate entries fetch hits the same cache that recorded the entry.
 *
 * Entries are stored as JSON strings. A serialized entry above MAX_ENTRY_BYTES
 * is retried without its heavy parts (propValues, responseBody) so one huge
 * page can never blow the cache's per-entry limits.
 */

var Logger = require('dw/system/Logger');

var CACHE_ID = 'InertiaDevToolsEntries';
var MAX_ENTRY_BYTES = 262144; // 256 KB

function getCache() {
    var CacheMgr = require('dw/system/CacheMgr');
    return CacheMgr.getCache(CACHE_ID);
}

/**
 * @param {String} id - entry id
 * @param {Object} entry - the entry object (Entry shape from the extension)
 */
function put(id, entry) {
    try {
        var json = JSON.stringify(entry);

        if (json.length > MAX_ENTRY_BYTES) {
            delete entry.propValues;
            entry.http.responseBody = { status: 'omitted', reason: 'too-large' };
            json = JSON.stringify(entry);
        }

        getCache().put(String(id), json);
    } catch (e) {
        // Recording is a passive observer — a missing cache registration or an
        // unserializable value must never break the response being recorded.
        Logger.warn('Inertia DevTools: could not store entry {0}: {1}', id, e.message);
    }
}

/**
 * @param {String} id
 * @returns {Object|null} the stored entry, or null when absent/expired
 */
function get(id) {
    try {
        var json = getCache().get(String(id));
        return json ? JSON.parse(json) : null;
    } catch (e) {
        Logger.warn('Inertia DevTools: could not read entry {0}: {1}', id, e.message);
        return null;
    }
}

module.exports = {
    put: put,
    get: get,
    CACHE_ID: CACHE_ID,
    MAX_ENTRY_BYTES: MAX_ENTRY_BYTES
};
