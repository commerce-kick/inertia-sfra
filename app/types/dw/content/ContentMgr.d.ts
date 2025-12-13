import Library = require('./Library');
import Content = require('./Content');
import Folder = require('./Folder');

declare class ContentMgr {
    private constructor();

    /**
     * The content library of the current site.
     */
    readonly siteLibrary: Library | null;


}

export = ContentMgr;
