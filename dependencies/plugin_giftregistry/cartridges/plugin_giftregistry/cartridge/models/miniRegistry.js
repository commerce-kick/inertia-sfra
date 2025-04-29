'use strict';

var URLUtils = require('dw/web/URLUtils');

/**
 * Create object with minimal properties form the productList
 * @param {dw.customer.ProductList} productList - User's productlist
 * @param {string} queryStringArgs - encoded URI component that contains the information
 *                 about the product to add to the gift registry
 * @constructor
 */
function miniRegistryModel(productList, queryStringArgs) {
    this.UUID = productList.UUID;
    this.eventDate = productList.eventDate;
    this.eventCity = productList.eventCity;
    this.eventState = productList.eventState;
    this.eventName = productList.name;
    this.url = URLUtils.url('GiftRegistry-AddProduct', 'id', productList.UUID, 'args', queryStringArgs);
}

module.exports = miniRegistryModel;
