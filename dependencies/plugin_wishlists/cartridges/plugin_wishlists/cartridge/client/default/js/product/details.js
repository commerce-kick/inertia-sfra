'use strict';

var base = require('base/product/base');
var detail = require('base/product/detail');

var exportDetails = $.extend({}, base, detail, {});

module.exports = exportDetails;
