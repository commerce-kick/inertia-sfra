import CustomerPaymentInstrument = require('./CustomerPaymentInstrument');
import Collection = require('../util/Collection');

declare class Wallet {
    paymentInstruments: Collection<CustomerPaymentInstrument>;

}

export = Wallet;
