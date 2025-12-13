
import Iterator = require('./Iterator');

/**
 * Represents a collection of objects.
 */
declare class Collection<T> {


    /**
     * Returns true if the collection is empty.
     */
    empty : boolean;

    /**
     * The length of the collection. This is similar to to a ECMA array of 'products.length'.
     */
    length : number;


}

export = Collection;
