'use strict';

var base = module.superModule;

var ProductMgr = require('dw/catalog/ProductMgr');
var Resource = require('dw/web/Resource');

var collections = require('*/cartridge/scripts/util/collections');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');

/**
 * Adds a line item for this product to the Cart
 *
 * @param {dw.order.Basket} currentBasket - The current basket
 * @param {dw.catalog.Product} product - the product to add
 * @param {number} quantity - Quantity to add
 * @param {string[]}  childProducts - the products' sub-products
 * @param {dw.catalog.ProductOptionModel} optionModel - the product's option model
 * @param {dw.order.Shipment} defaultShipment - the cart's default shipment method
 * @return {dw.order.ProductLineItem} - The added product line item
 */
function addLineItem(currentBasket, product, quantity, childProducts, optionModel, defaultShipment) {
    var UUIDUtils = require('dw/util/UUIDUtils');

    var hasProductListItems = collections.find(defaultShipment.productLineItems, function (productLineItem) {
        return productLineItem.productListItem;
    });

    var shipment = hasProductListItems ? currentBasket.createShipment(UUIDUtils.createUUID()) : defaultShipment;
    var productLineItem = currentBasket.createProductLineItem(product, optionModel, shipment);

    if (product.bundle && childProducts.length) {
        base.updateBundleProducts(productLineItem, childProducts);
    }

    productLineItem.setQuantityValue(quantity);

    return productLineItem;
}

/**
 * Find all line items that contain the product specified.  A product can appear in different line
 * items that have different option selections or in product bundles.
 *
 * @param {string} productId - Product ID to match
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - Collection of the Cart's
 *     product line items
 * @return {Object} properties includes,
 *                  matchingProducts - collection of matching products
 *                  uuid - string value for the last product line item
 * @return {dw.order.ProductLineItem[]} - Filtered list of product line items matching productId
 */
function getMatchingProducts(productId, productLineItems) {
    var matchingProducts = [];
    var uuid;

    collections.forEach(productLineItems, function (item) {
        if (item.productID === productId && !item.productListItem) {
            matchingProducts.push(item);
            uuid = item.UUID;
        }
    });

    return {
        matchingProducts: matchingProducts,
        uuid: uuid
    };
}

/**
 * Filter all the product line items matching productId and
 * has the same bundled items or options in the cart
 * @param {dw.catalog.Product} product - Product object
 * @param {string} productId - Product ID to match
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - Collection of the Cart's
 *     product line items
 * @param {string[]} childProducts - the products' sub-products
 * @param {SelectedOption[]} options - product options
 * @return {dw.order.ProductLineItem[]} - Filtered all the product line item matching productId and
 *     has the same bundled items or options
 */
function getExistingProductLineItemsInCart(product, productId, productLineItems, childProducts, options) {
    var matchingProductsObj = getMatchingProducts(productId, productLineItems);
    var matchingProducts = matchingProductsObj.matchingProducts;
    var productLineItemsInCart = matchingProducts.filter(function (matchingProduct) {
        return product.bundle
            ? base.allBundleItemsSame(matchingProduct.bundledProductLineItems, childProducts)
            : base.hasSameOptions(matchingProduct.optionProductLineItems, options || []);
    });

    return productLineItemsInCart;
}

/**
 * Filter the product line item matching productId and
 * has the same bundled items or options in the cart
 * @param {dw.catalog.Product} product - Product object
 * @param {string} productId - Product ID to match
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - Collection of the Cart's
 *     product line items
 * @param {string[]} childProducts - the products' sub-products
 * @param {SelectedOption[]} options - product options
 * @return {dw.order.ProductLineItem} - get the first product line item matching productId and
 *     has the same bundled items or options
 */
function getExistingProductLineItemInCart(product, productId, productLineItems, childProducts, options) {
    return getExistingProductLineItemsInCart(product, productId, productLineItems, childProducts, options)[0];
}

/**
 * Adds a product to the cart. If the product is already in the cart it increases the quantity of
 * that product.
 * @param {dw.order.Basket} currentBasket - Current users's basket
 * @param {string} productId - the productId of the product being added to the cart
 * @param {number} quantity - the number of products to the cart
 * @param {string[]} childProducts - the products' sub-products
 * @param {SelectedOption[]} options - product options
 *  @return {Object} returns an error object
 */
function addProductToCart(currentBasket, productId, quantity, childProducts, options) {
    var availableToSell;
    var defaultShipment = currentBasket.defaultShipment;
    var perpetual;
    var product = ProductMgr.getProduct(productId);
    var productInCart;
    var productLineItems = currentBasket.productLineItems;
    var productQuantityInCart;
    var quantityToSet;
    var optionModel = productHelper.getCurrentOptionModel(product.optionModel, options);
    var result = {
        error: false,
        message: Resource.msg('text.alert.addedtobasket', 'product', null)
    };

    var lineItemQuantity = Number.isNaN(quantity) ? base.DEFAULT_LINE_ITEM_QUANTITY : quantity;
    var totalQtyRequested = 0;
    var canBeAdded = false;

    if (product.bundle) {
        canBeAdded = base.checkBundledProductCanBeAdded(childProducts, productLineItems, lineItemQuantity);
    } else {
        totalQtyRequested = lineItemQuantity + base.getQtyAlreadyInCart(productId, productLineItems);
        perpetual = product.availabilityModel.inventoryRecord.perpetual;
        canBeAdded = (perpetual || totalQtyRequested <= product.availabilityModel.inventoryRecord.ATS.value);
    }

    if (!canBeAdded) {
        result.error = true;
        result.message = Resource.msgf(
            'error.alert.selected.quantity.cannot.be.added.for',
            'product',
            null,
            product.availabilityModel.inventoryRecord.ATS.value,
            product.name
        );
        return result;
    }

    productInCart = getExistingProductLineItemInCart(product, productId, productLineItems, childProducts, options);

    if (productInCart) {
        productQuantityInCart = productInCart.quantity.value;
        quantityToSet = lineItemQuantity ? lineItemQuantity + productQuantityInCart : productQuantityInCart + 1;
        availableToSell = productInCart.product.availabilityModel.inventoryRecord.ATS.value;

        if (availableToSell >= quantityToSet || perpetual) {
            productInCart.setQuantityValue(quantityToSet);
            result.uuid = productInCart.UUID;
        } else {
            result.error = true;
            result.message = availableToSell === productQuantityInCart
                ? Resource.msg('error.alert.max.quantity.in.cart', 'product', null)
                : Resource.msg('error.alert.selected.quantity.cannot.be.added', 'product', null);
        }
    } else {
        var productLineItem;
        productLineItem = addLineItem(
            currentBasket,
            product,
            lineItemQuantity,
            childProducts,
            optionModel,
            defaultShipment
        );

        result.uuid = productLineItem.UUID;
    }

    return result;
}

