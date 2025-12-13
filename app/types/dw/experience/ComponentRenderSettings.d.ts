/**
 * A config that drives how the component is rendered. One can basically decide which kind of tag is used as wrapper element (e.g. <div>...</div>) and which attributes are to be placed into this wrapper element (e.g. class="foo bar"). In case no attributes are provided then the system default settings will apply. In case no tag name is provided then the system default one will apply.
 *  - tag_name : div
 *  - attributes : {"class":"experience-component experience-[COMPONENT_TYPE_ID]"}
 * As the [COMPONENT_TYPE_ID] can contain dots due to its package like naming scheme (e.g. assets.image) any occurrences of these dots will be replaced by dashes (e.g. assets-image) so that CSS selectors do not have to be escaped.
 */
declare class ComponentRenderSettings {
    attributes  :  object;
    tagName  :  string;

}

export = ComponentRenderSettings;
