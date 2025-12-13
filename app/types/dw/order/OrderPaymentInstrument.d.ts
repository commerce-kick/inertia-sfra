import PaymentInstrument = require('./PaymentInstrument');
import PaymentTransaction = require('./PaymentTransaction');
import Money = require('../value/Money');
import CustomAttributes = require('../object/CustomAttributes');


declare global {
	module ICustomAttributes {
		interface OrderPaymentInstrument extends CustomAttributes {
		}
	}
}

/**
 * Represents any payment instrument used to pay orders, such as credit card or bank transfer. The object defines standard methods for credit card payment, and can be extended by attributes appropriate for other payment methods.
 */
declare class OrderPaymentInstrument extends PaymentInstrument<ICustomAttributes.OrderPaymentInstrument> {
    private constructor();

    /**
     * The driver's license associated with a bank account if the calling context meets the following criteria:

        If the method call happens in the context of a storefront request and the current customer is identical to the customer related to the basket or order, and the current protocol is HTTPS.
        If the method call happens in the context of the business manager and the current user has permission to the Orders module.

    Otherwise, the method throws an exception.
    */
    readonly bankAccountDriversLicense  :  string

    /**
     * The account number if the calling context meets the following criteria:

        If the method call happens in the context of a storefront request and the current customer is identical to the customer related to the basket or order, and the current protocol is HTTPS.
        If the method call happens in the context of the business manager and the current user has permissions to the Orders module.

    Otherwise, the method throws an exception.
    */
    readonly bankAccountNumber  :  string

    /**
     * The sum of the captured amounts. The captured amounts are calculated on the fly. Associate a payment capture for an Payment Instrument with an Invoice using Invoice method addCaptureTransaction.
     */
    readonly capturedAmount  :  Money

    /**
     * The de-crypted creditcard number if the calling context meets the following criteria:

        If the method call happens in the context of a storefront request and the current customer is identical to the customer related to the basket or order, and the current protocol is HTTPS.
        If the method call happens in the context of the business manager and the current user has the permission to manage orders.

    Otherwise, the method returns the masked credit card number.
    */
    readonly creditCardNumber  :  string
    /**
     * The Payment Transaction for this Payment Instrument or null.
     */
    readonly paymentTransaction  :  PaymentTransaction | null

    /**
     * The sum of the refunded amounts. The refunded amounts are calculated on the fly. Associate a payment refund for an Payment Instrument with an Invoice using Invoice method addRefundTransaction.
     */
    readonly refundedAmount  :  Money


}

export = OrderPaymentInstrument;
