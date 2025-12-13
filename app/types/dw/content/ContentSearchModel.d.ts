import SearchModel = require('../catalog/SearchModel');
import Folder = require('./Folder');
import Content = require('./Content');
import Iterator = require('../util/Iterator');
import PageMetaTag = require('../web/PageMetaTag');
import ContentSearchRefinements = require('./ContentSearchRefinements');
import URL = require('../web/URL');

/**
 * The class is the central interface to a content search result and a content search refinement. It also provides utility methods to generate a search URL.
 */
declare class ContentSearchModel extends SearchModel {

    /**
     * URL Parameter for the content ID
     */
    static readonly CONTENTID_PARAMETER  :  string

    /**
     * URL Parameter for the folder ID
     */
    static readonly FOLDERID_PARAMETER  :  string


    /**
     * An Iterator containing all Content Assets that are the result of the search.
     */
    readonly content  :  Iterator<Content>

    /**
     * The content ID against which the search results apply.
     */
    contentID  :  string

    /**
     * The deepest common folder of all content assets in the search result.
     */
    readonly deepestCommonFolder  :  Folder

    /**
     * The folder against which the search results apply.
     */
    readonly folder  :  Folder

    /**
     * The folder ID against which the search results apply.
     */
    folderID  :  string

    /**
     * The method returns true, if this is a pure search for a folder. The method checks, that a folder ID is specified and no search phrase is specified.
     */
    readonly folderSearch  :  boolean

    /**
     * Reserved for beta users.
    Returns all page meta tags, defined for this instance for which content can be generated.
    The meta tag content is generated based on the content listing page meta tag context and rules. The rules are obtained from the current folder context or inherited from the parent folder, up to the root folder.
    */
    readonly pageMetaTags  :  Array<PageMetaTag>

    /**
     * Get the flag that determines if the folder search will be recursive.
     */
    recursiveFolderSearch  :  boolean

    /**
     * The method returns true, if the search is refined by a folder. The method checks, that a folder ID is specified.
     */
    readonly refinedByFolder  :  boolean

    /**
     * Identifies if this is a folder search and is refined with further criteria, like a name refinement or an attribute refinement.
     */
    readonly refinedFolderSearch  :  boolean

    /**
     * The set of search refinements used in this search.
     */
    readonly refinements  :  ContentSearchRefinements


}

export = ContentSearchModel;
