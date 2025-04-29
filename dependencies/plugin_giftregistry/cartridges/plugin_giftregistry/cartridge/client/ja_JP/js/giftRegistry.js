'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('../../default/js/giftRegistry/giftRegistry')(['Y', 'm', 'd']));
});
