var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var productListItemMock = require('./productListItem');

function proxyModel() {
    return proxyquire('../../../cartridges/lib_productlist/cartridge/models/productList', {
        '*/cartridge/models/productListItem': productListItemMock
    });
}

module.exports = proxyModel();
