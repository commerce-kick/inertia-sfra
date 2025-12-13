import AbstractItem = require('./AbstractItem');

/**
 * Represents an item of an Appeasement which is associated with one OrderItem usually representing an Order ProductLineItem. Items are created using method Appeasement.addItems(Money, List)
When the related Appeasement were set to status COMPLETED, only the the custom attributes of the appeasement item can be changed.
 */
declare class AppeasementItem extends AbstractItem {
    /**
     * The number of the Appeasement to which this item belongs.
     */
    readonly appeasementNumber  :  string

    /**
     * Returns null or the parent item.
     */
    parentItem  :  AppeasementItem | null

    private constructor();


}

export = AppeasementItem;
