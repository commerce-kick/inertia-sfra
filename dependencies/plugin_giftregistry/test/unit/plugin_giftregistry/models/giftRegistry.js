'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var ArrayList = require('../../../mocks/dw.util.Collection');
var baseProductListMock = require('../../../../test/mocks/models/baseProductList');
var mockSuperModule = require('../../../mockModuleSuperModule');

var productListObjectMock = {
    name: 'wedding',
    ID: '12345',
    eventCountry: 'US',
    eventState: 'MA',
    eventCity: 'Burlington',
    items: new ArrayList([{
        getQuantityValue: function () {
            return 2;
        },
        getPurchasedQuantityValue: function () {
            return 2;
        },
        list: {
            ID: '1122334455'
        }
    }]),
    registrant: {
        firstName: 'test1',
        lastName: 'user1',
        role: 'groom',
        email: 'testUser1@demandware.com'
    },
    coRegistrant: {
        firstName: 'test2',
        lastName: 'user2',
        role: 'bride',
        email: 'testUser2@demandware.com'
    },
    shippingAddress: {
        ID: 'Home',
        firstName: 'test1',
        lastName: 'user1',
        address1: '5 wall St',
        address2: '',
        city: 'Burlington',
        postalCode: '01801',
        phone: '9878987887',
        getUUID: function () {
            return 'post shipping UUID';
        },
        countryCode: {
            value: 'country value',
            displayValue: 'country display value'
        }
    },
    postEventShippingAddress: {
        ID: 'Home',
        firstName: 'test1',
        lastName: 'user1',
        address1: '5 wall St',
        address2: 'Apt 7',
        city: 'Burlington',
        postalCode: '01801',
        phone: '9878987887',
        getUUID: function () {
            return 'post shipping UUID';
        },
        countryCode: {
            value: 'country value',
            displayValue: 'country display value'
        }
    }
};

var productListObjectMock2 = {
    name: 'wedding',
    eventCountry: 'US',
    eventState: 'MA',
    eventCity: 'Burlington',
    items: new ArrayList([{
        getQuantityValue: function () {
            return 2;
        },
        getPurchasedQuantityValue: function () {
            return 2;
        },
        list: {
            ID: '1122334455'
        },
        product: {},
        public: true

    }]),
    registrant: {
        firstName: 'test1',
        lastName: 'user1',
        role: 'groom',
        email: 'testUser1@demandware.com'
    },
    coRegistrant: null,
    shippingAddress: null,
    postEventShippingAddress: null
};

var productListObjectMock3 = {
    name: 'wedding',
    eventCountry: 'US',
    eventState: 'MA',
    eventCity: 'Burlington',
    items: new ArrayList([{
        getQuantityValue: function () {
            return 2;
        },
        getPurchasedQuantityValue: function () {
            return 2;
        },
        list: {
            ID: '1122334455'
        },
        product: {},
        public: false

    }]),
    registrant: {
        firstName: 'test1',
        lastName: 'user1',
        role: 'groom',
        email: 'testUser1@demandware.com'
    },
    coRegistrant: null,
    shippingAddress: null,
    postEventShippingAddress: null
};

var productListItemMock = require('../../../../test/mocks/models/product/productListItem');
var urlUtilsMock = require('../../../../test/mocks/dw.web.URLUtils');

var registryHelpersMock = {
    getDateObj: function () {
        return new Date();
    }
};

