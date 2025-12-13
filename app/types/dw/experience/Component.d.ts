import Region = require("./Region");

/**
 * This class represents a page designer managed component as part of a page. A
 * component comprises of multiple regions that again hold components, thus spanning a
 * hierarchical tree of components. Using the PageMgr.renderRegion(Region) or
 * PageMgr.renderRegion(Region, RegionRenderSettings) a region can be rendered which
 * implicitly includes rendering of all contained visible components. All content
 * attributes (defined by the corresponding component type) can be accessed, reading the
 * accordant persisted values as provided by the content editor who created this component.
 *
 * @see dw.experience.Page
 * @see dw.experience.Region
 * @see dw.experience.PageMgr
 */
declare class Component {
  private constructor();

  /**
   * The id of this component.
   */
  readonly ID: string;

  /**
   * The name of this component.
   */
  readonly name: string;

  /**
   * The type id of this component.
   */
  readonly typeID: string;


}

export = Component;
