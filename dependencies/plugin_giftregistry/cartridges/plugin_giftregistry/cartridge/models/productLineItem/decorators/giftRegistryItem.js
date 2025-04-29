'use strict';

var Resource = require('dw/web/Resource');

module.exports = function (object, lineItem) {
    Object.defineProperty(object, 'giftRegistryItem', {
        enumerable: true,
        value: !!lineItem.productListItem
    });

    Object.defineProperty(object, 'giftRegistryItemTag', {
        enumerable: true,
        value: lineItem.productListItem ? Resource.msgf(
            'line.item.product.list.item.message',
            'giftRegistry',
            null,
            lineItem.productListItem.list.registrant.firstName,
            lineItem.productListItem.list.registrant.lastName
        ) : null
    });
};
