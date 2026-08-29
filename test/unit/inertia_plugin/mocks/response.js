'use strict';

/**
 * Recorder mock of the SFRA `res` object (modules/server/response.js).
 * Records everything the adapter does so tests can assert on it.
 */
function createResponse(opts) {
    opts = opts || {};
    var res = {
        headers: {},
        statusCode: 200,
        redirectUrl: undefined,
        redirectStatus: undefined,
        renderings: [],
        jsonData: undefined,
        printed: [],
        viewData: opts.viewData || {},
        base: {},

        setHttpHeader: function (name, value) {
            this.headers[name] = value;
        },
        setStatusCode: function (code) {
            this.statusCode = code;
        },
        // Mirrors SFRA's appendRenderings: a new 'render' entry REPLACES the
        // last queued one (modules/server/response.js:34) — this is what lets
        // res.json() supersede a base controller's ISML rendering.
        appendRendering: function (entry) {
            for (var i = this.renderings.length - 1; i >= 0; i--) {
                if (this.renderings[i].type === 'render') {
                    this.renderings[i] = entry;
                    return;
                }
            }
            this.renderings.push(entry);
        },
        // Mirrors SFRA's json(): merges the payload into viewData and the
        // body is the WHOLE viewData bag (modules/server/response.js:70,
        // render.js:35) — the pollution the adapter must guard against.
        json: function (data) {
            this.isJson = true;
            this.viewData = Object.assign(this.viewData, data);
            this.jsonData = this.viewData;
            this.contentType = 'application/json';
            this.appendRendering({ type: 'render', subType: 'json' });
        },
        setContentType: function (type) {
            this.contentType = type;
        },
        print: function (message) {
            this.printed.push(message);
            this.renderings.push({ type: 'print', message: message });
        },
        render: function (view, data) {
            if (data) {
                var self = this;
                Object.keys(data).forEach(function (k) { self.viewData[k] = data[k]; });
            }
            this.appendRendering({ type: 'render', subType: 'isml', view: view });
        },
        redirect: function (url) {
            this.redirectUrl = url;
        },
        setRedirectStatus: function (status) {
            this.redirectStatus = status;
        },
        getViewData: function () {
            return this.viewData;
        },
        setViewData: function (data) {
            var self = this;
            Object.keys(data || {}).forEach(function (k) { self.viewData[k] = data[k]; });
        },
        cacheExpiration: function () {}
    };
    return res;
}

module.exports = createResponse;
