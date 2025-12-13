import Set = require('./Set');
import Collection = require('./Collection');

declare class HashSet<T> extends Set<T> {

    public constructor();

    /**
     * Construct a new HashSet by initializing the HashSet with the elements of the given collection.
     */
    public constructor(collection : Collection<T>);


}

export = HashSet;
