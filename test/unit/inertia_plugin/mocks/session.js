'use strict';

/**
 * Mock of the SFCC `session` global. `privacy` and `custom` accept only
 * primitives on-platform; the mock doesn't enforce that, tests should.
 */
function createSession() {
    return {
        privacy: {},
        custom: {}
    };
}

module.exports = createSession;
