'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var addItemStub = sinon.stub();
var getListStub = sinon.stub();

describe('addProductToRegistry()', function () {
    var addProductToRegistryMiddleware = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/scripts/middleware/addProductToRegistry', {
        '*/cartridge/scripts/productList/productListHelpers': {
            addItem: addItemStub,
            getList: getListStub
        }
    });

    var args = encodeURIComponent(JSON.stringify({ pid: '12345', qty: 1 }));
    var argsNoQty = encodeURIComponent(JSON.stringify({ pid: '12345' }));
    var next = sinon.spy();
    var requestMock = {
        querystring: {},
        currentCustomer: {
            raw: {}
        }
    };
    var responseMock = {
        getViewData: sinon.stub()
    };

    beforeEach(function () {
        next = sinon.spy();
        responseMock.getViewData.reset();
        addItemStub.reset();
        getListStub.reset();
    });

    it('should call next without calling addItem, getViewData, getList', function () {
        addProductToRegistryMiddleware.addToRegistry(requestMock, responseMock, next);

        assert.isTrue(responseMock.getViewData.notCalled);
        assert.isTrue(addItemStub.notCalled);
        assert.isTrue(getListStub.notCalled);

        assert.isTrue(next.calledOnce);
    });

    it('should call next, addItem, getViewData and getList', function () {
        responseMock.getViewData.returns({ ID: 'someID' });
        requestMock.querystring.args = args;
        addProductToRegistryMiddleware.addToRegistry(requestMock, responseMock, next);

        assert.isTrue(responseMock.getViewData.calledOnce);
        assert.isTrue(getListStub.calledOnce);
        assert.isTrue(addItemStub.calledOnce);

        assert.isTrue(next.calledOnce);
    });

    it('should call next, addItem, getViewData and getList when there is no quantity provided', function () {
        responseMock.getViewData.returns({ ID: 'someID' });
        requestMock.querystring.args = argsNoQty;
        addProductToRegistryMiddleware.addToRegistry(requestMock, responseMock, next);

        assert.isTrue(responseMock.getViewData.calledOnce);
        assert.isTrue(getListStub.calledOnce);
        assert.isTrue(addItemStub.calledOnce);

        assert.isTrue(next.calledOnce);
    });
});
