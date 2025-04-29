'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var mockSuperModule = require('../../../../mockModuleSuperModule');
var baseOrderLineItemMock = require('../../../../mocks/models/productLineItem/baseOrderLineItem');

describe('orderLineItem model', function () {
    var productListItemSpy = sinon.spy();
    mockSuperModule.create(baseOrderLineItemMock);
    var fullProduct = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/models/productLineItem/orderLineItem', {
        '*/cartridge/models/productLineItem/decorators/giftRegistryItem': productListItemSpy
    });

    it('should call giftRegistryItem', function () {
        fullProduct({}, {}, {});
        assert.isTrue(productListItemSpy.calledOnce);
    });
});
