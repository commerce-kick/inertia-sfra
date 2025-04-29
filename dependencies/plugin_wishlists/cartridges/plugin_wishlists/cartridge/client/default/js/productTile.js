'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/productTile'));
    processInclude(require('./product/wishlistHeart'));
});
