import SearchRefinementDefinition = require('../catalog/SearchRefinementDefinition');

/**
 * This class provides an interface to refinement options for content search.
 */
declare class ContentSearchRefinementDefinition extends SearchRefinementDefinition{
    /**
     * Identifies if this is a folder refinement.
     */
    readonly folderRefinement  :  boolean
    private constructor()
}

export = ContentSearchRefinementDefinition;
