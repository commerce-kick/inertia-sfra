import SearchRefinements = require('./SearchRefinements');
import ProductSearchRefinementDefinition = require('./ProductSearchRefinementDefinition');
import Collection = require('../util/Collection');
import ProductSearchRefinementValue = require('./ProductSearchRefinementValue');
import Category = require('./Category');
import SearchRefinementValue = require('./SearchRefinementValue');

/**
 * This class provides an interface to refinement options for the product search. In a typical usage, the client application UI displays the search refinements along with the search results and allows customers to "refine" the results (i.e. limit the results that are shown) by specifying additional product criteria, or "relax" (i.e. broaden) the results after previously refining. The three types of product search refinements are:
- Refine By Category: Limit the products to those assigned to specific child/ancestor categories of the search category.
 - Refine By Attribute: Limit the products to those with specific values for a given attribute. Values may be grouped into "buckets" so that a given set of values are represented as a single refinement option.
- Refine By Price: Limit the products to those whose prices fall in a specific range.

Rendering a product search refinement UI typically begins with iterating the refinement definitions for the search result. Call SearchRefinements.getRefinementDefinitions() or SearchRefinements.getAllRefinementDefinitions() to retrieve the appropriate collection of refinement definitions. For each definition, display the available refinement values by calling getAllRefinementValues(ProductSearchRefinementDefinition). Depending on the type of the refinement definition, the application must use slightly different logic to display the refinement widgets. For all 3 types, methods in ProductSearchModel are used to generate URLs to render hyperlinks in the UI. When clicked, these links trigger a call to the Search pipelet which in turn applies the appropriate filters to the native search result.
 */
declare class ProductSearchRefinements extends SearchRefinements {

    /**
     * The appropriate category refinement definition based on the search result. The category refinement definition returned will be the first that can be found traversing the category tree upward starting at the deepest common category of the search result.
     */
    readonly categoryRefinementDefinition  :  ProductSearchRefinementDefinition

    /**
     * The appropriate price refinement definition based on the search result. The price refinement definition returned will be the first that can be found traversing the category tree upward starting at the deepest common category of the search result.
     */
    readonly priceRefinementDefinition  :  ProductSearchRefinementDefinition

    protected constructor();


	refinementDefinitions: Collection<ProductSearchRefinementDefinition>

}

export = ProductSearchRefinements;
