import ExtensibleObject = require('../object/ExtensibleObject');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface SearchRefinementDefinition extends CustomAttributes{
        }
    }
}
/**
 * Common search refinement definition base class.
 */
declare class SearchRefinementDefinition extends ExtensibleObject<ICustomAttributes.SearchRefinementDefinition> {

    /**
     * The attribute ID. If the refinement definition is not an attribute refinement, the method returns an empty string.
     */
    readonly attributeID  :  string

    /**
     * Identifies if this is an attribute refinement.
     */
    readonly attributeRefinement  :  boolean

    /**
     * The cut-off threshold.
     */
    readonly cutoffThreshold  :  number

    /**
     * The display name.
     */
    readonly displayName  :  string

    /**
     * A code for the data type used for this search refinement definition. See constants defined in ObjectAttributeDefinition.
     */
    readonly valueTypeCode  :  number

    protected constructor();


}

export =  SearchRefinementDefinition;
