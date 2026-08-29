'use strict';

/**
 * Mock of dw/web/URLUtils. url('Action-Name', k1, v1, ...) returns an object
 * whose toString() yields a stable fake URL for assertions.
 */
function url(action) {
    var args = Array.prototype.slice.call(arguments, 1);
    var query = '';
    for (var i = 0; i < args.length; i += 2) {
        query += (query ? '&' : '?') + args[i] + '=' + args[i + 1];
    }
    var value = '/mock/' + action + query;
    return {
        toString: function () { return value; }
    };
}

module.exports = {
    url: url,
    https: url,
    http: url,
    abs: url
};
