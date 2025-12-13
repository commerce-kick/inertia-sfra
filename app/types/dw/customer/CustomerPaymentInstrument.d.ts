import CustomAttributes = require('../object/CustomAttributes');
import PaymentInstrument = require('../order/PaymentInstrument');

declare global {
	module ICustomAttributes {
		interface CustomerPaymentInstrument extends CustomAttributes {
		}
	}
}

declare class CustomerPaymentInstrument extends PaymentInstrument<ICustomAttributes.CustomerPaymentInstrument> {
    bankAccountDriversLicense  :  string;
    bankAccountNumber  :  string;
    creditCardNumber  :  string;
}

export = CustomerPaymentInstrument;
