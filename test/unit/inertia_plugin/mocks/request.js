'use strict';

/**
 * Mocks for the SFCC `request` global and the SFRA `req` object.
 *
 * SFCC's request.httpHeaders is a dw.util.Map supporting both .get(name) and
 * (in Rhino) bracket index access; header names are lowercase. The mock
 * supports both shapes so utils.getRequestHeader can be exercised either way.
 */

function makeHeaders(headers) {
    var store = {};
    Object.keys(headers || {}).forEach(function (key) {
        store[key.toLowerCase()] = headers[key];
    });
    store.get = function (name) {
        var value = store[String(name).toLowerCase()];
        return value === undefined ? null : value;
    };
    store.containsKey = function (name) {
        return Object.prototype.hasOwnProperty.call(store, String(name).toLowerCase());
    };
    return store;
}

/**
 * SFCC global `request`.
 * @param {Object} [opts] - httpMethod, httpPath, httpQueryString, headers,
 *   httpReferer, includeRequest, locale
 */
function createRequest(opts) {
    opts = opts || {};
    return {
        httpMethod: opts.httpMethod || 'GET',
        httpPath: opts.httpPath !== undefined ? opts.httpPath : '/on/demandware.store/Sites-Test-Site/en_US/Home-Show',
        httpQueryString: opts.httpQueryString !== undefined ? opts.httpQueryString : '',
        httpHeaders: makeHeaders(opts.headers),
        httpReferer: opts.httpReferer !== undefined ? opts.httpReferer : null,
        includeRequest: !!opts.includeRequest,
        custom: {}
    };
}

/**
 * SFRA-shape `req` (modules/server/request.js).
 * @param {Object} [opts] - same as createRequest plus querystring, locale, currentCustomer
 */
function createSfraReq(opts) {
    opts = opts || {};
    var base = createRequest(opts);
    return {
        httpMethod: base.httpMethod,
        path: base.httpPath,
        httpHeaders: base.httpHeaders,
        querystring: opts.querystring || {},
        locale: opts.locale || { id: 'en_US' },
        currentCustomer: opts.currentCustomer || { profile: null },
        session: opts.session || null
    };
}

module.exports = {
    makeHeaders: makeHeaders,
    createRequest: createRequest,
    createSfraReq: createSfraReq
};
