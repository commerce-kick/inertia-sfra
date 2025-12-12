import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { sync } from "glob";
import { basename, dirname, join, relative, resolve } from "path";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * HTTP methods supported by SFCC routes
 */
export type HttpMethod = 'GET' | 'POST';

/**
 * Parameter definition parsed from JSDoc
 */
export interface ParamDefinition {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

/**
 * Query parameters for URL building
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Options for building a route URL
 */
export interface UrlOptions<T extends QueryParams = QueryParams> {
  /** Query parameters to append to the URL */
  params?: T;
  /** Locale code (e.g., 'en_US', 'fr_FR') */
  locale?: string;
}

/**
 * Route metadata and URL builder
 */
export interface Route<T extends QueryParams = QueryParams> {
  /** HTTP methods this route supports */
  readonly methods: readonly HttpMethod[];
  /** Controller name */
  readonly controller: string;
  /** Action name */
  readonly action: string;
  /** Source file path (relative to project root) */
  readonly source: string;
  /** Relative path (e.g., 'Product-Show') */
  readonly path: string;
  /** Parameter definitions from JSDoc */
  readonly params: readonly ParamDefinition[];
  
  /**
   * Build a URL for this route
   */
  url(options?: UrlOptions<T>): string;
  
  /**
   * Check if this route supports a specific HTTP method
   */
  supports(method: HttpMethod): boolean;
}

/**
 * Configuration options for the SFCC routes plugin
 */
export interface SfccRouteOptions {
  /**
   * Source configuration
   */
  source?: {
    /** Glob pattern for controller files (default: "cartridge/controllers") */
    pattern?: string;
    /** Patterns to ignore */
    ignore?: string[];
    /** 
     * Cartridge path order (highest priority first)
     * Routes from earlier cartridges override later ones
     * @example ['app_custom', 'app_storefront_base']
     */
    cartridgePath?: string[];
  };
  
  /**
   * Output configuration
   */
  output?: {
    /** Output directory for generated files (default: "./app/generated/routes") */
    dir?: string;
    /** Generate index barrel file (default: true) */
    generateIndex?: boolean;
  };
  
  /**
   * URL configuration
   */
  url?: {
    /** URL pattern style (default: "Controller-Action") */
    pattern?: "Controller-Action" | "Controller/Action";
    /** Base URL template with ${locale} placeholder */
    baseTemplate?: string;
  };
  
  /**
   * Locale configuration
   */
  locale?: {
    /** Default locale (default: "en_US") */
    default?: string;
    /** List of supported locales for validation */
    supported?: string[];
  };
  
  /**
   * Parameter merging strategy
   */
  params?: {
    /** 
     * How to handle duplicate routes across cartridges
     * - 'override': Later cartridge completely replaces earlier (default)
     * - 'merge': Merge parameters from all cartridges
     */
    mergeStrategy?: 'override' | 'merge';
  };
}

// ============================================================================
// Internal Types
// ============================================================================

interface RouteDefinition {
  methods: readonly HttpMethod[];
  controller: string;
  action: string;
  source: string;
  cartridge: string; // Cartridge name for priority tracking
  urlTemplate: string;
  relativePath: string;
  params: ParamDefinition[];
}

// ============================================================================
// JSDoc Parsing Functions
// ============================================================================

/**
 * Parse JSDoc comments to extract parameter definitions
 * 
 * @example
 * Input:
 * ```
 * /**
 *  * @param pid optional string the product id
 *  * @param color required string the color variant
 *  *\/
 * server.get("Show")
 * ```
 * 
 * Output:
 * [
 *   { name: 'pid', type: 'string', optional: true, description: 'the product id' },
 *   { name: 'color', type: 'string', optional: false, description: 'the color variant' }
 * ]
 */
function parseJSDocParams(jsDocComment: string): ParamDefinition[] {
  const params: ParamDefinition[] = [];
  
  // Match @param lines with various formats:
  // @param pid optional string the product id
  // @param {string} pid the product id (optional)
  // @param pid string the product id
  const paramRegex = /@param\s+(?:\{([^}]+)\}\s+)?(\w+)\s+(optional|required)?\s*([a-zA-Z]+)?\s*(.*)/g;
  
