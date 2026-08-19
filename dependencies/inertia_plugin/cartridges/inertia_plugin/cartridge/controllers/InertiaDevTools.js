'use strict';

/**
 * @namespace InertiaDevTools
 *
 * Read API for the devtools browser extension (Laravel's EntriesController).
 * The extension fetches GET {origin}/_inertia/devtools/entries?id={id} — that
 * path must be mapped to InertiaDevTools-Entries via a Business Manager alias
 * (aliases are exact-path, hence the id in the query string).
 *
 * Security: 404 everywhere except a dev sandbox running Vite hot mode
 * (DevTools.enabled()), matching the recorder's own gate.
 */

var server = require('server');

server.get('Entries', function (req, res, next) {
    var DevTools = require('*/cartridge/scripts/devtools/DevTools');

    // SFRA's res.json serializes the whole viewData bag — reset it so
    // action/queryString/locale never leak into the entry payload (same trick
    // as Inertia.render).
    res.viewData = {};

    if (!DevTools.enabled()) {
        res.setStatusCode(404);
        res.json({ message: 'Not found.' });
        return next();
    }

    var EntryStore = require('*/cartridge/scripts/devtools/EntryStore');
    var id = req.querystring.id;
    var entry = id ? EntryStore.get(String(id)) : null;

    if (!entry) {
        res.setStatusCode(404);
        res.json({ message: 'Not found.' });
        return next();
    }

    res.json(entry);
    return next();
});

module.exports = server.exports();
