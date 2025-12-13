import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import PageMetaTag = require('../web/PageMetaTag');
import MarkupText = require('../content/MarkupText');

/**
 * This class represents a page designer managed page. A page comprises of multiple 
 * regions that hold components, which themselves again can have regions holding components, 
 * i.e. spanning a hierarchical tree of components. Using the `PageMgr.renderPage(String, String)`
 * a page can be rendered. As such page implements a render function for creating render output 
 * the render function of the page itself will also want to access its various properties like 
 * the SEO title etc.
 */
declare class Page {
    private constructor();
    readonly description  :  string | null;
    readonly ID  :  string;
    readonly name  :  string;
    readonly visible  :  boolean;
    readonly pageDescription  :  string | null;
    readonly pageKeywords  :  string | null;
    readonly pageMetaTags : Array<PageMetaTag>;
    readonly pageTitle  :  string | null;
    readonly typeID  :  string;

}

export = Page;
