'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var mockSuperModule = require('../../../../mockModuleSuperModule');
var baseCartHelpersMock = require('../../../../../test/mocks/scripts/cart/baseCartHelpers');
var collections = require('../../../../mocks/util/collections');
var ArrayList = require('../../../../mocks/dw.util.Collection');

var setQuantityValueStub = sinon.stub();
var createProductLineItemStub = sinon.stub();
var createUUIDStub = sinon.stub();
var resourceMsgMock = sinon.stub();
var resourceMsgfMock = sinon.stub();

var copyCustomerAddressToShipmentSpy = sinon.spy();
var createShipmentSpy = sinon.spy();

var availabilityModelMock = {
    inventoryRecord: {
        ATS: {
            value: 3
        }
    }
};

var productMock = {
    productId: 'productId',
    optionModel: {
        getOption: function () {},
        getOptionValue: function () {},
        setSelectedOptionValue: function () {}
    },
    availabilityModel: availabilityModelMock
};

var productListItemMock = {
    product: productMock,
    productID: 'productId',
    ID: 'productListItemID'
};

var productLineItemMock = {
    productListItem: null,
    productID: 'productId',
    UUID: 'someSpecialUUID',
    setQuantityValue: setQuantityValueStub,
    quantity: {
        value: 1
    },
    product: productMock
};

var productLineItemsMock = new ArrayList([productLineItemMock]);

var currentBasketMock = {
    createShipment: createShipmentSpy,
    createProductLineItem: createProductLineItemStub,
    defaultShipment: {
        productLineItems: productLineItemsMock
    },
    productLineItems: productLineItemsMock
};

var emptyBasketMock = {
    createShipment: createShipmentSpy,
    createProductLineItem: createProductLineItemStub,
    defaultShipment: {
        productLineItems: new ArrayList([])
    },
    productLineItems: new ArrayList([])
};

