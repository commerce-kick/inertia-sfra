import ExtensibleObject = require('../object/ExtensibleObject');
import MediaFile = require('../content/MediaFile');
import MarkupText = require('../content/MarkupText');
import PaymentCard = require('./PaymentCard');
import List = require('../util/List');
import PaymentProcessor = require('./PaymentProcessor');
import Customer = require('../customer/Customer');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface PaymentMethod extends CustomAttributes{
        }
    }
}

/**
 * The PaymentMethod class represents a logical type of payment a customer can make in the storefront. This class provides methods to access the payment method attributes, status, and (for card-based payment methods) the related payment cards.
A typical storefront presents the customer a list of payment methods that a customer can choose from after he has entered his billing address during the checkout. PaymentMgr.getApplicablePaymentMethods(Customer, String, Number) is used to determine the PaymentMethods that are relevant for the customer based on the amount of his order, his customer groups, and his shipping address.
 */
declare class PaymentMethod extends ExtensibleObject<ICustomAttributes.PaymentMethod> {

    /**
     * Returns 'true' if payment method is active (enabled), otherwise 'false' is returned.
     */
    readonly active  :  boolean

    /**
     * Returns enabled payment cards that are assigned to this payment method, regardless of current customer, country or payment amount restrictions. The payment cards are sorted as defined in the Business Manager.
     */
    readonly activePaymentCards  :  List<PaymentCard>

    /**
     * The description of the payment method.
     */
    readonly description  :  MarkupText

    /**
     * The unique ID of the payment method.
     */
    readonly ID  :  string

    /**
     * The reference to the payment method image.
     */
    readonly image  :  MediaFile

    /**
     * The name of the payment method.
     */
    readonly name  :  string

    /**
     * The payment processor associated to this payment method.
     */
    readonly paymentProcessor  :  PaymentProcessor

    private constructor();


}

export = PaymentMethod;
