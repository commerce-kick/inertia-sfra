import ExtensibleObject = require('../object/ExtensibleObject');
import EnumValue = require('../value/EnumValue');
import OrderAddress = require('../order/OrderAddress');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface CustomerAddress extends CustomAttributes {
        }
    }
}

declare class CustomerAddress extends ExtensibleObject<ICustomAttributes.CustomerAddress> {
    address1: string;
    address2: string;
    city: string;
    companyName: string;
    countryCode: EnumValue<string>;
    firstName: string;
    fullName: string;
    ID: string;
    jobTitle: string;
    lastName: string;
    phone: string;
    postalCode: string;
    postBox: string;
    salutation: string;
    secondName: string;
    stateCode: string;
    suffix: string;
    suite: string;
    title: string;


}
export = CustomerAddress;
