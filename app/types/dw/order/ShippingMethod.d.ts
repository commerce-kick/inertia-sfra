import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import CustomerGroup = require('../customer/CustomerGroup');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ShippingMethod extends CustomAttributes{
        }
    }
}
/**
 * ShippingMethod represents how the shipment will be shipped.
 */
declare class ShippingMethod extends ExtensibleObject<ICustomAttributes.ShippingMethod> {
    private constructor();
    /**
     * The base shipping method or null if undefined.
     */
    readonly baseMethod  :  ShippingMethod | null

    /**
     * The currency code associated with the shipping method
     */
    readonly currencyCode  :  string

    /**
     * The customer groups assigned to the shipping method. Assigned ids that do not belong to an existing customer group are ignored.
     */
    readonly customerGroups  :  Collection<CustomerGroup>

    /**
     * Returns 'true' if the shipping method is marked as 'default' for the current session's currency. Otherwise 'false' is returned.
     */
    readonly defaultMethod  :  boolean

    /**
     * The dependent shipping methods of this shipping method, regardless of the online status of the methods.
    Dependent shipping methods have this method as their base method.
    */
    readonly dependentMethods  :  Collection<ShippingMethod>

    /**
     * The description of the shipping method as specified in the current locale or null if it could not be found.
     */
    readonly description  :  string |  null

    /**
     * The display name of the shipping method in the current locale or null if it could not be found.
     */
    readonly displayName  :  string | null

    /**
     * The ID of the shipping method.
     */
    readonly ID  :  string

    /**
     * Returns true if shipping method is online, false otherwise
     */
    readonly online  :  boolean

    /**
     * The tax class id of the shipping method.
     */
    readonly taxClassID  :  string


}

export = ShippingMethod;
