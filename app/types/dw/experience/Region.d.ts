import Collection = require("dw/util/Collection");
import PageMetaTag = require("dw/web/PageMetaTag");
import Component = require("./Component");

/**
 * This class represents a region which serves as container of components. Using the `PageMgr.renderRegion(Region)` or `PageMgr.renderRegion(Region, RegionRenderSettings)` a region can be rendered.
 */
declare class Region {
    private constructor();
    readonly ID  :  string;
    readonly size  :  string;
    readonly visibleComponents  :  Collection<Component>;

}

export = Region;