  let match;
  while ((match = paramRegex.exec(jsDocComment)) !== null) {
    const [, typeInBraces, name, optionalKeyword, typeWord, description] = match;
    
    // Determine if optional
    const optional = optionalKeyword === 'optional' || 
                     description?.toLowerCase().includes('optional');
    
    // Determine type (prefer {type} syntax, fallback to word after name)
    let type = typeInBraces || typeWord || 'string';
    type = normalizeType(type);
    
    params.push({
      name: name.trim(),
      type,
      optional,
      description: description?.trim() || undefined,
    });
  }
  
  return params;
}

/**
 * Normalize type names to TypeScript types
 */
function normalizeType(type: string): string {
  const normalized = type.toLowerCase().trim();
  
  const typeMap: Record<string, string> = {
    'string': 'string',
    'str': 'string',
    'number': 'number',
    'num': 'number',
    'int': 'number',
    'integer': 'number',
    'float': 'number',
    'boolean': 'boolean',
    'bool': 'boolean',
    'array': 'string[]',
    'object': 'Record<string, any>',
  };
  
  return typeMap[normalized] || 'string';
}

/**
 * Merge parameters from multiple route definitions
 * Combines unique parameters and updates descriptions
 */
function mergeParams(existingParams: ParamDefinition[], newParams: ParamDefinition[]): ParamDefinition[] {
  const paramMap = new Map<string, ParamDefinition>();
  
  // Add existing params
  existingParams.forEach(param => {
    paramMap.set(param.name, { ...param });
  });
  
  // Merge or add new params
  newParams.forEach(param => {
    const existing = paramMap.get(param.name);
    if (existing) {
      // Merge: if new param has description and old doesn't, use new
      // If both required, keep required
      paramMap.set(param.name, {
        name: param.name,
        type: param.type, // Use latest type definition
        optional: existing.optional && param.optional, // Required if any definition says required
        description: param.description || existing.description,
      });
    } else {
      paramMap.set(param.name, { ...param });
    }
  });
  
  return Array.from(paramMap.values());
}

/**
 * Extract cartridge name from file path
 */
function extractCartridgeName(filePath: string): string {
  const match = filePath.match(/cartridges?\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Extract JSDoc comment before a server method call
 */
function extractJSDocBeforeRoute(content: string, routeStartIndex: number): string | null {
  // Look backwards from route definition to find JSDoc comment
  const beforeRoute = content.substring(0, routeStartIndex);
  
  // Match the last /** ... */ comment before the route
  const jsDocRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
  let lastMatch: RegExpMatchArray | null = null;
  let match;
  
  while ((match = jsDocRegex.exec(beforeRoute)) !== null) {
    lastMatch = match;
  }
  
  if (lastMatch) {
    // Check if there's only whitespace between comment and route
    const betweenCommentAndRoute = beforeRoute.substring(
      lastMatch.index! + lastMatch[0].length
    );
    
    if (/^\s*$/.test(betweenCommentAndRoute)) {
      return lastMatch[1];
    }
  }
  
  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Ensure a directory exists, creating it if necessary
 */
function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`[sfcc-routes] Created directory: ${dirPath}`);
  }
}

/**
 * Convert a route name to a safe TypeScript identifier
 * @example "Product-Show" => "ProductShow"
 */
