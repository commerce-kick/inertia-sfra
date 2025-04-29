'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var mockSuperModule = require('../../../../mockModuleSuperModule');
var baseFullProductMock = require('../../../../../test/mocks/models/product/baseFullProduct');

describe('full product model', function () {
    var giftRegistryLinkSpy = sinon.spy();
    mockSuperModule.create(baseFullProductMock);
    var fullProduct = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/models/product/fullProduct', {
        '*/cartridge/models/product/decorators/giftRegistryLink': giftRegistryLinkSpy
    });

    it('should call giftRegistryLink', function () {
        fullProduct({}, {}, {});

        assert.isTrue(giftRegistryLinkSpy.calledOnce);
    });
});
