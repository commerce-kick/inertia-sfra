'use strict';

/**
 * @namespace Inertia
 */

var server = require('server');

var viteTags = require('*/cartridge/helpers/vite');

server.get('Head', function (req, res, next) {
    var page = req.querystring.component;
    var component = 'app/pages/' + page + '.tsx';

    var tags = viteTags(['app/app.tsx', component]);

    res.render('components/inertia/head', {
        tags: tags
    });

    next();
});

module.exports = server.exports();
