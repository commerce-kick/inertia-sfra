import sfccDtoTypesGenerator from "../plugins/vite-dto-types-plugin.ts";
import sfccRoutesGenerator from "../plugins/vite-routes-plugin.ts";

// Create an instance of the plugin
const plugin = sfccRoutesGenerator({
  controllersDir: "**/cartridge/controllers",
  outputDir: "./app/generated/routes",
  uriPattern: "Controller-Action",
  generateIndex: true,
});

const dtoPlugin = sfccDtoTypesGenerator();

// Call the plugins' generate functions directly
console.log("[Pre-SSR-Build] Manually generating routes and DTO types...");

plugin.buildStart();
dtoPlugin.buildStart();