describe('cartHelpers', function () {
    mockSuperModule.create(baseCartHelpersMock);

    var cartHelpers = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/scripts/cart/cartHelpers', {
        'dw/catalog/ProductMgr': {
            getProduct: function () {
                return productMock;
            }
        },
        'dw/web/Resource': {
            msg: resourceMsgMock,
            msgf: resourceMsgfMock
        },
        '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/scripts/helpers/productHelpers': {
            getOptions: function () {},
            getCurrentOptionModel: function () {
                return {
                    optionId: 'option 1',
                    selectedValueId: '123'
                };
            }
        },
        'dw/util/UUIDUtils': {
            createUUID: createUUIDStub
        },
        '*/cartridge/scripts/checkout/checkoutHelpers': {
            copyCustomerAddressToShipment: copyCustomerAddressToShipmentSpy
        },
        'dw/customer/ProductListMgr': {
            getProductList: function () {
                return {
                    getItem: function () {
                        return productListItemMock;
                    },
                    shippingAddress: {
                        firstName: 'firstName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        city: 'city',
                        stateCode: 'stateCode',
                        postalCode: 'postalCode',
                        countryCode: 'countryCode',
                        phone: 'phone'
                    }
                };
            }
        }
    });

    after(function () {
        mockSuperModule.remove();
    });

    describe('addProductToCart', function () {
        beforeEach(function () {
            setQuantityValueStub.resetHistory();
            createProductLineItemStub.resetHistory();
            createUUIDStub.resetHistory();

            copyCustomerAddressToShipmentSpy.resetHistory();
            createShipmentSpy.resetHistory();
        });

        it('should add a product to the cart when there are no line items in the cart', function () {
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductToCart(emptyBasketMock, 'productId', 1, null, null);

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(1));
        });

        it('should add a product to the cart when item is already in the basket', function () {
            var result = cartHelpers.addProductToCart(currentBasketMock, 'productId', 1, null, null);

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(2));
        });

        it('should increase the quantity in the cart by one if no quantity is passed in', function () {
            var result = cartHelpers.addProductToCart(currentBasketMock, 'productId', null, null, null);

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(2));
        });

        it('should not add a product to the cart when item in cart is at max ATS', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 2;
            productLineItemMock.quantity.value = 2;
            var result = cartHelpers.addProductToCart(currentBasketMock, 'productId', 1, null, null);

            assert.equal(result.uuid, undefined);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.notCalled);
            assert.isTrue(result.error);
            assert.isTrue(resourceMsgMock.calledWith('error.alert.max.quantity.in.cart'));
        });

        it('should increase the quantity of the productLine item in the cart if it has the product list item', function () {
            productLineItemMock.productListItem = productListItemMock;
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductToCart(currentBasketMock, 'productId', 1, null, null);

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(createShipmentSpy.calledOnce);
            assert.isTrue(setQuantityValueStub.calledOnce);
        });

        it('should not add a product to the cart when item has 0 ATS', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 0;
            var result = cartHelpers.addProductToCart(currentBasketMock, 'productId', 1, null, null);

            assert.equal(result.uuid, undefined);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.notCalled);
            assert.isTrue(resourceMsgfMock.calledWith('error.alert.selected.quantity.cannot.be.added.for'));
        });
    });

    describe('addProductListItemToCart', function () {
        beforeEach(function () {
            setQuantityValueStub.resetHistory();
            createProductLineItemStub.resetHistory();
            createUUIDStub.resetHistory();

            copyCustomerAddressToShipmentSpy.resetHistory();
            createShipmentSpy.resetHistory();
        });

        it('should add a product to the cart when there are no line items in the cart', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 3;
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductListItemToCart(emptyBasketMock, 'productListItemID', 1, 'productListID');

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(result.success);
            assert.isTrue(createShipmentSpy.calledOnce);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(1));
        });

        it('should increase the quantity in the cart by one if no quantity is passed in', function () {
            var result = cartHelpers.addProductListItemToCart(currentBasketMock, 'productListItemID', null, 'productListID');

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(result.success);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(3));
        });

        it('should not add a product to the cart when item has is at max ATS', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 2;
            productLineItemMock.quantity.value = 2;
            productLineItemMock.productListItem = productListItemMock;
            var result = cartHelpers.addProductListItemToCart(currentBasketMock, 'productListItemID', 1, 'productListID');

            assert.equal(result.uuid, undefined);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.notCalled);
            assert.isFalse(result.success);
            assert.isTrue(resourceMsgMock.calledWith('error.alert.max.quantity.in.cart'));
        });

        it('should increase the quantity of the productLine item in the cart if it has the product list item', function () {
            productLineItemMock.quantity.value = 1;
            productLineItemMock.productListItem = productListItemMock;
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductListItemToCart(currentBasketMock, 'productListItemID', 1, 'productListID');

            assert.equal(result.uuid, 'someSpecialUUID');
            assert.isTrue(result.success);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.calledOnce);
            assert.isTrue(setQuantityValueStub.calledWith(2));
        });

        it('should not add a product to the cart when item has 1 ATS', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 1;
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductListItemToCart(currentBasketMock, 'productListItemID', 2, 'productListID');

            assert.equal(result.uuid, undefined);
            assert.isFalse(result.success);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.notCalled);
            assert.isTrue(resourceMsgfMock.calledWith('error.alert.selected.quantity.cannot.be.added.for'));
        });

        it('should not add a product to the cart when item has 0 ATS', function () {
            availabilityModelMock.inventoryRecord.ATS.value = 0;
            createProductLineItemStub.returns(productLineItemMock);
            var result = cartHelpers.addProductListItemToCart(currentBasketMock, 'productListItemID', 1, 'productListID');

            assert.equal(result.uuid, undefined);
            assert.isFalse(result.success);
            assert.isTrue(createShipmentSpy.notCalled);
            assert.isTrue(setQuantityValueStub.notCalled);
            assert.isTrue(resourceMsgfMock.calledWith('error.alert.selected.quantity.cannot.be.added.for'));
        });
    });
});
