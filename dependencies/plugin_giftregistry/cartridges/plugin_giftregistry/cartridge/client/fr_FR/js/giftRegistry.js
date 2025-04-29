'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('../../default/js/giftRegistry/giftRegistry')(['d', 'm', 'Y']));
});
