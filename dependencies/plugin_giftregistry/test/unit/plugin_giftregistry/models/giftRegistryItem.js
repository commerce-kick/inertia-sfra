'use strict';

var assert = require('chai').assert;
var productListItemMock = require('../../../../test/mocks/models/product/productListItem');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var GiftRegistryItem;
var urlUtilsMock = require('../../../../test/mocks/dw.web.URLUtils');

describe('Gift Registry Item', function () {
    before(function () {
        GiftRegistryItem = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistryItem', {
            '*/cartridge/models/productListItem': productListItemMock,
            'dw/web/URLUtils': urlUtilsMock
        });
    });

    it('should do add two properties to the productListItem', function () {
        var expectedResult = {
            desiredQuantity: 2,
            purchasedQuantity: 2,
            getProductUrl: 'someUrl'
        };
        var result = new GiftRegistryItem({
            getQuantityValue: function () {
                return 2;
            },
            getPurchasedQuantityValue: function () {
                return 2;
            },
            list: {
                ID: '1122334455'
            }
        }).productListItem;

        assert.equal(expectedResult.desiredQuantity, result.desiredQuantity);
        assert.equal(expectedResult.purchasedQuantity, result.purchasedQuantity);
        assert.equal(expectedResult.getProductUrl, result.getProductUrl);
    });
});
