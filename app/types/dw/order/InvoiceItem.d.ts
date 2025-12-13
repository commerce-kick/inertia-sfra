import AbstractItem = require('./AbstractItem');
import Quantity = require('../value/Quantity');
import Money = require('../value/Money');

declare class InvoiceItem extends AbstractItem {
    private constructor();

    /**
     * Price of a single unit before discount application.
     */
    readonly basePrice: Money

    /**
     * The captured amount for this item.
     */
    readonly capturedAmount: Money

    /**
     * The number of the invoice to which this item belongs.
     */
    readonly invoiceNumber: string

    /**
     * Returns null or the parent item.
     */
    readonly parentItem: InvoiceItem | null

    /**
     * The quantity of this item.
     */
    readonly quantity: Quantity

    /**
     * The refunded amount for this item.
     */
    readonly refundedAmount: Money


}

export = InvoiceItem;
