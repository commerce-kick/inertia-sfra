'use strict';

/**
 * Minimal mock of an SFRA Route (modules/server/route.js) — enough to invoke
 * middleware steps with the Route as `this` and fire lifecycle events.
 */
function createRoute() {
    var listeners = {};
    return {
        on: function (event, handler) {
            (listeners[event] = listeners[event] || []).push(handler);
        },
        emit: function (event) {
            var args = Array.prototype.slice.call(arguments, 1);
            (listeners[event] || []).forEach(function (handler) {
                handler.apply(null, args);
            });
        },
        listeners: listeners
    };
}

module.exports = createRoute;
