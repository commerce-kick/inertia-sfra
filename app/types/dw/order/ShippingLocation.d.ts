import OrderAddress = require('./OrderAddress');
import CustomerAddress = require('../customer/CustomerAddress');

/**
 *
* Represents a specific location for a shipment.
*
* _Note: this class allows access to sensitive personal and private information. Pay attention to appropriate legal and regulatory requirements related to this data._
 */
declare class ShippingLocation {

    /**
     * The shipping location's first address.
     */
    address1  :  string

    /**
     * The shipping location's second address.
     */
    address2  :  string

    /**
     *  The shipping location's city.
     */
    city  :  string

    /**
     * The shipping location's country code.
     */
    countryCode  :  string

    /**
     * The shipping location's postal code.
     */
    postalCode  :  string

    /**
     * The shipping location's post box.
     */
    postBox  :  string

    /**
     * The shipping location's state code.
     */
    stateCode  :  string

    /**
     * The shipping location's suite.
     */
    suite  :  string


}


export = ShippingLocation;
