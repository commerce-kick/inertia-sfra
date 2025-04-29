'use strict';

var GiftRegistryModel = require('*/cartridge/models/giftRegistry');

/**
 * add gift registries to the account model
 * @param {dw.customer.ProductList} apiGiftRegistryList - Current users's gift registry list
 * @param {number} pageSizeParam - number of gift registries to return
 * @param {number} pageNumberParam - number items per a page
 * @returns {Array} an array of the last two gift registries in ascending order
 */
function addGiftRegistryList(apiGiftRegistryList, pageSizeParam, pageNumberParam) {
    var pageSize = pageSizeParam || apiGiftRegistryList.length;
    var pageNumber = pageNumberParam || 1;
    var sortedRegistries = apiGiftRegistryList.toArray().sort(function (a, b) {
        return a.eventDate.getTime() - b.eventDate.getTime();
    });

    var startingIndex = (pageSize * pageNumber) - pageSize;
    var endIndex = (pageSize * pageNumber);
    endIndex = endIndex < apiGiftRegistryList.length ? endIndex : apiGiftRegistryList.length;

    var registries = sortedRegistries.slice(startingIndex, endIndex).map(function (item) {
        return new GiftRegistryModel(item, {});
    });

    return registries;
}

module.exports = function (object, apiGiftRegistryList, pageSize, pageNumber) {
    Object.defineProperty(object, 'giftRegistryList', {
        enumerable: true,
        value: addGiftRegistryList(apiGiftRegistryList, pageSize, pageNumber)
    });
};
