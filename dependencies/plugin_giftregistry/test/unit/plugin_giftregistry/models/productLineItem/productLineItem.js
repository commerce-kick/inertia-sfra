'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var mockSuperModule = require('../../../../mockModuleSuperModule');
var baseProductLineItemMock = require('../../../../mocks/models/productLineItem/baseProductLineItem');

describe('productLineItem model', function () {
    var productListItemSpy = sinon.spy();
    mockSuperModule.create(baseProductLineItemMock);
    var productLineItemModel = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/models/productLineItem/productLineItem', {
        '*/cartridge/models/productLineItem/decorators/giftRegistryItem': productListItemSpy
    });

    it('should call productListItem', function () {
        productLineItemModel({}, {}, {});
        assert.isTrue(productListItemSpy.calledOnce);
    });
});
