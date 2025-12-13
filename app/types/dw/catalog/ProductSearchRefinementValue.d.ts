import SearchRefinementValue = require('./SearchRefinementValue');


declare class ProductSearchRefinementValue extends SearchRefinementValue {
    /**
     * The lower bound for price refinements. For example, 50.00 for a range of $50.00 - $99.99.
     */
    readonly valueFrom  :  number

    /**
     * The upper bound for price refinements. For example, 99.99 for a range of $50.00 - $99.99.
     */
    readonly valueTo  :  number

    protected constructor();


}

export = ProductSearchRefinementValue;
