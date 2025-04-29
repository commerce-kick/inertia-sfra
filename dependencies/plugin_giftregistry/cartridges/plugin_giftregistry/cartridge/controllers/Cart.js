'use strict';

var server = require('server');
server.extend(module.superModule);

server.post('AddProductListItem', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');

    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var CartModel = require('*/cartridge/models/cart');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var ProductLineItemsModel = require('*/cartridge/models/productLineItems');

    var cartModel;
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var previousBonusDiscountLineItems = currentBasket.getBonusDiscountLineItems();
    var productListID = req.form.plid;
    var productListItemID = req.form.pid;
    var quantity = req.form.qty ? parseInt(req.form.qty, 10) : 1;
    var quantityTotal;
    var result;
    var urlObject = {
        url: URLUtils.url('Cart-ChooseBonusProducts').toString(),
        configureProductstUrl: URLUtils.url('Product-ShowBonusProducts').toString(),
        addToCartUrl: URLUtils.url('Cart-AddBonusProducts').toString()
    };

    if (currentBasket) {
        Transaction.wrap(function () {
            result = cartHelper.addProductListItemToCart(
                currentBasket,
                productListItemID,
                quantity,
                productListID
            );

            if (!result.error) {
                cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
                basketCalculationHelpers.calculateTotals(currentBasket);
            }
        });
    }

    quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);
    cartModel = new CartModel(currentBasket);

    var newBonusDiscountLineItem = cartHelper.getNewBonusDiscountLineItem(
        currentBasket,
        previousBonusDiscountLineItems,
        urlObject,
        result.uuid
    );

    if (newBonusDiscountLineItem) {
        var allLineItems = currentBasket.allProductLineItems;
        var collections = require('*/cartridge/scripts/util/collections');
        collections.forEach(allLineItems, function (pli) {
            if (pli.UUID === result.uuid) {
                Transaction.wrap(function () {
                    pli.custom.bonusProductLineItemUUID = 'bonus'; // eslint-disable-line no-param-reassign
                    pli.custom.preOrderUUID = pli.UUID; // eslint-disable-line no-param-reassign
                });
            }
        });
    }

    var reportingURL = cartHelper.getReportingUrlAddToCart(currentBasket, result.error);

    res.json({
        reportingURL: reportingURL,
        quantityTotal: quantityTotal,
        msg: result.message,
        cart: cartModel,
        newBonusDiscountLineItem: newBonusDiscountLineItem || {},
        success: result.success,
        pliUUID: result.uuid
    });
    next();
});

module.exports = server.exports();
