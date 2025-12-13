

declare class EnumValue<T> {
    /**
     * The display value of the enumeration value. If no display value is configured the method return the string representation of the value.
     */
    readonly displayValue  :  string;

    /**
     * The value of the enumeration value.
     */
    readonly value  :  T;


}

export = EnumValue;
