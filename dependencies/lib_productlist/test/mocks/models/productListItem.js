var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var productImagesMock = function () {
    return {
        product: 'some product image'
    };
};

var priceFactoryMock = {
    getPrice: function () {
        return {
            object: 'somre price Object'
        };
    }
};

var PromotionMgrMock = {
    activeCustomerPromotions: {
        getProductPromotions: function () {
            return {
                name: 'promoName'
            };
        }
    }
};

function proxyModel() {
    return proxyquire('../../../cartridges/lib_productlist/cartridge/models/productListItem', {
        '*/cartridge/models/product/productImages': productImagesMock,
        '*/cartridge/scripts/factories/price': priceFactoryMock,
        'dw/campaign/PromotionMgr': PromotionMgrMock,
        '*/cartridge/models/product/decorators/availability': function () {},
        '*/cartridge/models/product/decorators/variationAttributes': function () {},
        '*/cartridge/models/product/decorators/readyToOrder': function () {},
        '*/cartridge/config/preferences': {
            maxOrderQty: 10
        },
        'dw/web/Resource': require('../dw/web/Resource'),
        '*/cartridge/scripts/util/collections': require('../util/collections')
    });
}

module.exports = proxyModel();
