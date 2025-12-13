import Set = require('./Set');
import Collection = require('./Collection');
declare class SortedSet<T> extends Set<T> {
    /**
     * Constructor to create a new SortedSet.
     */
    public constrtuctor()

    /**
     * Constructor to create a new SortedSet.
     * @param comparator
     */
    public constrtuctor(comparator : Object)

    /**
     * Constructor for a new SortedSet.
     * @param collection
     */
    public constrtuctor(collection : Collection<T>);


}

export = SortedSet;
