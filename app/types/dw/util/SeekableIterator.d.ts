import Iterator = require('./Iterator');

/**
 * A special Iterator, which is returned by the system to iterate through large sets of data. The iterator supports seeking forward to a random position. This is a typical action when paging forward in a result set. The Iterator is primarily returned from search operations.
 */
declare class SeekableIterator<T> extends Iterator<T> {
    /**
     * The total element count for this iterator. The method returns -1, if the total count is not known.
     */
    readonly count:  number;

    private constructor();


}

export = SeekableIterator;
