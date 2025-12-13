import List = require('../util/List');
import PaymentCard = require('./PaymentCard');
import Customer = require('../customer/Customer');
import PaymentMethod = require('./PaymentMethod');


/**
 * PaymentMgr is used to access payment methods and payment cards of the current site.
To access payment methods and payment cards explicitly, use methods getPaymentMethod(String) and getPaymentCard(String).

To access active payment methods use method getActivePaymentMethods().

To access applicable payment methods for a customer, country and/or payment amount use method getApplicablePaymentMethods(Customer, String, Number).
 */
declare class PaymentMgr {
    /**
     * The sorted list of all enabled payment methods of the current site, regardless of any customer group, country, payment amount or currency restrictions. The payment methods are sorted as defined in the Business Manager.
     */
    readonly activePaymentMethods  :  List<PaymentMethod>

    private constructor();


}

export = PaymentMgr;
