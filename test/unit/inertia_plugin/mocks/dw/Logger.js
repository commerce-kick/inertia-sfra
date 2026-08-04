'use strict';

/**
 * Mock of dw/system/Logger. Records calls for assertions.
 */
function createLoggerMock() {
    var calls = [];
    function record(level) {
        return function () {
            calls.push({ level: level, args: Array.prototype.slice.call(arguments) });
        };
    }
    var logger = {
        error: record('error'),
        warn: record('warn'),
        info: record('info'),
        debug: record('debug')
    };
    return {
        calls: calls,
        error: logger.error,
        warn: logger.warn,
        info: logger.info,
        debug: logger.debug,
        getLogger: function () {
            return logger;
        }
    };
}

module.exports = createLoggerMock;
