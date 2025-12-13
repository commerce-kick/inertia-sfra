import SearchRefinementDefinition = require('./SearchRefinementDefinition');

declare class ProductSearchRefinementDefinition extends SearchRefinementDefinition {
    /**
     * Identifies if this is a category refinement.
     */
    readonly categoryRefinement  :  boolean

    /**
     * Identifies if this is a price refinement.
     */
    readonly priceRefinement  :  boolean

    protected constructor();


}

export = ProductSearchRefinementDefinition;
