import List = require('../util/List');
import CustomerAddress = require('./CustomerAddress');

declare class AddressBook {
    addresses: List<CustomerAddress>;
    preferredAddress: CustomerAddress | null;

}

export = AddressBook;
