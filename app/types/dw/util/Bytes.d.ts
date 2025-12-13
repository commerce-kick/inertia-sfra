

/**
 * A simple immutable class representing an array of bytes, used for working with binary data in a scripting context. Limitation: The size of the resulting byte representation is limited to 10k bytes.
 */
declare class Bytes {
    /**
     * The maximum number of bytes that a Bytes object can represent == 10KB
     */
    static readonly MAX_BYTES  :  number;


    /**
     * The number of bytes represented by this object.
     */
    readonly length  :  number;


}

export = Bytes;
