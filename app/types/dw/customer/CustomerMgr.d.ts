import Collection = require('../util/Collection');
import CustomerGroup = require('./CustomerGroup');
import CustomerList = require('./CustomerList');
import CustomerPasswordConstraints = require('./CustomerPasswordConstraints');
import Customer = require('./Customer');
import ObjectTypeDefinition = require('../object/ObjectTypeDefinition');
import Profile = require('./Profile');
import SeekableIterator = require('../util/SeekableIterator');
import Map = require('../util/Map');
import AuthenticationStatus = require('./AuthenticationStatus');

/**
 * Provides helper methods for managing customers and customer profiles. Note: this class allows access to sensitive information through operations that retrieve the Profile object. Pay attention to appropriate legal and regulatory requirements related to this data.
 */
declare class CustomerMgr {
    private constructor();

    /**
     * The customer groups of the current site.
     */
    static readonly customerGroups  :  Collection<CustomerGroup>

    /**
     * An instance of CustomerPasswordConstraints for the customer list assigned to the current site.
     */
    static readonly passwordConstraints  :  CustomerPasswordConstraints

    /**
     * The number of registered customers in the system. This number can be used for reporting purposes.
     */
    static readonly registeredCustomerCount  :  number

    /**
     * The customer list of the current site.
     */
    static readonly siteCustomerList  :  CustomerList


}

export = CustomerMgr;
