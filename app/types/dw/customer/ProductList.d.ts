import ExtensibleObject = require('../object/ExtensibleObject')
import ProductListRegistrant = require('./ProductListRegistrant')
import CustomerAddress = require('./CustomerAddress')
import EnumValue = require('../value/EnumValue')
import ProductListItem = require('./ProductListItem')
import Collection = require('../util/Collection')
import Customer = require('./Customer')
import ProductListItemPurchase = require('./ProductListItemPurchase')
import Product = require('../catalog/Product')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductList extends CustomAttributes{
        }
    }
}


declare class ProductList extends ExtensibleObject<ICustomAttributes.ProductList> {
    static EXPORT_STATUS_EXPORTED  :  1
    static EXPORT_STATUS_NOTEXPORTED  :  0
    static TYPE_CUSTOM_1  :  100
    static TYPE_CUSTOM_2  :  101
    static TYPE_CUSTOM_3  :  102
    static TYPE_GIFT_REGISTRY  :  11
    static TYPE_SHOPPING_LIST  :  12
    static TYPE_WISH_LIST  :  10

    anonymous  :  boolean
    coRegistrant  :  ProductListRegistrant
    currentShippingAddress  :  CustomerAddress
    description  :  string
    eventCity  :  string
    eventCountry  :  string
    eventDate  :  Date
    eventState  :  string
    eventType  :  string
    exportStatus  :  EnumValue<number>
    giftCertificateItem  :  ProductListItem
    ID  :  string
    items  :  Collection<ProductListItem>
    lastExportTime  :  Date
    name  :  string
    owner  :  Customer
    postEventShippingAddress  :  CustomerAddress
    productItems  :  Collection<ProductListItem>
    public  :  boolean
    publicItems  :  Collection<ProductListItem>
    purchases  :  Collection<ProductListItemPurchase>
    registrant  :  ProductListRegistrant
    shippingAddress  :  CustomerAddress
    type: typeof ProductList.TYPE_CUSTOM_1
        | typeof ProductList.TYPE_CUSTOM_2
        | typeof ProductList.TYPE_CUSTOM_3
        | typeof ProductList.TYPE_GIFT_REGISTRY
        | typeof ProductList.TYPE_SHOPPING_LIST
        | typeof ProductList.TYPE_WISH_LIST

        | typeof ProductList.TYPE_CUSTOM_2
        | typeof ProductList.TYPE_CUSTOM_3
        | typeof ProductList.TYPE_GIFT_REGISTRY
        | typeof ProductList.TYPE_SHOPPING_LIST
        | typeof ProductList.TYPE_WISH_LIST

}

export = ProductList
