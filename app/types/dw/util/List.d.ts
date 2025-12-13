import Collection = require('./Collection');


declare class List<T> extends Collection<T> {
    /**
     * Convenience variable, for an empty and immutable list.
     */
    static EMPTY_LIST : List<any>;

    protected constructor();


}

export = List;
