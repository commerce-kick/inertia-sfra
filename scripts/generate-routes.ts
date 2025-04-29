import sfccRoutesGenerator from "../plugins/vite-routes-plugin.ts";

// Create an instance of the plugin
const plugin = sfccRoutesGenerator({
  controllersDir: "**/cartridge/controllers",
  outputDir: "./app/generated/routes",
  uriPattern: "Controller-Action",
  generateIndex: true,
});

// Call the plugin's generateRoutes function directly
console.log("[Pre-SSR-Build] Manually generating routes...");

plugin.buildStart();
