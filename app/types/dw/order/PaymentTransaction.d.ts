import ExtensibleObject = require('../object/ExtensibleObject');
import EnumValue = require('../value/EnumValue');
import Money = require('../value/Money');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');
import PaymentProcessor = require('./PaymentProcessor');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface PaymentTransaction extends CustomAttributes {
        }
    }
}

declare class PaymentTransaction extends ExtensibleObject<ICustomAttributes.PaymentTransaction> {
    static readonly TYPE_AUTH  :  string
    static readonly TYPE_AUTH_REVERSAL  :  string
    static readonly TYPE_CAPTURE  :  string
    static readonly TYPE_CREDIT  :  string

    /**
     * The amount of the transaction
     */
    amount  :  Money

    /**
     * The payment instrument related to this payment transaction.
     */
    readonly paymentInstrument  :  OrderPaymentInstrument

    /**
     * The payment processor related to this payment transaction.
     */
    paymentProcessor  :  PaymentProcessor

    /**
     * The payment service-specific transaction id.
     */
    transactionID  :  string

    /**
     * The value of the transaction type where the value is one of TYPE_AUTH, TYPE_AUTH_REVERSAL, TYPE_CAPTURE or TYPE_CREDIT.
     */
    type  :  EnumValue<string>

    private constructor();


}

export = PaymentTransaction;
