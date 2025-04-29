'use strict';

var server = require('server');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
server.extend(module.superModule);

server.prepend('Login', function (req, res, next) {
    var viewData = res.getViewData();
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    viewData.list = list;
    res.setViewData(viewData);
    next();
});

server.append('Login', function (req, res, next) {
    var viewData = res.getViewData();
    var listGuest = viewData.list;
    if (viewData.authenticatedCustomer) {
        var listLoggedIn = productListHelper.getCurrentOrNewList(viewData.authenticatedCustomer, { type: 10 });
        productListHelper.mergelists(listLoggedIn, listGuest, req, { type: 10 });
        productListHelper.updateWishlistPrivacyCache(req.currentCustomer.raw, req, { type: 10 });
    }
    next();
});

server.prepend('SubmitRegistration', function (req, res, next) {
    var viewData = res.getViewData();
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    viewData.list = list;
    res.setViewData(viewData);
    next();
});

server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();
        var listGuest = viewData.list;
        if (viewData.authenticatedCustomer) {
            var listLoggedIn = productListHelper.getCurrentOrNewList(viewData.authenticatedCustomer, { type: 10 });
            productListHelper.mergelists(listLoggedIn, listGuest, req, { type: 10 });
        }
    });
    next();
});

server.append('Show', function (req, res, next) {
    var wishListAccount = require('*/cartridge/models/account/wishListAccount');
    var wishListType = require('dw/customer/ProductList').TYPE_WISH_LIST;
    var viewData = res.getViewData();
    var apiWishList = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, {
        type: wishListType
    });

    wishListAccount(viewData.account, apiWishList);
    var wishlist = {
        UUID: apiWishList.ID
    };
    res.setViewData({
        account: viewData.account,
        socialLinks: true,
        wishlist: wishlist
    });
    next();
});

module.exports = server.exports();
