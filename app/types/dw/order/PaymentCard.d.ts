import ExtensibleObject = require('../object/ExtensibleObject');
import MediaFile = require('../content/MediaFile');
import MarkupText = require('../content/MarkupText');
import Customer = require('../customer/Customer');
import Status = require('../system/Status');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface PaymentCard extends CustomAttributes{
        }
    }
}
/**
 * Represents payment cards and provides methods to access the payment card attributes and status.
 */
declare class PaymentCard extends ExtensibleObject<ICustomAttributes.PaymentCard> {
    /**
     * Returns 'true' if payment card is active (enabled), otherwise 'false' is returned.
     */
    readonly active  :  boolean

    /**
     * The unique card type of the payment card.
     */
    readonly cardType  :  string

    /**
     * The description of the payment card.
     */
    readonly description  :  MarkupText

    /**
     * The reference to the payment card image.
     */
    readonly image  :  MediaFile

    /**
     * The name of the payment card.
     */
    readonly name  :  string

    private constructor();


}

export = PaymentCard;
