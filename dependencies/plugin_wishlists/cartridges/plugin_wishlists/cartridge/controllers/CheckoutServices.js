'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('PlaceOrder', function (req, res, next) {
    var viewData = res.getViewData();

    if (!viewData.error && viewData.orderID && req.currentCustomer.profile) {
        var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
        var collections = require('*/cartridge/scripts/util/collections');
        var OrderMgr = require('dw/order/OrderMgr');

        var order = OrderMgr.getOrder(viewData.orderID);

        collections.forEach(order.productLineItems, function (productLineItem) {
            productListHelper.removeItem(req.currentCustomer.raw, productLineItem.productID, {
                req: req, type: 10, optionId: null, optionValue: null
            }); // get these values
        });
    }

    next();
});

module.exports = server.exports();
