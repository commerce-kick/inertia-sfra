import LineItem = require('./LineItem');
import ProductListItem = require('../customer/ProductListItem');
import Shipment = require('./Shipment');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface GiftCertificateLineItem extends CustomAttributes{
        }
    }
}

declare class GiftCertificateLineItem extends LineItem<ICustomAttributes.GiftCertificateLineItem> {
    /**
     * The ID of the gift certificate that this line item was used to create. If this line item has not been used to create a Gift Certificate, this method returns null.
     */
    giftCertificateID  :  string | null

    /**
     * The message to include in the email of the person receiving the gift certificate line item.
     */
    message  :  string

    /**
     * The associated ProductListItem.
     */
    productListItem  :  ProductListItem

    /**
     * The email address of the person receiving the gift certificate line item.
     */
    recipientEmail  :  string

    /**
     * The name of the person receiving the gift certificate line item.
     */
    recipientName  :  string

    /**
     * The name of the person or organization that sent the gift certificate line item or null if undefined.
     */
    senderName  :  string | null

    /**
     * The associated Shipment.
     */
    shipment  :  Shipment

    private constructor();


}

export = GiftCertificateLineItem;
