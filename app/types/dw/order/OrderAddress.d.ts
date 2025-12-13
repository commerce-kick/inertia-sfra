import ExtensibleObject = require('../object/ExtensibleObject');
import EnumValue = require('../value/EnumValue');

import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface OrderAddress extends CustomAttributes {
        }
    }
}
/**
 * The Address class represents a customer's address. 
 */
declare class OrderAddress extends ExtensibleObject<ICustomAttributes.OrderAddress> {

    address1  :  string
    address2  :  string
    city  :  string
    companyName  :  string
    countryCode  :  EnumValue<string>
    firstName  :  string
    readonly fullName  :  string
    jobTitle  :  string
    lastName  :  string
    phone  :  string
    postalCode  :  string
    postBox  :  string
    salutation  :  string
    secondName  :  string
    stateCode  :  string
    suffix  :  string
    suite  :  string
    title  :  string

    private constructor()


}

export = OrderAddress;
