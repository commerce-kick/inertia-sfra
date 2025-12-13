import Money = require('../value/Money');
import Collection = require('../util/Collection');
import TaxItem = require('./TaxItem');

/**
 * Container used to represent an subtotal or grandtotal item which contains various prices and a tax breakdown held in a collection of tax-items.

Usage example:
```javascript
var invoice : Invoice = ...;
var productNet = invoice.productSubTotal.netPrice;
var serviceNet = invoice.serviceSubTotal.netPrice;
var grandNet = invoice.grandTotal.netPrice;
var grandTax = invoice.grandTotal.tax;
var grandGross = invoice.grandTotal.grossPrice;
```
tax breakdown
```typescript
for each(taxItem : TaxItem in invoice.grandTotal.taxItems) {
    var tax : Money = taxItem.amount;
    var taxGroup : TaxGroup = taxItem.taxGroup;
    var rate : Double = taxGroup.rate;
    var caption :String = taxGroup.caption;
    var taxType :String = taxGroup.taxType;
} 
```
 */
declare class SumItem {
    /**
     * Gross price of SumItem.
     */
    readonly grossPrice  :  Money

    /**
     * Net price of SumItem.
     */
    netPrice  :  Money

    /**
     * Total tax for SumItem.
     */
    tax  :  Money

    /**
     * Price of entire SumItem on which tax calculation is based. Same as getNetPrice() or getGrossPrice() depending on whether the order is based on net or gross prices.
     */
    taxBasis  :  Money

    /**
     * Tax items representing a tax breakdown for the SumItem.
     */
    taxItems  :  Collection<TaxItem>

    private constructor()


}

export =  SumItem;
