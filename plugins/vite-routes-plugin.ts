import { resolve, basename, dirname, relative, join } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { sync } from "glob";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"; // Import Vite types

// Define interfaces for better type safety
interface SfccRouteOptions {
  controllersDir?: string;
  outputDir?: string;
  uriPattern?: "Controller-Action" | "Controller/Action";
  generateIndex?: boolean;
  defaultLocale?: string;
  // Base URL pattern with ${locale} placeholder
  siteUrlPattern?: string;
}

// Extend RouteInfo to have a function for URI
export interface RouteInfo {
  methods: ("GET" | "POST")[]; // More specific than string[]
  controller: string;
  action: string;
  source: string;
  // URI is a function that takes an optional locale
  uri: (locale?: string) => string;
}

// Helper type for query parameters
export type QueryParams = Record<string, string | number | boolean>;

// Helper function to ensure the output directory exists
function ensureDirExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`[vite-sfcc-routes] Created directory: ${dirPath}`);
  }
}

// Helper to clean a filename
function toSafeFileName(name: string): string {
  return name.replace(/-/g, "_");
}

// The main plugin function
function sfccRoutesGenerator(options: SfccRouteOptions = {}): Plugin {
  // --- Configuration ---
  const {
    // Default pattern finds controllers in any cartridge structure
    controllersDir = "**/cartridge/controllers",
    // Default output directory for all the route files
    outputDir = "./app/generated/routes",
    uriPattern = "Controller-Action",
    generateIndex = true,
    // Default locale
    defaultLocale = "en_US",
    // Default URL pattern with locale placeholder
    siteUrlPattern = "/on/demandware.store/Sites-RefArch-Site/${locale}/",
  } = options;

  const resolvedControllersPattern = resolve(process.cwd(), controllersDir);
  const resolvedOutputDir = resolve(process.cwd(), outputDir);
  const resolvedTypesPath = resolve(resolvedOutputDir, "_types.ts");
  const resolvedHelperPath = resolve(resolvedOutputDir, "_helpers.ts");
  const resolvedIndexPath = resolve(resolvedOutputDir, "index.ts");

  // --- Route Generation Logic ---
  function generateRoutes(): void {
    console.log(
      `[vite-sfcc-routes] Starting route generation from pattern: ${controllersDir}`
    );

    // Ensure output directory exists
    ensureDirExists(resolvedOutputDir);

    // Use Record for typed object map with routes
    const routes: Record<
      string,
      {
        methods: ("GET" | "POST")[];
        controller: string;
        action: string;
        source: string;
        uriTemplate: string;
      }
    > = {};

    const controllerFiles = sync(`${resolvedControllersPattern}/**/*.js`, {
      absolute: true,
      ignore: ["**/node_modules/**"],
    });

    if (controllerFiles.length === 0) {
      console.warn(
        `[vite-sfcc-routes] No controller files found matching pattern: ${resolvedControllersPattern}/**/*.js`
      );

      // Generate minimal types file
      writeFileSync(
        resolvedTypesPath,
        `
// No controllers found matching pattern: ${controllersDir}
export interface RouteInfo {
  methods: ('GET' | 'POST')[];
  controller: string;
  action: string;
  source: string;
  uri: (locale?: string) => string;
}

export type QueryParams = Record<string, string | number | boolean>;

export type RouteKey = never;
`
      );

      // Generate empty helper file
      generateHelperFile([], defaultLocale);

      // Generate empty index file
      if (generateIndex) {
        writeFileSync(
          resolvedIndexPath,
          `// No routes found\nexport * from './_helpers';\n`
        );
      }

      return;
    }

    console.log(
      `[vite-sfcc-routes] Found ${controllerFiles.length} potential controller files.`
    );

    const routeRegex =
      /server\.(get|post|append|prepend|replace)\s*\(\s*['"]([^'"]+)['"]/g;

    controllerFiles.forEach((file) => {
      try {
        const content = readFileSync(file, "utf-8");
        const controllerName = basename(file, ".js");
        const matches = content.matchAll(routeRegex);

        for (const match of matches) {
          const httpMethodType = match[1];
          const action = match[2];

          let methods: ("GET" | "POST")[];
          switch (httpMethodType) {
            case "get":
              methods = ["GET"];
              break;
            case "post":
              methods = ["POST"];
              break;
            default:
              methods = ["GET", "POST"];
              break;
          }

          const routeName = `${controllerName}-${action}`;
          let relativePath: string;
          if (uriPattern === "Controller/Action") {
            relativePath = `${controllerName}/${action}`;
          } else {
            relativePath = `${controllerName}-${action}`;
          }

          // Store just the URL template for now
          const uriTemplate = `${siteUrlPattern}${relativePath}`;

          /*  if (routes[routeName]) {
            console.warn(
              `[vite-sfcc-routes] Duplicate route key detected: "${routeName}". Overwriting previous definition (Source: ${relative(process.cwd(), file)})`
            );
          } */

          routes[routeName] = {
            methods,
            controller: controllerName,
            action: action,
            source: relative(process.cwd(), file),
            uriTemplate,
          };
        }
      } catch (error: unknown) {
        console.error(
          `[vite-sfcc-routes] Error processing file ${relative(process.cwd(), file)}:`,
          (error as Error).message
        );
      }
    });

    // Generate route type definitions
    generateTypesFile(Object.keys(routes));

    // Generate helpers file
    generateHelperFile(Object.keys(routes), defaultLocale);

    // Generate individual route files
    generateRouteFiles(routes);

    // Generate index barrel file if requested
    if (generateIndex) {
      generateIndexFile(Object.keys(routes));
    }

    console.log(
      `[vite-sfcc-routes] Successfully generated ${Object.keys(routes).length} routes to: ${relative(process.cwd(), resolvedOutputDir)}`
    );
  }

  // Generate the shared types file
  function generateTypesFile(routeKeys: string[]): void {
    const routeKeyType =
      routeKeys.length > 0
        ? `export type RouteKey = ${routeKeys.map((key) => `'${key}'`).join(" | ")};`
        : "export type RouteKey = never;";

    const typesContent = `// Auto-generated by vite-sfcc-routes-generator on ${new Date().toISOString()}
// Do not edit this file manually!

export type QueryParams = Record<string, string | number | boolean>;

export interface RouteInfo {
  methods: ('GET' | 'POST')[];
  controller: string;
  action: string;
  source: string;
  // URI is a function that takes an optional locale parameter
  uri: (locale?: string) => string;
}

// Function to add query parameters to a URL
export function addQueryParams(url: string, params?: QueryParams): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const urlObj = new URL(url, 'http://base-placeholder.com');
  
  for (const [key, value] of Object.entries(params)) {
    urlObj.searchParams.set(key, String(value));
  }
  
  // If the original URL was relative, return a relative URL
  if (!url.startsWith('http')) {
    return \`\${urlObj.pathname}\${urlObj.search}\`;
  }
  
  return urlObj.toString();
}

${routeKeyType}
`;

    try {
      writeFileSync(resolvedTypesPath, typesContent, "utf-8");
    } catch (error: unknown) {
      console.error(
        `[vite-sfcc-routes] Error writing types file to ${relative(process.cwd(), resolvedTypesPath)}:`,
        (error as Error).message
      );
    }
  }

  // Generate the helper file
  function generateHelperFile(
    routeKeys: string[],
    defaultLocale: string
  ): void {
    const helperContent = `// Auto-generated by vite-sfcc-routes-generator on ${new Date().toISOString()}
// Do not edit this file manually!

import type { RouteInfo, RouteKey, QueryParams } from "./_types";
import { addQueryParams } from "./_types";

/**
 * Get URL from route with current locale and optional parameters
 *
 * @param route The route object
 * @param params Optional query parameters
 * @returns The URL with current locale and parameters
 */
export function getUrl(
  route: RouteInfo,
  params?: QueryParams,
  locale = "en_US"
): string {
  return addQueryParams(route.uri(locale), params);
}

/**
 * Create route helpers for a group of routes
 *
 * @param routes Object containing routes
 * @returns Object with helper methods for all routes
 */
export function createRouteHelpers<K extends RouteKey>(
  routes: Record<K, RouteInfo>,
  locale = "en_US"
) {
  const helpers: Record<
    string,
    (params?: QueryParams, locale?: string) => string
  > = {};

  for (const [key, route] of Object.entries(routes)) {
    // Create a helper function for each route
    helpers[key] = (params?: QueryParams, specificLocale?: string): string => {
      return addQueryParams(route.uri(specificLocale || locale), params);
    };
  }

  return {
    // Get URL for any route in the group
    url: <T extends K>(routeKey: T, params?: QueryParams): string => {
      const route = routes[routeKey];
      return addQueryParams(route.uri(locale), params);
    },

    // All individual route helpers
    ...helpers,

    // The original routes for direct access if needed
    routes,
  };
}

/**
 * Get URL for a specific route with parameters
 *
 * @param route The route object
 * @param params Optional query parameters
 * @param locale Optional specific locale (defaults to current)
 * @returns The URL with specified locale and parameters
 */
export function getRouteUrl(
  route: RouteInfo,
  params?: QueryParams,
  locale?: string
): string {
  return addQueryParams(route.uri(locale), params);
}

`;

    try {
      writeFileSync(resolvedHelperPath, helperContent, "utf-8");
    } catch (error: unknown) {
      console.error(
        `[vite-sfcc-routes] Error writing helper file to ${relative(process.cwd(), resolvedHelperPath)}:`,
        (error as Error).message
      );
    }
  }

  // Generate individual files for each route
  function generateRouteFiles(
    routes: Record<
      string,
      {
        methods: ("GET" | "POST")[];
        controller: string;
        action: string;
        source: string;
        uriTemplate: string;
      }
    >
  ): void {
    // Remove any existing route files that might no longer be valid
    const existingFiles = sync(`${resolvedOutputDir}/*.ts`, {
      ignore: [resolvedIndexPath, resolvedTypesPath, resolvedHelperPath].map(
        (p) => relative(process.cwd(), p)
      ),
    });

    // Delete files that don't match our current routes
    existingFiles.forEach((file) => {
      const fileName = basename(file, ".ts");
      const isHelperFile =
        fileName === "_types" ||
        fileName === "_helpers" ||
        fileName === "index";

      // If it's not a helper file and not in our current routes, delete it
      if (
        !isHelperFile &&
        !Object.keys(routes).some((r) => toSafeFileName(r) === fileName)
      ) {
        try {
          // Instead of unlinking, we'll write an empty export to not break existing imports
          writeFileSync(
            file,
            `// This route is no longer available
import { RouteInfo } from './_types';

const route: RouteInfo = { 
  methods: [], 
  controller: '', 
  action: '', 
  source: '',
  uri: () => ''
};

export default route;
`
          );
          console.log(
            `[vite-sfcc-routes] Route no longer exists, emptied file: ${relative(process.cwd(), file)}`
          );
        } catch (err) {
          console.error(
            `[vite-sfcc-routes] Error updating legacy route file: ${relative(process.cwd(), file)}`
          );
        }
      }
    });

    // Generate each route file
    Object.entries(routes).forEach(([routeName, routeInfo]) => {
      const fileName = toSafeFileName(routeName);
      const filePath = join(resolvedOutputDir, `${fileName}.ts`);

      const fileContent = `// Auto-generated by vite-sfcc-routes-generator on ${new Date().toISOString()}
// Route: ${routeName} - From: ${routeInfo.source}
// Do not edit this file manually!

import type { RouteInfo, QueryParams } from './_types';
import { getRouteUrl } from './_helpers';

const route: RouteInfo = {
  methods: ${JSON.stringify(routeInfo.methods)},
  controller: "${routeInfo.controller}",
  action: "${routeInfo.action}",
  source: "${routeInfo.source}",
  // Functional URI that accepts locale
  uri: (locale = "${defaultLocale}") => 
    "${routeInfo.uriTemplate}".replace(/\\$\\{locale\\}/g, locale)
};

/**
 * Get the URL with query parameters
 * 
 * @param params Optional query parameters to add
 * @param locale Optional locale (defaults to page locale)
 * @returns The URL with locale and parameters
 */
export function getURL(params?: QueryParams, locale?: string): string {
  return getRouteUrl(route, params, locale);
}

export default route;
`;

      try {
        writeFileSync(filePath, fileContent, "utf-8");
      } catch (error: unknown) {
        console.error(
          `[vite-sfcc-routes] Error writing route file to ${relative(process.cwd(), filePath)}:`,
          (error as Error).message
        );
      }
    });
  }

  // Generate the index barrel file
  function generateIndexFile(routeKeys: string[]): void {
    const exports = routeKeys
      .map((routeName) => {
        const safeFileName = toSafeFileName(routeName);
        return `export { default as ${safeFileName}, getURL as get${safeFileName}URL } from './${safeFileName}';`;
      })
      .join("\n");

    const indexContent = `// Auto-generated by vite-sfcc-routes-generator on ${new Date().toISOString()}
// Barrel file for all routes
// Do not edit this file manually!

// Route exports
${exports}

// Helper exports
export {
  getUrl,
  createRouteHelpers,
  getRouteUrl
} from './_helpers';

// Type exports
export type { RouteInfo, RouteKey, QueryParams } from './_types';
export { addQueryParams } from './_types';
`;

    try {
      writeFileSync(resolvedIndexPath, indexContent, "utf-8");
    } catch (error: unknown) {
      console.error(
        `[vite-sfcc-routes] Error writing index file to ${relative(process.cwd(), resolvedIndexPath)}:`,
        (error as Error).message
      );
    }
  }

  // --- Vite Plugin Hooks ---
  return {
    name: "vite-sfcc-routes-generator",
    configResolved(resolvedConfig: ResolvedConfig) {
      // Optional: Log mode if needed
      // console.log(`[vite-sfcc-routes] Vite mode: ${resolvedConfig.mode}`);
    },
    enforce: "pre",
    buildStart() {
      generateRoutes();
    },
    configureServer(server: ViteDevServer) {
      const handleFileChange = (file: string | undefined) => {
        // Check if file path is valid and within the watched structure
        if (
          file &&
          file.endsWith(".js") &&
          file.includes(dirname(resolvedControllersPattern))
        ) {
          console.log(
            `[vite-sfcc-routes] File changed: ${relative(process.cwd(), file)}. Regenerating routes...`
          );
          generateRoutes();
          // Optional HMR - may require specific setup depending on how routes are consumed
          // server.ws.send({ type: 'full-reload', path: '*' });
        }
      };
      // Watch the directory containing the pattern recursively
      const watchPath = dirname(resolvedControllersPattern) + "/**";
      console.log(`[vite-sfcc-routes] Watching for changes in: ${watchPath}`);
      server.watcher.add(watchPath);
      server.watcher.on("change", handleFileChange);
      server.watcher.on("add", handleFileChange);
      server.watcher.on("unlink", handleFileChange);
      generateRoutes(); // Initial generation
    },
  };
}

export default sfccRoutesGenerator;