function toIdentifier(name: string): string {
  return name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Convert a route name to a safe file name
 * @example "Product-Show" => "product-show"
 */
function toFileName(name: string): string {
  return name.toLowerCase().replace(/_/g, '-');
}

/**
 * Validate locale format (e.g., 'en_US', 'fr_FR')
 */
function validateLocale(locale: string, supported?: string[]): void {
  if (!/^[a-z]{2}_[A-Z]{2}$/.test(locale)) {
    throw new Error(
      `Invalid locale format: "${locale}". Expected format: en_US, fr_FR, etc.`
    );
  }
  
  if (supported && !supported.includes(locale)) {
    console.warn(
      `[sfcc-routes] Locale "${locale}" is not in the supported list: ${supported.join(', ')}`
    );
  }
}

// ============================================================================
// Code Generation Functions
// ============================================================================

/**
 * Generate TypeScript interface for route parameters
 */
function generateParamsInterface(params: ParamDefinition[]): string {
  if (params.length === 0) {
    return 'QueryParams';
  }
  
  const properties = params.map(param => {
    const optionalMarker = param.optional ? '?' : '';
    const comment = param.description 
      ? `  /** ${param.description} */\n`
      : '';
    
    return `${comment}  ${param.name}${optionalMarker}: ${param.type};`;
  }).join('\n');
  
  // Add index signature to allow additional properties
  return `{\n${properties}\n  [key: string]: string | number | boolean | undefined;\n}`;
}

/**
 * Generate the types.ts file
 */
function generateTypesFile(
  outputPath: string,
  routes: Record<string, RouteDefinition>
): void {
  const routeKeys = Object.keys(routes);
  const routeKeyType = routeKeys.length > 0
    ? `export type RouteKey = ${routeKeys.map(k => `'${k}'`).join(' | ')};`
    : `export type RouteKey = never;`;

  // Generate parameter types for each route
  const paramTypes = Object.entries(routes)
    .filter(([, route]) => route.params.length > 0)
    .map(([routeName, route]) => {
      const identifier = toIdentifier(routeName);
      const paramsInterface = generateParamsInterface(route.params);
      
      return `/**
 * Parameters for ${route.controller}.${route.action}
 * 
 * Route: ${routeName}
 */
export interface ${identifier}Params ${paramsInterface}`;
    })
    .join('\n\n');

  const content = `// Auto-generated by vite-plugin-sfcc-routes
// Generated: ${new Date().toISOString()}
// Do not edit this file manually

/**
 * HTTP methods supported by SFCC routes
 */
export type HttpMethod = 'GET' | 'POST';

/**
 * Query parameters for URL building
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Parameter definition parsed from JSDoc
 */
export interface ParamDefinition {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

/**
 * Options for building a route URL
 */
export interface UrlOptions<T extends QueryParams = QueryParams> {
  /** Query parameters to append to the URL */
  params?: T;
  /** Locale code (e.g., 'en_US', 'fr_FR') */
  locale?: string;
}

/**
 * Route metadata and URL builder
 */
export interface Route<T extends QueryParams = QueryParams> {
  /** HTTP methods this route supports */
  readonly methods: readonly HttpMethod[];
  /** Controller name */
  readonly controller: string;
  /** Action name */
  readonly action: string;
  /** Source file path (relative to project root) */
  readonly source: string;
  /** Relative path (e.g., 'Product-Show') */
  readonly path: string;
  /** Parameter definitions */
  readonly params: readonly ParamDefinition[];
  
  /**
   * Build a URL for this route
   */
  url(options?: UrlOptions<T>): string;
  
  /**
   * Check if this route supports a specific HTTP method
   */
  supports(method: HttpMethod): boolean;
}

/**
 * Union type of all available route keys
 */
${routeKeyType}

// ============================================================================
// Route Parameter Types
// ============================================================================

${paramTypes || '// No routes with documented parameters'}
`;

  writeFileSync(outputPath, content, 'utf-8');
}

/**
 * Generate the utils.ts file with helper functions
 */
function generateUtilsFile(
  outputPath: string,
  defaultLocale: string
): void {
  const content = `// Auto-generated by vite-plugin-sfcc-routes
// Generated: ${new Date().toISOString()}
// Do not edit this file manually

import type { Route, RouteKey, QueryParams, UrlOptions } from './types';

/**
 * Add query parameters to a URL
 */
export function addQueryParams(url: string, params?: QueryParams): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const urlObj = new URL(url, 'http://placeholder.local');
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      urlObj.searchParams.set(key, String(value));
    }
  }
  
  // Return relative URL if input was relative
  if (!url.startsWith('http')) {
    return \`\${urlObj.pathname}\${urlObj.search}\`;
  }
  
  return urlObj.toString();
}

/**
 * Create a route collection with helper methods
 * 
 * @param routes - Object containing all routes
 * @param defaultLocale - Default locale for URL building
 * @returns Route collection with helper methods
 * 
 * @example
 * \`\`\`ts
 * const routes = createRoutes({ ProductShow, CartAdd }, 'en_US');
 * routes.url('ProductShow', { params: { pid: '123' } });
 * \`\`\`
 */
export function createRoutes<T extends Record<string, Route<any>>>(
  routes: T,
  defaultLocale = '${defaultLocale}'
) {
  return {
    /**
     * Get a route by key
     */
    get<K extends keyof T>(key: K): T[K] {
      return routes[key];
    },
    
    /**
     * Build a URL for any route
     */
    url<K extends keyof T>(
      key: K,
      options?: UrlOptions<any>
    ): string {
      const route = routes[key];
      return route.url({
        locale: defaultLocale,
        ...options,
      });
    },
    
    /**
     * Access all routes
     */
    all: routes,
  };
}
`;

  writeFileSync(outputPath, content, 'utf-8');
}

/**
 * Generate individual route files
 */
function generateRouteFiles(
  routes: Record<string, RouteDefinition>,
  outputDir: string,
  defaultLocale: string
): void {
  // Clean up old route files
  const existingFiles = sync(`${outputDir}/*.ts`, {
    ignore: [
      join(outputDir, 'index.ts'),
      join(outputDir, 'types.ts'),
      join(outputDir, 'utils.ts'),
    ],
  });

  const currentRouteFiles = new Set(
    Object.keys(routes).map(name => join(outputDir, `${toFileName(name)}.ts`))
  );

  // Mark obsolete routes
  existingFiles.forEach(file => {
    if (!currentRouteFiles.has(file)) {
      const placeholderContent = `// This route is no longer available
import type { Route } from './types';

const route: Route = {
  methods: [],
  controller: '',
  action: '',
  source: '',
  path: '',
  params: [],
  url: () => '',
  supports: () => false,
};

export default route;
`;
      writeFileSync(file, placeholderContent, 'utf-8');
      console.log(`[sfcc-routes] ⚠️  Route removed: ${basename(file, '.ts')}`);
    }
  });

  // Generate each route file
  Object.entries(routes).forEach(([routeName, route]) => {
    const identifier = toIdentifier(routeName);
    const fileName = toFileName(routeName);
    const filePath = join(outputDir, `${fileName}.ts`);
    
    // Generate params documentation
    const paramsDoc = route.params.length > 0
      ? `
 * 
 * Parameters:
${route.params.map(p => ` *   - ${p.name}${p.optional ? '?' : ''}: ${p.type}${p.description ? ` - ${p.description}` : ''}`).join('\n')}`
      : '';
    
    // Generate type-safe params interface import/usage
    const hasParams = route.params.length > 0;
    const paramsTypeImport = hasParams 
      ? `, ${identifier}Params` 
      : '';
    const paramsType = hasParams 
      ? `${identifier}Params` 
      : 'QueryParams';

    const content = `// Auto-generated by vite-plugin-sfcc-routes
// Route: ${routeName}
// Source: ${route.source}
// Do not edit this file manually

import type { Route, UrlOptions, QueryParams${paramsTypeImport},  HttpMethod } from './types';
import { addQueryParams } from './utils';

/**
 * ${route.controller}.${route.action}
 * 
 * Methods: ${route.methods.join(', ')}
 * Path: ${route.relativePath}${paramsDoc}
 */
const ${identifier}: Route<${paramsType}> = {
  methods: ${JSON.stringify(route.methods)} as const,
  controller: '${route.controller}',
  action: '${route.action}',
  source: '${route.source}',
  path: '${route.relativePath}',
  params: ${JSON.stringify(route.params, null, 2)} as const,
  
  url(options: UrlOptions<${paramsType}> = {}): string {
    const { params, locale = '${defaultLocale}' } = options;
    const baseUrl = '${route.urlTemplate}'.replace(/\\\${locale}/g, locale);
    return addQueryParams(baseUrl, params);
  },
  
  supports(method: HttpMethod): boolean {
    return this.methods.includes(method);
  },
} as const;

/**
 * Type-safe URL builder for ${identifier}
 * 
 * @param params - Route parameters
 * @param locale - Locale code (optional)
 * @returns Complete URL with parameters
 * 
 * @example
 * \`\`\`ts
 * const url = ${identifier.charAt(0).toLowerCase() + identifier.slice(1)}({ ${route.params[0]?.name || 'param'}: 'value' }, 'en_US');
 * \`\`\`
 */
export function ${identifier.charAt(0).toLowerCase() + identifier.slice(1)}(
  params${hasParams ? '' : '?'}: ${paramsType},
  locale?: string
): string {
  return ${identifier}.url({ params, locale });
}

export default ${identifier};
`;

    writeFileSync(filePath, content, 'utf-8');
  });
}

/**
 * Generate the index.ts barrel file
 */
function generateIndexFile(
  outputPath: string,
  routes: Record<string, RouteDefinition>
): void {
  const routeNames = Object.keys(routes);
  
  const exports = routeNames
    .map(name => {
      const identifier = toIdentifier(name);
      const fileName = toFileName(name);
      const functionName = identifier.charAt(0).toLowerCase() + identifier.slice(1);
      return `export { default as ${identifier}, ${functionName} } from './${fileName}';`;
    })
    .join('\n');
  
  // Export param types
  const paramTypeExports = Object.entries(routes)
    .filter(([, route]) => route.params.length > 0)
    .map(([name]) => `${toIdentifier(name)}Params`)
    .join(', ');

  const content = `// Auto-generated by vite-plugin-sfcc-routes
// Generated: ${new Date().toISOString()}
// Do not edit this file manually

// Route exports
${exports}

// Utility exports
export { createRoutes, addQueryParams } from './utils';

// Type exports
export type { 
  Route, 
  RouteKey, 
  QueryParams, 
  UrlOptions, 
  HttpMethod,
  ParamDefinition${paramTypeExports ? `,\n  ${paramTypeExports}` : ''}
} from './types';
`;

  writeFileSync(outputPath, content, 'utf-8');
}

// ============================================================================
// Main Plugin Function
// ============================================================================

/**
 * Vite plugin for generating type-safe SFCC routes with JSDoc parameter parsing
 * 
 * @param options - Plugin configuration options
 * @returns Vite plugin instance
 * 
 * @example
 */
export default function sfccRoutesPlugin(options: SfccRouteOptions = {}): Plugin {
  // Parse and validate configuration
  const sourcePattern = options.source?.pattern ?? '**/cartridge/controllers';
  const sourceIgnore = options.source?.ignore ?? ['**/node_modules/**'];
  const cartridgePath = options.source?.cartridgePath ?? [];
  const outputDir = options.output?.dir ?? './app/generated/routes';
  const generateIndex = options.output?.generateIndex ?? true;
  const urlPattern = options.url?.pattern ?? 'Controller-Action';
  const urlBase = options.url?.baseTemplate ?? '/on/demandware.store/Sites-RefArch-Site/${locale}/';
  const defaultLocale = options.locale?.default ?? 'en_US';
  const supportedLocales = options.locale?.supported;
  const mergeStrategy = options.params?.mergeStrategy ?? 'override';

  // Validate default locale
  validateLocale(defaultLocale, supportedLocales);

  // Resolve paths
  const resolvedPattern = resolve(process.cwd(), sourcePattern);
  const resolvedOutputDir = resolve(process.cwd(), outputDir);
  const typesPath = join(resolvedOutputDir, 'types.ts');
  const utilsPath = join(resolvedOutputDir, 'utils.ts');
  const indexPath = join(resolvedOutputDir, 'index.ts');

  /**
   * Main route generation logic
   */
  function generateRoutes(): void {
    console.log(`[sfcc-routes] Scanning pattern: ${sourcePattern}`);

    // Ensure output directory exists
    ensureDir(resolvedOutputDir);

    const routes: Record<string, RouteDefinition> = {};

    // Find all controller files
    const controllerFiles = sync(`${resolvedPattern}/**/*.js`, {
      absolute: true,
      ignore: sourceIgnore,
    });

    if (controllerFiles.length === 0) {
      console.warn(
        `[sfcc-routes] ⚠️  No controller files found matching: ${sourcePattern}`
      );

      // Generate minimal files
      generateTypesFile(typesPath, {});
      generateUtilsFile(utilsPath, defaultLocale);
      
      if (generateIndex) {
        writeFileSync(
          indexPath,
          `// No routes found\nexport * from './utils';\nexport * from './types';\n`
        );
      }

      return;
    }

    console.log(`[sfcc-routes] Found ${controllerFiles.length} controller files`);

    // If cartridge path is specified, sort files by cartridge priority
    if (cartridgePath.length > 0) {
      controllerFiles.sort((a, b) => {
        const cartridgeA = extractCartridgeName(a);
        const cartridgeB = extractCartridgeName(b);
        
        const indexA = cartridgePath.indexOf(cartridgeA);
        const indexB = cartridgePath.indexOf(cartridgeB);
        
        // Lower index = higher priority (comes first)
        // If not in path, treat as lowest priority (highest number)
        const priorityA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const priorityB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
        
        return priorityA - priorityB;
      });
      
      console.log(`[sfcc-routes] Cartridge priority order: ${cartridgePath.join(' > ')}`);
    }

    // Regex to match route definitions
    const routeRegex = /server\.(get|post|append|prepend|replace)\s*\(\s*['"]([^'"]+)['"]/g;

    // Process each controller file
    controllerFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf-8');
        const controllerName = basename(file, '.js');
        const cartridge = extractCartridgeName(file);
        
        // Find all route matches with their positions
        const matches = Array.from(content.matchAll(routeRegex));

        for (const match of matches) {
          const [fullMatch, methodType, action] = match;
          const routeStartIndex = match.index!;

          // Extract JSDoc comment before this route
          const jsDocComment = extractJSDocBeforeRoute(content, routeStartIndex);
          const params = jsDocComment ? parseJSDocParams(jsDocComment) : [];

          // Determine HTTP methods
          let methods: readonly HttpMethod[];
          if (methodType === 'get') {
            methods = ['GET'] as const;
          } else if (methodType === 'post') {
            methods = ['POST'] as const;
          } else {
            methods = ['GET', 'POST'] as const;
          }

          const routeName = `${controllerName}-${action}`;
          
          // Build relative path based on pattern
          const relativePath = urlPattern === 'Controller/Action'
            ? `${controllerName}/${action}`
            : `${controllerName}-${action}`;

          // Check for existing route
          const existingRoute = routes[routeName];
          
          if (existingRoute) {
            if (mergeStrategy === 'merge') {
              // Merge parameters from both definitions
              const mergedParams = mergeParams(existingRoute.params, params);
              
              console.log(
                `[sfcc-routes] 🔀 Merging route: "${routeName}"\n` +
                `   Base: ${existingRoute.cartridge} (${existingRoute.params.length} params)\n` +
                `   Adding: ${cartridge} (${params.length} params)\n` +
                `   Result: ${mergedParams.length} total params`
              );
              
              // Keep the higher priority cartridge's main definition but merge params
              routes[routeName] = {
                ...existingRoute,
                params: mergedParams,
              };
            } else {
              // Override: higher priority cartridge wins
              const existingPriority = cartridgePath.indexOf(existingRoute.cartridge);
              const newPriority = cartridgePath.indexOf(cartridge);
              
              // If new cartridge has higher priority (lower index), override
              if (cartridgePath.length === 0 || newPriority < existingPriority || existingPriority === -1) {
                console.log(
                  `[sfcc-routes] ♻️  Overriding route: "${routeName}"\n` +
                  `   Previous: ${existingRoute.cartridge}\n` +
                  `   Current:  ${cartridge} (higher priority)`
                );
                
                routes[routeName] = {
                  methods,
                  controller: controllerName,
                  action,
                  cartridge,
                  source: relative(process.cwd(), file),
                  urlTemplate: `${urlBase}${relativePath}`,
                  relativePath,
                  params,
                };
              } else {
                console.log(
                  `[sfcc-routes] ⏭️  Skipping route: "${routeName}" from ${cartridge} (lower priority than ${existingRoute.cartridge})`
                );
              }
            }
          } else {
            // New route
            routes[routeName] = {
              methods,
              controller: controllerName,
              action,
              cartridge,
              source: relative(process.cwd(), file),
              urlTemplate: `${urlBase}${relativePath}`,
              relativePath,
              params,
            };
          }
          
          if (params.length > 0 && !existingRoute) {
            console.log(
              `[sfcc-routes] ✓ ${routeName} [${cartridge}] - ${params.length} parameter(s): ${params.map(p => p.name).join(', ')}`
            );
          }
        }
      } catch (error) {
        console.error(
          `[sfcc-routes] ❌ Error processing ${relative(process.cwd(), file)}:`,
          (error as Error).message
        );
      }
    });

    const routeCount = Object.keys(routes).length;
    const paramsCount = Object.values(routes).reduce((sum, r) => sum + r.params.length, 0);
    
    console.log(`[sfcc-routes] Extracted ${routeCount} routes with ${paramsCount} total parameters`);

    // Generate all files
    generateTypesFile(typesPath, routes);
    generateUtilsFile(utilsPath, defaultLocale);
    generateRouteFiles(routes, resolvedOutputDir, defaultLocale);

    if (generateIndex) {
      generateIndexFile(indexPath, routes);
    }

    console.log(
      `[sfcc-routes] ✓ Generated ${routeCount} routes → ${relative(process.cwd(), resolvedOutputDir)}`
    );
  }

  // Return Vite plugin
  return {
    name: 'vite-plugin-sfcc-routes',
    
    enforce: 'pre',
    
    configResolved(config: ResolvedConfig) {
      // Plugin is ready
    },
    
    buildStart() {
      // Generate routes at build start
      generateRoutes();
    },
    
    configureServer(server: ViteDevServer) {
      // Watch for changes in dev mode
      const watchPath = dirname(resolvedPattern) + '/**';
      console.log(`[sfcc-routes] Watching: ${watchPath}`);
      
      server.watcher.add(watchPath);

      const handleChange = (file: string | undefined) => {
        if (
          file &&
          file.endsWith('.js') &&
          file.includes(dirname(resolvedPattern))
        ) {
          console.log(
            `[sfcc-routes] File changed: ${relative(process.cwd(), file)}`
          );
          generateRoutes();
        }
      };

      server.watcher.on('change', handleChange);
      server.watcher.on('add', handleChange);
      server.watcher.on('unlink', handleChange);

      // Initial generation
      generateRoutes();
    },
  };
}