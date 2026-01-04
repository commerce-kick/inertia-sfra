'use strict';

module.exports = {
    // Response Headers (prefixed for SFCC)
    INERTIA: 'X-SF-CC-Inertia',
    VERSION: 'X-SF-CC-Inertia-Version',
    LOCATION: 'X-SF-CC-Inertia-Location',

    // Request Headers (standard)
    INERTIA_REQUEST: 'x-inertia',
    VERSION_REQUEST: 'x-inertia-version',
    PARTIAL_DATA_REQUEST: 'x-inertia-partial-data',
    PARTIAL_EXCEPT_REQUEST: 'x-inertia-partial-except',
    PARTIAL_COMPONENT_REQUEST: 'x-inertia-partial-component',
    RESET: 'x-inertia-reset',
    INFINITE_SCROLL_MERGE_INTENT: 'x-inertia-infinite-scroll-merge-intent'
};
