'use strict';

var ProductListItemModel = require('*/cartridge/models/productListItem');

/**
 * @typedef config
 * @type Object
 */
/**
 * creates a plain object that represents a productList
 * @param {dw.customer.ProductList} productListObject - User's productList object
 * @param {Object} config - configuration object
 * @returns {Object} an object that contains information about the users productList
 */
function createProductListObject(productListObject, config) {
    var PAGE_SIZE = 15;
    var pageSize = config.pageSize || PAGE_SIZE;
    var pageNumber = config.pageNumber || 1;
    var totalNumber = 0;
    var result;
    var publicView = config.publicView;
    if (productListObject) {
        result = {
            owner: {
                exists: !!productListObject.owner,
                firstName: productListObject.owner ? productListObject.owner.profile.firstName : false,
                lastName: productListObject.owner ? productListObject.owner.profile.lastName : false
            },
            publicList: productListObject.public,
            UUID: productListObject.UUID,
            publicView: publicView,
            pageNumber: pageNumber,
            items: [],
            type: productListObject.type
        };

        var productListItem;
        var count = productListObject.items.getLength();
        productListObject.items.toArray().forEach(function (item) {
            productListItem = new ProductListItemModel(item).productListItem;
            if (productListItem && item.product) {
                if (config.publicView && item.product.master) {
                    count--;
                } else if (totalNumber < (pageSize * pageNumber)) {
                    result.items.push(productListItem);
                    totalNumber++;
                } else {
                    totalNumber++;
                }
            }
        });

        result.length = count;
        result.showMore = !(totalNumber <= pageSize * pageNumber);
        result.pageNumber = pageNumber;
    } else {
        result = null;
    }
    return result;
}

/**
 * @typedef config
 * @type Object
 */
/**
 * List class that represents a productList
 * @param {dw.customer.ProductList} productListObject - User's productlist
 * @param {Object} config - configuration object
 * @constructor
 */
function productList(productListObject, config) {
    this.productList = createProductListObject(productListObject, config);
}

module.exports = productList;
