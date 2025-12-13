import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import Folder = require('./Folder');
import PageMetaTag = require('../web/PageMetaTag');
import CustomAttributes = require('../object/CustomAttributes');
import Page = require('../experience/Page');

declare global {
    module ICustomAttributes {
        interface Content extends CustomAttributes{
        }
    }
}

/**
 * Class representing a Content asset in Commerce Cloud Digital.
 * @extends ExtensibleObject
 */
declare class Content extends ExtensibleObject<ICustomAttributes.Content> {
    private constructor();
    /**
     * The Folder associated with this Content. The folder is used to determine the
     * classification of the content.
     */
    readonly classificationFolder : Folder | null;
    /**
     * The description in the current locale or null.
     */
    readonly description  :  string | null;
    /**
     * All folders to which this content is assigned.
     */
    readonly folders  :  Collection<Folder>;
    /**
     * The ID of the content asset.
     */
    readonly ID  :  string;
    /**
     * The name of the content asset.
     */
    readonly name  :  string;
    /**
     * The online status of the content.
     */
    readonly online  :  boolean;
    /**
     * The online status flag of the content.
     */
    readonly onlineFlag  :  boolean;
    /**
     * Returns if the content is a Page or not.
     */
    readonly page  :  boolean;
    /**
     * The page description for the content in the current locale or null if there is
     * no page description.
     */
    readonly pageDescription  :  string | null;
    /**
     * The page keywords for the content in the current locale or null if there is no
     * page title.
     */
    readonly pageKeywords  :  string | null;
    /**
     * All page meta tags, defined for this instance for which content can be
     * generated. The meta tag content is generated based on the content detail page meta tag
     * context and rules. The rules are obtained from the current content or inherited from
     * the default folder, up to the root folder.
     */
    readonly pageMetaTags : Array<PageMetaTag>;
    /**
     * The page title for the content in the current locale or null if there is no page
     * title.
     */
    readonly pageTitle  :  string | null;
    /**
     * The page URL for the content in the current locale or null if there is no page
     * URL.
     */
    readonly pageURL  :  string;
    /**
     * The search status of the content.
     */
    readonly searchable  :  boolean;
    /**
     * The searchable status flag of the content.
     */
    readonly searchableFlag  :  boolean;
    /**
     * The contents change frequency needed for the sitemap creation.
     */
    readonly siteMapChangeFrequency  :  string;
    /**
     * The status if the content is included into the sitemap.
     */
    readonly siteMapIncluded  :  number;
    /**
     * The contents priority needed for the sitemap creation. If no priority is
     * defined, the method returns 0.0.
     */
    readonly siteMapPriority  :  number;
    /**
     * The value of attribute 'template'.
     */
    readonly template  :  string;


}

export = Content;
