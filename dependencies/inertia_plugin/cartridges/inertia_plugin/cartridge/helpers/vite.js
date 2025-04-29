"use strict";

/**
 * Generates Vite tags for SFCC SFRA using plain JavaScript.
 * @param {Array} entrypoints The entrypoints to generate tags for.
 * @param {string} buildDirectory The build directory (relative to IMPEX).
 * @returns {string} The HTML string containing the tags.
 */
const File = require("dw/io/File");

function generateViteTagsSFRA(entrypoints, buildDirectory) {
  buildDirectory =
    buildDirectory || "/on/demandware.static/Sites-RefArch-Site/-/en_US";

  const isRunningHot = () => {
    try {
      require("*/cartridge/scripts/hot.json");
      return true;
    } catch (error) {
      return false;
    }
  };

  const hotAsset = (entrypoint) => {
    const hot = require("*/cartridge/scripts/hot.json");
    return `${hot.hmr}/${entrypoint}`;
  };

  // Enhanced to include crossorigin attribute
  const makeTagForChunk = (assetPath, chunk, manifest) => {
    if (assetPath.endsWith(".js") || assetPath.endsWith(".tsx")) {
      const scriptAttrs = resolveScriptTagAttributes(assetPath, chunk, manifest);
      return `<script type="module" src="${assetPath}"${scriptAttrs.crossorigin ? ' crossorigin="' + scriptAttrs.crossorigin + '"' : ''}${scriptAttrs.integrity ? ' integrity="' + scriptAttrs.integrity + '"' : ''}></script>`;
    } else if (assetPath.endsWith(".css")) {
      const styleAttrs = resolveStylesheetTagAttributes(assetPath, chunk, manifest);
      return `<link rel="stylesheet" href="${assetPath}"${styleAttrs.crossorigin ? ' crossorigin="' + styleAttrs.crossorigin + '"' : ''}${styleAttrs.integrity ? ' integrity="' + styleAttrs.integrity + '"' : ''}>`;
    }
    return "";
  };

  // New function to resolve script tag attributes, similar to PHP version
  const resolveScriptTagAttributes = (url, chunk, manifest) => {
    return {
      crossorigin: 'anonymous', // Default to anonymous for modules
      integrity: chunk && chunk.integrity || false
    };
  };

  // New function to resolve stylesheet tag attributes, similar to PHP version
  const resolveStylesheetTagAttributes = (url, chunk, manifest) => {
    return {
      crossorigin: 'anonymous', // CSS often needs anonymous too
      integrity: chunk && chunk.integrity || false
    };
  };

  // Preload tag attributes resolver
  const resolvePreloadTagAttributes = (url, chunk, manifest) => {
    const isCss = isCssPath(url);
    const scriptAttrs = isCss 
      ? resolveStylesheetTagAttributes(url, chunk, manifest)
      : resolveScriptTagAttributes(url, chunk, manifest);
    
    return {
      rel: isCss ? 'preload' : 'modulepreload',
      as: isCss ? 'style' : 'script',
      crossorigin: scriptAttrs.crossorigin || false,
      integrity: chunk && chunk.integrity || false
    };
  };

  const getManifest = () => {
    try {
      return require("*/cartridge/static/default/manifest.json") || {};
    } catch (error) {
      dw.system.Logger.error("Error loading manifest.json: " + error.message);
      return {};
    }
  };

  const getChunk = (manifest, entrypoint) => manifest[entrypoint] || {};

  const getAssetPath = (path) => path;

  const isCssPath = (path) => path.endsWith(".css");

  // Enhanced to include crossorigin attribute for preloads
  const makePreloadTagForChunk = (assetPath, chunk, manifest) => {
    const attrs = resolvePreloadTagAttributes(assetPath, chunk, manifest);
    
    if (!attrs.rel) return "";
    
    let tag = `<link rel="${attrs.rel}" href="${assetPath}"`;
    
    if (attrs.as) tag += ` as="${attrs.as}"`;
    if (attrs.crossorigin) tag += ` crossorigin="${attrs.crossorigin}"`;
    if (attrs.integrity) tag += ` integrity="${attrs.integrity}"`;
    
    tag += ">";
    return tag;
  };

  if (isRunningHot()) {
    const hot = require("*/cartridge/scripts/hot.json");

    const refreshScript = `<script type="module">
      import RefreshRuntime from '${hot.hmr}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`;

    const hotTags = entrypoints
      .map(function (entrypoint) {
        return makeTagForChunk(hotAsset(entrypoint));
      })
      .join("");

    return refreshScript + hotTags;
  }

  const manifestData = getManifest();
  const tags = [];
  const preloads = [];
  const processedCss = new Set(); // Track processed CSS files
  const processedAssets = new Set(); // Track all processed assets

  entrypoints.forEach(function (entrypoint) {
    const chunkData = getChunk(manifestData, entrypoint);
    if (!chunkData.file) return; // Skip if no file found in manifest
    
    const chunkFilePath = getAssetPath(`${buildDirectory}/${chunkData.file}`);
    
    // Add to preloads with chunk data
    if (!processedAssets.has(chunkFilePath)) {
      preloads.push({ path: chunkFilePath, chunk: chunkData, src: entrypoint });
      processedAssets.add(chunkFilePath);
    }
    
    // Add the main tag
    tags.push(makeTagForChunk(chunkFilePath, chunkData, manifestData));

    // Process imports
    (chunkData.imports || []).forEach(function (importItem) {
      const importChunkData = manifestData[importItem];
      if (!importChunkData || !importChunkData.file) return;

      const importFilePath = getAssetPath(
        `${buildDirectory}/${importChunkData.file}`
      );

      if (!processedAssets.has(importFilePath)) {
        preloads.push({ path: importFilePath, chunk: importChunkData, src: importItem });
        processedAssets.add(importFilePath);
      }

      // Process CSS from imports
      (importChunkData.css || []).forEach(function (css) {
        const cssFilePath = getAssetPath(`${buildDirectory}/${css}`);
        
        if (!processedCss.has(cssFilePath)) {
          // Find the CSS chunk data if available
          const cssChunkEntry = Object.entries(manifestData).find(
            ([_, chunk]) => chunk.file === css
          );
          const cssChunkData = cssChunkEntry ? manifestData[cssChunkEntry[0]] : { file: css };
          
          preloads.push({ path: cssFilePath, chunk: cssChunkData, src: cssChunkEntry ? cssChunkEntry[0] : null });
          tags.push(makeTagForChunk(cssFilePath, cssChunkData, manifestData));
          processedCss.add(cssFilePath);
          processedAssets.add(cssFilePath);
        }
      });
    });

    // Process CSS directly from the chunk
    (chunkData.css || []).forEach(function (css) {
      const cssFilePath = getAssetPath(`${buildDirectory}/${css}`);
      
      if (!processedCss.has(cssFilePath)) {
        // Find the CSS chunk data if available
        const cssChunkEntry = Object.entries(manifestData).find(
          ([_, chunk]) => chunk.file === css
        );
        const cssChunkData = cssChunkEntry ? manifestData[cssChunkEntry[0]] : { file: css };
        
        preloads.push({ path: cssFilePath, chunk: cssChunkData, src: cssChunkEntry ? cssChunkEntry[0] : null });
        tags.push(makeTagForChunk(cssFilePath, cssChunkData, manifestData));
        processedCss.add(cssFilePath);
        processedAssets.add(cssFilePath);
      }
    });
  });

  // Sort the preloads with CSS first (just like in PHP version)
  preloads.sort(function (a, b) {
    return isCssPath(b.path) ? 1 : -1;
  });

  // Generate preload tags with their chunk data
  const preloadTags = preloads
    .map(item => makePreloadTagForChunk(item.path, item.chunk, manifestData))
    .filter(Boolean)
    .join("");

  // Split tags into CSS and JS for proper ordering
  const styleTags = [];
  const scriptTags = [];
  
  tags.forEach(tag => {
    if (tag.startsWith('<link')) {
      styleTags.push(tag);
    } else if (tag.startsWith('<script')) {
      scriptTags.push(tag);
    }
  });

  // Return preloads + stylesheets + scripts (same order as PHP)
  return preloadTags + styleTags.join("") + scriptTags.join("");
}

module.exports = generateViteTagsSFRA;