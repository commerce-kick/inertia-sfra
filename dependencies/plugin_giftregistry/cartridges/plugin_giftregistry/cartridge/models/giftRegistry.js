'use strict';

var base = require('*/cartridge/models/productList');
var GiftRegistryItemModel = require('*/cartridge/models/giftRegistryItem');
var registryHelpers = require('*/cartridge/scripts/helpers/giftRegistryHelpers');

/**
 * constructs an object representing the event registrant
 * @param {dw.customer.ProductListRegistrant} registrant - regitraint of a productlist
 * @return {Object} an object representing the registrant
 */
function getRegistrant(registrant) {
    if (registrant) {
        var result = {};
        result.firstName = registrant.firstName;
        result.lastName = registrant.lastName;
        result.role = registrant.role;
        result.email = registrant.email;
        return result;
    }
    return null;
}

/**
 * constructs an object representing the event address
 * @param {dw.customer.CustomerAddress} shippingAddress - address of a productlist
 * @return {Object} an object representing the address
 */
function getAddress(shippingAddress) {
    if (shippingAddress) {
        var result = {};
        result.name = shippingAddress.ID;
        result.uuid = shippingAddress.getUUID();
        result.firstName = shippingAddress.firstName;
        result.lastName = shippingAddress.lastName;
        result.address1 = shippingAddress.address1;
        result.address2 = shippingAddress.address2 || null;
        result.city = shippingAddress.city;
        result.stateCode = shippingAddress.stateCode || null;
        result.postalCode = shippingAddress.postalCode;
        result.phone = shippingAddress.phone;
        result.country = {
            value: shippingAddress.countryCode.value,
            displayValue: shippingAddress.countryCode.displayValue
        };
        return result;
    }
    return null;
}

/**
 * @typedef config
 * @type Object
 * @property {string} pageSize - size of the page (of items)
 * @property {Number} pageNumber - describes the current page being viewed
 * @property {Boolean} publicView - boolean to indicate if this is to be viewed in a public setting or a private one
 */
/**
 * List class that represents a productList
 * @param {dw.customer.ProductList} productListObject - User's productlist
 * @param {Object} config - configuration object
 * @constructor
 */
function GiftRegistry(productListObject, config) {
    base.call(this, productListObject, config);

    if (productListObject) {
        this.productList.name = productListObject.name;

        this.productList.eventInfo = {
            date: productListObject.eventDate,
            dateObj: registryHelpers.getDateObj(productListObject.eventDate),
            country: productListObject.eventCountry,
            state: productListObject.eventState,
            city: productListObject.eventCity
        };

        this.productList.registrant = getRegistrant(productListObject.registrant);
        this.productList.coRegistrant = getRegistrant(productListObject.coRegistrant);
        this.productList.preEventShippingAddress = getAddress(productListObject.shippingAddress);
        this.productList.postEventShippingAddress = getAddress(productListObject.postEventShippingAddress);
        this.productList.ID = productListObject.ID;
        this.productList.items = [];
        var result = [];
        var giftRegistryItem;
        var total = 0;

        productListObject.items.toArray().forEach(function (item) {
            giftRegistryItem = new GiftRegistryItemModel(item);
            if (giftRegistryItem && item.product) {
                total++;
                if (!config.publicView || item.public) {
                    result.push(giftRegistryItem.productListItem);
                } else if (config.publicView && !item.public) {
                    total--;
                }
            }
        });

        this.productList.total = total;
        var startingIndex = (config.pageSize * config.pageNumber) - config.pageSize;
        var endIndex = (config.pageSize * config.pageNumber);
        endIndex = endIndex < result.length ? endIndex : result.length;
        this.productList.items = result.slice(startingIndex, endIndex);

        if (productListObject.shippingAddress) {
            var dateNow = new Date();
            if (dateNow > productListObject.eventDate && !!this.productList.postEventShippingAddress) {
                this.productList.currentShippingAddress = this.productList.postEventShippingAddress;
            } else {
                this.productList.currentShippingAddress = this.productList.preEventShippingAddress;
            }
        }
    }
}

module.exports = GiftRegistry;
