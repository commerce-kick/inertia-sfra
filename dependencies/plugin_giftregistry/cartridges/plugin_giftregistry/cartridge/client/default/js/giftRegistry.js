'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./giftRegistry/giftRegistry')(['m', 'd', 'Y']));
});
