'use strict';

var URLUtils = require('dw/web/URLUtils');

module.exports = function (object) {
    Object.defineProperty(object, 'giftRegistryLink', {
        enumerable: true,
        value: URLUtils.url('GiftRegistry-AddProductInterceptAjax', 'rurl', 3).relative().toString()
    });
};
