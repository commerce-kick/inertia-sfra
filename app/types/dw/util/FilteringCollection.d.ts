import Collection = require('./Collection');
import Map = require('./Map');

/**
 * FilteringCollection is an extension of Collection which provides possibilities to

    - filter the elements to return a new FilteringCollection with a filtered set of elements
    - sort the elements to return a new FilteringCollection with a defined sort order
    - transform the elements to return a new FilteringCollection containing related elements
    - provide a map of the elements against a predefined key

Usage - In the current version each FilteringCollection provides a set of predefined qualifier constants which can be passed into the select(Object) method used to filter the elements. Generally qualifiers have the prefix QUALIFIER_. A second method sort(Object) is used to create a new instance with a different element ordering, which takes an orderB< constant. Generally orderBys have the prefix ORDERBY_: examples are ShippingOrder.ORDERBY_ITEMID, ShippingOrder.ORDERBY_ITEMPOSITION, and ORDERBY_REVERSE can be used to provide a FilteringCollection with the reverse ordering. An example with method ShippingOrder.getItems():

- var allItems : FilteringCollection = shippingOrder.items;
- var productItems : FilteringCollection = allItems.select(ShippingOrder.QUALIFIER_PRODUCTITEMS);
- var serviceItems : FilteringCollection = allItems.select(ShippingOrder.QUALIFIER_SERVICEITEMS);
- var byPosition : FilteringCollection = productItems.sort(ShippingOrder.ORDERBY_ITEMPOSITION);
- var revByPosition: FilteringCollection = byPosition.sort(FilteringCollection.ORDERBY_REVERSE);
- var mapByItemID : Map = allItems.asMap(); 
 */
declare class FilteringCollection<T> extends Collection<T> {
    private constructor();

    static readonly ORDERBY_REVERSE  :  Object;


}

export = FilteringCollection;