describe('Gift registry model', function () {
    var GiftRegistry;
    mockSuperModule.create(baseProductListMock);
    var giftRegistryItem = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistryItem.js', {
        '*/cartridge/models/productListItem': productListItemMock
    });
    GiftRegistry = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistry.js', {
        '*/cartridge/models/productList': baseProductListMock,
        '*/cartridge/models/giftRegistryItem': giftRegistryItem,
        '*/cartridge/scripts/helpers/giftRegistryHelpers': registryHelpersMock
    });

    before(function () {
        mockSuperModule.create(baseProductListMock);
        var giftRegistryItem = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistryItem.js', { // eslint-disable-line no-shadow
            '*/cartridge/models/productListItem': productListItemMock,
            'dw/web/URLUtils': urlUtilsMock
        });
        GiftRegistry = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistry.js', {
            '*/cartridge/models/productList': baseProductListMock,
            '*/cartridge/models/giftRegistryItem': giftRegistryItem,
            '*/cartridge/scripts/helpers/giftRegistryHelpers': {
                getDateObj: function () {
                    return { d: '22', m: '10', y: '2022' };
                }
            }
        });
    });

    after(function () {
        mockSuperModule.remove();
    });

    it('should return null with a null productListObject.coRegistrant', function () {
        var myList = new GiftRegistry(productListObjectMock2, { publicView: false }, null);
        assert.equal(myList.productList.coRegistrant, null);
    });

    it('should return null with a null productListObject.coRegistrant as a guest', function () {
        var myList = new GiftRegistry(productListObjectMock3, { publicView: true }, null);
        assert.equal(myList.productList.coRegistrant, null);
    });

    it('should return null with a null productListObject.shippingAddress', function () {
        var myList = new GiftRegistry(productListObjectMock2, 2, null);
        assert.equal(myList.productList.shippingAddress, null);
    });

    it('should return null with a null productListObject.postEventShippingAddress', function () {
        var myList = new GiftRegistry(productListObjectMock2, 2, null);
        assert.equal(myList.productList.postEventShippingAddress, null);
    });

    it('should contain eventInfo', function () {
        var myList = new GiftRegistry(productListObjectMock, 2, null);

        assert.equal(myList.productList.name, 'wedding');
        assert.equal(myList.productList.ID, '12345');
        assert.equal(myList.productList.eventInfo.country, 'US');
        assert.equal(myList.productList.eventInfo.state, 'MA');
        assert.equal(myList.productList.eventInfo.city, 'Burlington');

        assert.equal(myList.productList.eventInfo.dateObj.d, '22');
        assert.equal(myList.productList.eventInfo.dateObj.m, '10');
        assert.equal(myList.productList.eventInfo.dateObj.y, '2022');
    });

    it('should return the productList model with a valid productListObject', function () {
        var myList = new GiftRegistry(productListObjectMock, 2, null);

        assert.equal(myList.productList.registrant.firstName, 'test1');
        assert.equal(myList.productList.registrant.lastName, 'user1');
        assert.equal(myList.productList.registrant.role, 'groom');
        assert.equal(myList.productList.registrant.email, 'testUser1@demandware.com');

        assert.equal(myList.productList.coRegistrant.firstName, 'test2');
        assert.equal(myList.productList.coRegistrant.lastName, 'user2');
        assert.equal(myList.productList.coRegistrant.role, 'bride');
        assert.equal(myList.productList.coRegistrant.email, 'testUser2@demandware.com');

        assert.equal(myList.productList.preEventShippingAddress.name, 'Home');
        assert.equal(myList.productList.preEventShippingAddress.firstName, 'test1');
        assert.equal(myList.productList.preEventShippingAddress.lastName, 'user1');
        assert.equal(myList.productList.preEventShippingAddress.address1, '5 wall St');
        assert.equal(myList.productList.preEventShippingAddress.address2, null);
        assert.equal(myList.productList.preEventShippingAddress.city, 'Burlington');
        assert.equal(myList.productList.preEventShippingAddress.postalCode, '01801');
        assert.equal(myList.productList.preEventShippingAddress.phone, '9878987887');

        assert.equal(myList.productList.postEventShippingAddress.name, 'Home');
        assert.equal(myList.productList.postEventShippingAddress.firstName, 'test1');
        assert.equal(myList.productList.postEventShippingAddress.lastName, 'user1');
        assert.equal(myList.productList.postEventShippingAddress.address1, '5 wall St');
        assert.equal(myList.productList.postEventShippingAddress.address2, 'Apt 7');
        assert.equal(myList.productList.postEventShippingAddress.city, 'Burlington');
        assert.equal(myList.productList.postEventShippingAddress.postalCode, '01801');
        assert.equal(myList.productList.postEventShippingAddress.phone, '9878987887');
    });
});
