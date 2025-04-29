'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var address1 = {
    UUID: 123,
    address1: '15 South Point Drive',
    address2: null,
    city: 'Boston',
    countryCode: {
        displayValue: 'United States',
        value: 'US'
    },
    firstName: 'John',
    lastName: 'Snow',
    ID: 'Home',
    postalCode: '02125',
    stateCode: 'MA',
    isEquivalentAddress: function () { return true; }
};

var address2 = {
    UUID: 456,
    address1: '5 Wall Street',
    address2: null,
    city: 'Burlington',
    countryCode: {
        displayValue: 'United States',
        value: 'US'
    },
    firstName: 'Sherlock',
    lastName: 'Holmes',
    ID: 'Office',
    postalCode: '01803',
    stateCode: 'MA',
    isEquivalentAddress: function () { return false; }
};

var customer = {
    addressBook: {
        addresses: [],
        preferredAddress: {}
    }
};

var basket = {
    shipments: [{
        shippingAddress: address2,
        custom: {
            fromStoreId: false
        },
        isDefault: function () { return true; }
    }]
};

var AddressSelectorModel = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/addressSelector', {
    '*/cartridge/models/address': function () {
        return address1;
    },
    '*/cartridge/scripts/util/collections': require('../../../mocks/util/collections'),
    '*/cartridge/models/shipping/shippingMethod': function () {
        return {};
    }
});

describe('addressSelector', function () {
    it('should handle logged in user with no saved address and no shipping addresses', function () {
        var result = new AddressSelectorModel(null, customer);
        assert.deepEqual(result.addresses.customerAddresses, []);
        assert.isNull(result.addresses.shipmentAddresses);
    });

    it('should create model for logged in user and saved address', function () {
        customer.addressBook.addresses.push(address1);
        var result = new AddressSelectorModel(null, customer);
        assert.deepEqual(result.addresses.customerAddresses[0], address1);
    });

    it('should create model for logged in user with shipping address', function () {
        var result = new AddressSelectorModel(basket, customer);
        assert.deepEqual(result.addresses.customerAddresses[0], address1);
        assert.deepEqual(result.addresses.shipmentAddresses[0], address1);
    });

    it('should create model for logged in user with shipping address from store ID', function () {
        basket.shipments[0].custom.fromStoreId = true;
        var result = new AddressSelectorModel(basket, customer);
        assert.deepEqual(result.addresses.customerAddresses[0], address1);
        assert.deepEqual(result.addresses.shipmentAddresses[0], address1);
    });

    it('should create model for logged in user with shipping address and no matching address', function () {
        customer.addressBook.addresses = [address2];
        var result = new AddressSelectorModel(basket, customer);
        assert.deepEqual(result.addresses.customerAddresses[0], address1);
        assert.deepEqual(result.addresses.shipmentAddresses[0], address1);
    });

    it('should create model for logged in user with shipping address and no saved address', function () {
        customer.addressBook = null;
        var result = new AddressSelectorModel(basket, customer);
        assert.deepEqual(result.addresses.customerAddresses, []);
        assert.deepEqual(result.addresses.shipmentAddresses[0], address1);
    });

    it('should create model for guest user with no shipments', function () {
        AddressSelectorModel = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/addressSelector', {
            '*/cartridge/models/address': function () {
                return null;
            },
            '*/cartridge/scripts/util/collections': require('../../../mocks/util/collections'),
            '*/cartridge/models/shipping/shippingMethod': function () {
                return {};
            }
        });
        basket.shipments = [];
        var result = new AddressSelectorModel(basket, {});
        assert.deepEqual(result.addresses.shipmentAddresses, []);
        assert.deepEqual(result.addresses.customerAddresses, []);
    });
});
