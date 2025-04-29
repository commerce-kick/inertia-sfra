'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var productListMgr = require('dw/customer/ProductListMgr');
    var giftRegistryListDecorator = require('*/cartridge/models/account/decorators/giftRegistryList');
    var quantityToShow = 2;

    var viewData = res.getViewData();
    var apiGiftRegistryList = productListMgr.getProductLists(req.currentCustomer.raw, '11');
    giftRegistryListDecorator(viewData.account, apiGiftRegistryList, quantityToShow, 1);

    res.setViewData({
        account: viewData.account,
        pageSize: quantityToShow
    });
    next();
});

module.exports = server.exports();
