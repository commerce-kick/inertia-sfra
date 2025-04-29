'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var apiWishlistMock;

describe('my account wishlist decorator', function () {
    var wishlist = proxyquire('../../../../../../cartridges/plugin_wishlists/cartridge/models/account/decorators/wishlist', {
        '*/cartridge/models/productListItem': function () {

        }
    });

    it('should create a property on the passed in object called wishlist', function () {
        var object = {};
        apiWishlistMock = {
            items: []
        };
        wishlist(object, apiWishlistMock);
        assert.property(object, 'wishlist');
    });

    it('should create a property that has no more than 2 items in it if there are more than two items in the wishlist', function () {
        var object = {};
        apiWishlistMock = {
            items: [{}, {}, {}]
        };
        wishlist(object, apiWishlistMock);
        assert.equal(object.wishlist.length, 2);
    });

    it('should create a property on the passed in object called wishlist with 1 entry if wishlist only has 1 item', function () {
        var object = {};
        apiWishlistMock = {
            items: [{}]
        };
        wishlist(object, apiWishlistMock);
        assert.equal(object.wishlist.length, 1);
    });
});
