

/**
 * The Decimal class is a helper class to perform decimal arithmetic in scripts and to represent a decimal number with arbitray length. The decimal class avoids arithmetic errors, which are typical for calculating with floating numbers, that are based on a binary mantissa. The class is designed in a way that it can be used very similar to a desktop calculator. var d = new Decimal( 10.0 ); var result = d.add( 2.0 ).sub( 3.0 ).get(); The above code will return 9 as result.
 */
declare class Decimal {


}

export = Decimal;