/**
 * Finds a product with a matching ID and matching productListItem ID
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - Collection of the Cart's
 *      productLineItems
 * @param {string} productListItemID - the id of the productListItem to be added to the cart
 * @param {string} productId - The id of the product
 *  @return {Object} returns the matching productLineItem
 */
function getExistingProductListItemInCart(productLineItems, productListItemID, productId) {
    var matchingProduct = collections.find(productLineItems, function (item) {
        return item.productID === productId && item.productListItem && item.productListItem.ID === productListItemID;
    });

    return matchingProduct;
}

/**
 * Add a product to the cart formed from the productListItem in the gift registry
 * @param {dw.order.Basket} currentBasket - Current users's basket
 * @param {string} productListItemID - the id of the productListItem to be added to the cart
 * @param {number} quantity - the number of products to the cart
 * @param {string} productListID - The id of the productList
 *  @return {Object} returns an error object
 */
function addProductListItemToCart(currentBasket, productListItemID, quantity, productListID) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var UUIDUtils = require('dw/util/UUIDUtils');

    var productList = ProductListMgr.getProductList(productListID);
    var productListItem = productList.getItem(productListItemID);

    var availableToSell;
    var canBeAdded = false;
    var perpetual;
    var product = productListItem.product;
    var productID = productListItem.productID;
    var productListItemInCart;
    var productListItemQuantityInCart;
    var productLineItems = currentBasket.productLineItems;
    var quantityToSet;
    var result = {
        success: true,
        message: Resource.msg('text.alert.addedtobasket', 'product', null)
    };
    var totalQtyRequested = 0;

    totalQtyRequested = quantity + base.getQtyAlreadyInCart(productID, productLineItems);
    perpetual = product.availabilityModel.inventoryRecord.perpetual;
    canBeAdded = (perpetual || totalQtyRequested <= product.availabilityModel.inventoryRecord.ATS.value);

    if (!canBeAdded) {
        result.success = false;
        result.message = Resource.msgf(
            'error.alert.selected.quantity.cannot.be.added.for',
            'product',
            null,
            product.availabilityModel.inventoryRecord.ATS.value,
            product.name
        );

        return result;
    }

    productListItemInCart = getExistingProductListItemInCart(productLineItems, productListItemID, productID);

    if (productListItemInCart) {
        productListItemQuantityInCart = productListItemInCart.quantity.value;
        quantityToSet = quantity ? quantity + productListItemQuantityInCart : productListItemQuantityInCart + 1;
        availableToSell = productListItemInCart.product.availabilityModel.inventoryRecord.ATS.value;

        if (availableToSell >= quantityToSet || perpetual) {
            productListItemInCart.setQuantityValue(quantityToSet);
            result.uuid = productListItemInCart.UUID;
        } else {
            result.success = false;
            result.message = availableToSell === productListItemQuantityInCart
                ? Resource.msg('error.alert.max.quantity.in.cart', 'product', null)
                : Resource.msg('error.alert.selected.quantity.cannot.be.added', 'product', null);
        }
    } else {
        var shipment = currentBasket.createShipment(UUIDUtils.createUUID());
        var productLineItem = currentBasket.createProductLineItem(productListItem, shipment);

        productLineItem.setQuantityValue(quantity);

        result.uuid = productLineItem.UUID;
    }

    return result;
}

module.exports = {
    addLineItem: addLineItem,
    addProductToCart: addProductToCart,
    checkBundledProductCanBeAdded: base.checkBundledProductCanBeAdded,
    ensureAllShipmentsHaveMethods: base.ensureAllShipmentsHaveMethods,
    getQtyAlreadyInCart: base.getQtyAlreadyInCart,
    getNewBonusDiscountLineItem: base.getNewBonusDiscountLineItem,
    getExistingProductLineItemInCart: getExistingProductLineItemInCart,
    getExistingProductLineItemsInCart: getExistingProductLineItemsInCart,
    getMatchingProducts: getMatchingProducts,
    allBundleItemsSame: base.allBundleItemsSame,
    hasSameOptions: base.hasSameOptions,
    addProductListItemToCart: addProductListItemToCart,
    BONUS_PRODUCTS_PAGE_SIZE: base.BONUS_PRODUCTS_PAGE_SIZE,
    DEFAULT_LINE_ITEM_QUANTITY: base.DEFAULT_LINE_ITEM_QUANTITY,
    getReportingUrlAddToCart: base.getReportingUrlAddToCart,
    checkPliCanBeUpdated: base.checkPliCanBeUpdated
};
