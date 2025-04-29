"use strict";

var ProductListItemModel = require("*/cartridge/models/productListItem");

/**
 * add the last two items from the wishlist to the account model
 * @param {dw.customer.ProductList} apiWishList - Current users's wishlist
 * @returns {Array} an array of the last two items added to the wishlist
 */
function addWishList(apiWishList) {
    var listLength = apiWishList.items.length;
    var i = listLength - 1;
    var numberOfItems = 2;
    var result = [];
    var productListItem;
    if (listLength === 0) {
        return result;
    }

    while (i >= 0 && numberOfItems > 0) {
        productListItem = new ProductListItemModel(apiWishList.items[i], {})
            .productListItem;
        result.push(productListItem);
        i--;
        numberOfItems--;
    }
    return result;
}

module.exports = function (object, apiWishList) {
    Object.defineProperty(object, "wishlist", {
        enumerable: true,
        value: addWishList(apiWishList)
    });
};
