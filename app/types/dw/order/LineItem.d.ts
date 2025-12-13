import ExtensibleObject = require('../object/ExtensibleObject');
import Money = require('../value/Money');
import LineItemCtnr = require('./LineItemCtnr');
import CustomAttributes = require('../object/CustomAttributes');


/**
 * Common line item base class.
 */
declare class LineItem<T extends CustomAttributes> extends ExtensibleObject<T> {
    /**
     * The base price for the line item, which is the price of the unit before applying adjustments, in the purchase currency. The base price may be net or gross of tax depending on the configured taxation policy.
     */
    basePrice : Money;

    /**
     * The gross price for the line item, which is the price of the unit before applying adjustments, in the purchase currency, including tax.
     */
    grossPrice : Money;

    /**
     * The line item ctnr of the line item.
     */
    readonly lineItemCtnr : LineItemCtnr<any>

    /**
     * The display text for the line item.
     */
    lineItemText : string

    /**
     * The net price for the line item, which is the price of the unit before applying adjustments, in the purchase currency, excluding tax.
     */
    netPrice : Money

    /**
     * Get the price of the line item. If the line item is based on net pricing then the net price is returned. If the line item is based on gross pricing then the gross price is returned.
     */
    readonly price : Money;

    /**
     * Return the price amount for the line item. Same as getPrice().getValue().
     */
    priceValue : number;

    /**
     * The tax for the line item, which is the tax of the unit before applying adjustments, in the purchase currency.
     */
    tax : Money;

    /**
     * Get the price used to calculate the tax for this line item.
     */
    readonly taxBasis : Money;

    /**
     * The tax class ID for the line item or null if no tax class ID is associated with the line item. In the case where the tax class ID is null, you should use the default tax class ID.
     */
    taxClassID : string | null

    /**
     * The tax rate, which is the decimal tax rate to be applied to the product represented by this line item. A value of 0.175 represents a percentage of 17.5%.
     */
    taxRate : number


    // methods


}

export = LineItem;
