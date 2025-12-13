import Set = require('./Set');
import Collection = require('./Collection');
import MapEntry = require('./MapEntry');


declare class Map<K, V> {
    /**
     * Identifies if this map is empty.
     */
    public readonly empty  :  boolean;

    /**
     * Convenience variable, for an empty and immutable list.
     */
    static EMPTY_MAP : Map<any, any>;

    /**
     * The size of the map. This is a bean attribute method and supports the access to the collections length similar to a ECMA array, such as 'products.length'.
     */
    public readonly length  :  number;

    protected constructor();


}

export = Map;
