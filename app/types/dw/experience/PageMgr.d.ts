import Page = require("./Page");
import Region = require("./Region");
import RegionRenderSettings = require("./RegionRenderSettings");
import Product = require('../catalog/Product')
import Category = require('../catalog/Category')
import Map = require('../util/Map')

/**
 * Provides functionality for getting and rendering page designer managed pages. The basic flow is to initiate page rendering by ID via `renderPage(String, String)`. This will trigger page rendering from a top level perspective, i.e. the page serves as entry point and root container of components. As a related page or component template will likely want to trigger rendering of nested components within its regions it can do this by first fetching the desired region by ID via Page.getRegion(String) or Component.getRegion(String) and then call to `renderRegion(Region, RegionRenderSettings)` with the recently retrieved region (and optionally provide RegionRenderSettings for customized rendering of region and component wrapper elements).
 *
 * Various attributes required for rendering in the corresponding template can be accessed with the accordant methods of Page and Component.
 *
 * **Any rendering or retrieval of pages, components and regions will return null in case the page designer feature is turned off. The page designer feature is a beta feature only and must not be used if not explicitly taking part in the corresponding beta program.**
 */
declare class PageMgr {
    private constructor();


}

export = PageMgr;
