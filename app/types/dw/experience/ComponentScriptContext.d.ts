import Component = require("./Component");
import Map = require("dw/util/Map");
import ComponentRenderSettings = require("./ComponentRenderSettings");

declare class ComponentScriptContext {
    private constructor();
    readonly component: Component;
    readonly componentRenderSettings: ComponentRenderSettings;
    readonly content: Map<string, object>;

}

export = ComponentScriptContext;
