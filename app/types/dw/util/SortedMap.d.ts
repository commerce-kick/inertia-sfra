import Map = require('./Map')

/**
 * A map that further guarantees that it will be in ascending key order, sorted according to the natural ordering of its keys, or by a comparator provided at sorted map creation time. This order is reflected when iterating over the sorted map's collection views (returned by the entrySet, keySet and values methods). Note that sorting by natural order is only supported for Number, String, Date, Money and Quantity as key.
 */
declare class SortedMap<K, V> extends Map<K, V> {


}


export = SortedMap;
