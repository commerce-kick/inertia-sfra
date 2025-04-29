'use strict';

var base = require('*/cartridge/models/productListItem');

/**
 * giftregistry item class that represents an productListItem
 * @param {dw.customer.ProductListItem} productListItemObject - Item in a product list
 * @constructor
 */
function GiftRegistryItem(productListItemObject) {
    var URLUtils = require('dw/web/URLUtils');

    base.call(this, productListItemObject);
    this.productListItem.desiredQuantity = productListItemObject.getQuantityValue();
    this.productListItem.purchasedQuantity = productListItemObject.getPurchasedQuantityValue();
    this.productListItem.getProductUrl = URLUtils.url(
        'GiftRegistry-GetProduct',
        'pid',
        productListItemObject.productID,
        'id',
        productListItemObject.list.ID,
        'UUID',
        productListItemObject.UUID,
        'purchasedQuantity',
        this.productListItem.purchasedQuantity,
        'desiredQuantity',
        this.productListItem.desiredQuantity
    ).relative().toString();
}

module.exports = GiftRegistryItem;
