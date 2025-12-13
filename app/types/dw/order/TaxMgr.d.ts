import ShippingLocation = require('./ShippingLocation');

type TAX_POLICY_GROSS = 0;
type TAX_POLICY_NET = 1;
/**
 * Provides methods to access the tax table.
 */
declare class TaxMgr {
    /**
     * Constant representing the gross taxation policy.
     */
    static TAX_POLICY_GROSS: TAX_POLICY_GROSS

    /**
     * Constant representing the net taxation policy.
     */
    static TAX_POLICY_NET: TAX_POLICY_NET

    /**
     * The ID of the tax class that represents items with a custom tax rate. The standard order calculation process assumes that such line items are initialized with a tax rate and a being ignored during the tax rate lookup sequence of the calculation process.
    Note that this tax class does not appear in the Business Manager tax module.
     */
    static readonly customRateTaxClassID: string

    /**
     * The ID of the default tax class defined for the site. This class might be used in case a product or service does not define a tax class.
    If no default tax class is defined, the method returns null.
     */
    static readonly defaultTaxClassID: string

    /**
     * The ID of the default tax jurisdiction defined for the site. This jurisdiction might be used in case no jurisdiction is defined for a specific address.
    If no default tax jurisdiction is defined, this method returns null.
     */
    static readonly defaultTaxJurisdictionID: string

    /**
     * The taxation policy (net/gross) configured for the current site.
     */
    static readonly taxationPolicy: typeof TaxMgr.TAX_POLICY_GROSS | typeof TaxMgr.TAX_POLICY_NET

    /**
     * The ID of the tax class that represents tax exempt items. The tax manager will return a tax rate of 0.0 for this tax class.
     *
      _Note that this tax class does not appear in the Business Manager tax module._
     */
    static readonly taxExemptTaxClassID: string

    private constructor();


}


export = TaxMgr;
