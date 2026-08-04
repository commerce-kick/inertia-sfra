'use strict';

/**
 * Proxyquire-style source-eval loader for SFCC cartridge modules.
 *
 * SFCC Rhino modules use require specifiers that don't resolve under Node/Bun
 * ("dw/web/URLUtils", "star-slash/cartridge/scripts/...") and reference SFCC globals
 * (session, request, response, customer, dw, empty) that don't exist off-platform.
 * This loader reads the module source, wraps it in a Function with those globals
 * as parameters, and supplies a custom require() that:
 *   - returns an exact match from opts.mocks first (any specifier form),
 *   - resolves "* /cartridge/..." against the inertia_plugin cartridge root,
 *   - resolves "./x" / "../x" relative to the requiring file,
 *   - parses .json files,
 *   - throws a descriptive error for anything unmocked (dw/*, server, ...).
 *
 * Each loadModule() call gets a fresh module cache, so tests are hermetic.
 */

var fs = require('fs');
var path = require('path');

var REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
var CARTRIDGE_ROOT = path.join(
    REPO_ROOT,
    'dependencies/inertia_plugin/cartridges/inertia_plugin/cartridge'
);

function defaultEmpty(value) {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

/**
 * Resolve a specifier to an absolute file path, trying .js/.json suffixes.
 * @param {string} candidate - absolute path without guaranteed extension
 * @returns {string|null}
 */
function resolveFile(candidate) {
    var attempts = [candidate, candidate + '.js', candidate + '.json'];
    for (var i = 0; i < attempts.length; i++) {
        if (fs.existsSync(attempts[i]) && fs.statSync(attempts[i]).isFile()) {
            return attempts[i];
        }
    }
    return null;
}

/**
 * Load a cartridge module with injected mocks and globals.
 *
 * @param {string} modulePath - path relative to the cartridge root
 *   (e.g. "scripts/inertia/Prop.js") or absolute path
 * @param {Object} [opts]
 * @param {Object} [opts.mocks] - map of require specifier -> mock export
 * @param {Object} [opts.globals] - SFCC globals: session, request, response,
 *   customer, dw, empty
 * @param {string} [opts.cartridgeRoot] - override the cartridge root
 * @returns {*} the module's exports
 */
function loadModule(modulePath, opts) {
    opts = opts || {};
    var mocks = opts.mocks || {};
    var globals = opts.globals || {};
    var cartridgeRoot = opts.cartridgeRoot || CARTRIDGE_ROOT;
    var cache = Object.create(null);

    function resolveSpec(spec, fromDir) {
        if (spec.indexOf('*/cartridge') === 0) {
            return resolveFile(path.join(cartridgeRoot, spec.slice('*/cartridge'.length + 1)));
        }
        if (spec[0] === '.') {
            return resolveFile(path.resolve(fromDir, spec));
        }
        return null;
    }

    function load(file) {
        if (cache[file]) return cache[file].exports;

        if (path.extname(file) === '.json') {
            var parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
            cache[file] = { exports: parsed };
            return parsed;
        }

        var src = fs.readFileSync(file, 'utf8');
        var mod = { exports: {}, id: file };
        cache[file] = mod;

        var wrapper;
        try {
            /* eslint-disable-next-line no-new-func */
            wrapper = new Function(
                'require', 'module', 'exports',
                'session', 'request', 'response', 'customer', 'dw', 'empty',
                src + '\n//# sourceURL=' + file
            );
        } catch (e) {
            throw new Error('Parse error in ' + file + ': ' + e.message);
        }

        wrapper.call(
            mod.exports,
            makeRequire(path.dirname(file)),
            mod,
            mod.exports,
            globals.session,
            globals.request,
            globals.response,
            globals.customer,
            globals.dw || {},
            globals.empty || defaultEmpty
        );

        return mod.exports;
    }

    function makeRequire(fromDir) {
        return function testRequire(spec) {
            if (Object.prototype.hasOwnProperty.call(mocks, spec)) {
                return mocks[spec];
            }
            var file = resolveSpec(spec, fromDir);
            if (file) return load(file);
            throw new Error(
                'Unmocked require("' + spec + '") from ' + fromDir +
                ' — add it to opts.mocks or check the specifier.'
            );
        };
    }

    var entry = path.isAbsolute(modulePath)
        ? modulePath
        : path.join(cartridgeRoot, modulePath);
    var resolved = resolveFile(entry);
    if (!resolved) throw new Error('Module not found: ' + entry);
    return load(resolved);
}

module.exports = loadModule;
module.exports.CARTRIDGE_ROOT = CARTRIDGE_ROOT;
module.exports.REPO_ROOT = REPO_ROOT;
