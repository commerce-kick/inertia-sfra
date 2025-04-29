'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var lineItemMock = {
    productListItem: null
};

describe('productListItem decorator', function () {
    var giftRegistryLinkDecorator = proxyquire('../../../../../../cartridges/plugin_giftregistry/cartridge/models/productLineItem/decorators/giftRegistryItem', {
        'dw/web/Resource': {
            msgf: function () {
                return 'someString';
            }
        }
    });

    it('should create a property on the passed in object called giftRegistryItem when productListItem is null', function () {
        var object = {};
        giftRegistryLinkDecorator(object, lineItemMock);

        assert.isFalse(object.giftRegistryItem);
    });

    it('should create a property on the passed in object called productListItemTag when productListItem is null', function () {
        var object = {};
        giftRegistryLinkDecorator(object, lineItemMock);

        assert.equal(object.giftRegistryItemTag, null);
    });

    it('should create a property on the passed in object called productListItem', function () {
        var object = {};
        lineItemMock.productListItem = {
            list: {
                registrant: {
                    firstName: 'Test',
                    lastName: 'Tester'
                }
            }
        };
        giftRegistryLinkDecorator(object, lineItemMock);

        assert.isTrue(object.giftRegistryItem);
    });

    it('should create a property on the passed in object called productListItemTag', function () {
        var object = {};
        lineItemMock.productListItem = {
            list: {
                registrant: {
                    firstName: 'Test',
                    lastName: 'Tester'
                }
            }
        };
        giftRegistryLinkDecorator(object, lineItemMock);

        assert.equal(object.giftRegistryItemTag, 'someString');
    });
});
