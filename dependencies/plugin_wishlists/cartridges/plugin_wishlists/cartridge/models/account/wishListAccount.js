'use strict';

var wishlistDecorator = require('*/cartridge/models/account/decorators/wishlist');

/**
 * Decorate an object(account model) with wishlist information
 * @param {Object} object - account Model to be decorated
 * @param {dw.customer.ProductList} wishlist - Current users's wishlist
 *
 * @returns {Object} - Decorated account model
 */
module.exports = function wishListAccount(object, wishlist) {
    wishlistDecorator(object, wishlist);
    return object;
};
