'use strict';

module.exports = {
    // Response Headers — SFCC only delivers custom response headers with the
    // X-SF-CC- prefix (declared in config/httpHeadersConf.json); app/config.ts
    // bridges them back to x-inertia-* on the client.
    INERTIA: 'X-SF-CC-Inertia',
    VERSION: 'X-SF-CC-Inertia-Version',
    LOCATION: 'X-SF-CC-Inertia-Location',
    REDIRECT: 'X-SF-CC-Inertia-Redirect',

    // Request Headers (standard, unprefixed — request headers arrive untouched)
    INERTIA_REQUEST: 'x-inertia',
    VERSION_REQUEST: 'x-inertia-version',
    PARTIAL_DATA_REQUEST: 'x-inertia-partial-data',
    PARTIAL_EXCEPT_REQUEST: 'x-inertia-partial-except',
    PARTIAL_COMPONENT_REQUEST: 'x-inertia-partial-component',
    RESET: 'x-inertia-reset',
    EXCEPT_ONCE_PROPS_REQUEST: 'x-inertia-except-once-props',
    ERROR_BAG_REQUEST: 'x-inertia-error-bag',
    INFINITE_SCROLL_MERGE_INTENT: 'x-inertia-infinite-scroll-merge-intent',

    // Prefetch detection (Laravel $request->prefetch())
    PURPOSE_REQUEST: 'purpose',
    SEC_PURPOSE_REQUEST: 'sec-purpose'
};
