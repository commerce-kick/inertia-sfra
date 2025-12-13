import Component = require("./Component");
import ComponentRenderSettings = require("./ComponentRenderSettings");

/**
 * A config that drives how the region is rendered. One can basically decide which kind of tag is used as wrapper element (e.g. <div>...</div>) and which attributes are to be placed into this wrapper element (e.g. class="foo bar").
 * If no attributes are provided for the region render settings then the system default ones will apply. Also if no tag name is provided then the system default one will apply.
 * - tag_name : `div`
 * - attributes : `{"class":"experience-region experience-[REGION_ID]"}`
 * Furthermore the render settings for components in this region can be specified - in case nothing is set per component then the default component render setting will be applied during rendering. If also no default component render setting is provided then the system default one will apply (see ComponentRenderSettings).
 */
declare class RegionRenderSettings {
    attributes  :  object;
    defaultComponentRenderSettings  :  ComponentRenderSettings;
    tagName  :  string;

}

export = RegionRenderSettings;
