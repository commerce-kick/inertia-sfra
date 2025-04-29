/*
 * Implements B2C Data "migrations"
 *
 * See README.md and MIGRATIONS.md for usage and overview
 */

// for ts type creation only
// eslint-disable-next-line no-unused-vars
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./global-config')
const {createRequire} = require('module');
const _require = createRequire(__filename);

const {
    waitForJob,
    siteArchiveImport,
    siteArchiveExport,
    siteArchiveExportJSON,
    siteArchiveImportJSON,
    siteArchiveExportText,
    siteArchiveImportText,
    ensureDataAPIPermissions,
    executeJob,
    ensureWebDAVPermissions
} = require('./jobs');
const logger = require('./logger');
const {sleep} = require('./util');
// @ts-ignore - ignore json
const {version} = require("../package.json");
const Environment = require("./environment");
const {syncCartridges, findCartridges, reloadCodeVersion} = require("./code-helpers");
const {uploadArchiveText, uploadArchive} = require("./webdav");
const {exportPagesToFolder, Library, LibraryNode} = require("./page-designer");
const {getInstanceInfo, getInstancePreferenceInfo} = require("./info");
const toolkitMetadata = require('./assets/toolkit-metadata');
const InMemoryTransport = require("./util/in-memory-transport");
const {getInstanceFeatureState, updateFeatureState} = require("./features-helpers");

const B2C_TOOLKIT_DATA_VERSION = 7;

/**
 * Find all migration directories and scripts; excluding those matching the given patterns
 *
 * @param dir {string}
 * @param exclude {string[]}
 * @return {Promise<string[]>}
 */
async function collectMigrations(dir, exclude = []) {
    return (await fs.promises.readdir(dir, {withFileTypes: true}))
        .filter((d) => {
            // valid migrations are directories (impex) or javascript files
            return (d.isDirectory() || path.extname(d.name) === '.js')
                && exclude.every((re) => !d.name.match(re));
        })
        .filter((entry) => entry.name !== 'setup.js')
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b, 'en', {numeric: false}));
}

/**
 * @typedef {object} MigrationHelpers
 * @property {typeof executeJob} executeJob
 * @property {typeof waitForJob} waitForJob
 * @property {typeof siteArchiveImport} siteArchiveImport
 * @property {typeof siteArchiveExport} siteArchiveExport
 * @property {typeof siteArchiveImportJSON} siteArchiveImportJSON
 * @property {typeof siteArchiveExportJSON} siteArchiveExportJSON
 * @property {typeof siteArchiveImportText} siteArchiveImportText
 * @property {typeof siteArchiveExportText} siteArchiveExportText
 * @property {typeof ensureDataAPIPermissions} ensureDataAPIPermissions
 * @property {typeof ensureWebDAVPermissions} ensureWebDAVPermissions
 * @property {typeof sleep} sleep
 * @property {typeof runMigrationScript} runMigrationScript
 * @property {typeof syncCartridges} syncCartridges
 * @property {typeof findCartridges} findCartridges
 * @property {typeof reloadCodeVersion} reloadCodeVersion
 * @property {typeof migrateInstance} migrateInstance
 * @property {typeof uploadArchive} uploadArchive
 * @property {typeof uploadArchiveText} uploadArchiveText
 * @property {typeof getInstanceFeatureState} getInstanceFeatureState
 * @property {typeof updateFeatureState} updateFeatureState
 * @property {typeof Library} Library
 * @property {typeof LibraryNode} LibraryNode
 * @property {typeof exportPagesToFolder} exportPagesToFolder
 * @property {typeof getInstanceInfo} getInstanceInfo
 * @property {typeof getInstancePreferenceInfo} getInstancePreferenceInfo
 * @property {string} version
 * @property {object} CONFIG
 * @property {typeof Environment} Environment
 */
/** @type {MigrationHelpers} */
const B2C_MIGRATION_HELPERS = {
    executeJob,
    waitForJob,
    siteArchiveImport,
    siteArchiveExport,
    siteArchiveImportJSON,
    siteArchiveExportJSON,
    siteArchiveImportText,
    siteArchiveExportText,
    ensureDataAPIPermissions,
    ensureWebDAVPermissions,
    sleep,
    runMigrationScript,
    syncCartridges,
    findCartridges,
    reloadCodeVersion,
    migrateInstance,

    // webdav
    uploadArchive,
    uploadArchiveText,

    // page designer
    Library,
    LibraryNode,
    exportPagesToFolder,

    // features
    getInstanceFeatureState,
    updateFeatureState,

    // info
    getInstanceInfo,
    getInstancePreferenceInfo,

    // expose core library elements
    version,
    CONFIG,
    Environment,
};


/**
 * @typedef {Object} MigrationScriptArguments
 * @property {Environment} env
 * @property {winston.Logger} logger
 * @property {MigrationHelpers} helpers
 * @property {object|undefined} vars
 */

/**
 *
 * @callback MigrationScriptCallback
 * @param {MigrationScriptArguments} args
 * @returns {Promise<boolean|void>}
 */

/**
 * @typedef {Object} ToolkitClientState
 * @property {number} version
 */

/**
 * @typedef {Object} ToolkitInstanceState
 * @property {number} version
 * @property {string[]} migrations
 * @property {Object.<string, ToolkitClientState>} clients map of client IDs that have been bootstrapped
 * @property {object} vars
 */

/**
 * @callback InitLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @returns {Promise<void>}
 */

/**
 * @callback ShouldBootstrapLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {ToolkitInstanceState} instanceState
 * @returns {Promise<boolean>}
 */

/**
 * @callback OnBootstrapLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {ToolkitInstanceState} instanceState
 * @returns {Promise<void>}
 */

/**
 * @callback BeforeAllLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {string[]} migrationsToRun list of migrations that will be run (mutable)
 * @param {boolean} willApply true if migrations will be applied to the instance
 * @param {boolean} dryRun true if dry run is requested
 * @returns {Promise<void>}
 */

/**
 * @callback BeforeEachLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {string} migration migration to be run
 * @param {boolean} willApply true if migrations will be applied to the instance
 * @returns {Promise<boolean>} return false to skip the current migration
 */

/**
 * @callback AfterEachLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {string} migration migration to be run
 * @param {boolean} willApply true if migrations will be applied to the instance
 * @returns {Promise<void>}
 */

/**
 * @callback AfterAllLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {string[]} migrationsRan list of migrations ran
 * @param {boolean} willApply true if migrations will be applied to the instance
 * @returns {Promise<void>}
 */

/**
 * @callback OnFailureLifecycleFunction
 * @param {MigrationScriptArguments} args
 * @param {string} migration migration to be run
 * @param {Error} e exception raised during migration run
 * @returns {Promise<void>} re-raise exception or new exception to stop migration run
 */

/**
 * @typedef {Object} MigrationLifecycleFunctions
 * @property {InitLifecycleFunction} [init]
 * @property {ShouldBootstrapLifecycleFunction} [shouldBootstrap]
 * @property {OnBootstrapLifecycleFunction} [onBootstrap]
 * @property {BeforeAllLifecycleFunction} [beforeAll]
 * @property {BeforeEachLifecycleFunction} [beforeEach]
 * @property {AfterEachLifecycleFunction} [afterEach]
 * @property {AfterAllLifecycleFunction} [afterAll]
 * @property {OnFailureLifecycleFunction} [onFailure]
 */

/**
 * Get the instance state from global preferences
 *
 * @param env {Environment}
 * @return {Promise<ToolkitInstanceState>}
 */
async function getInstanceState(env) {
    try {
        var resp = await env.ocapi.get(`global_preferences/preference_groups/b2cToolkit/development`);
        /** @type {Object.<string, ToolkitInstanceState>} */
        var bootstrappedClientIDs = {};
        try {
            bootstrappedClientIDs = JSON.parse(resp.data.c_b2cToolsBootstrappedClientIDs)
        } catch (e) { /* ignore; will recreate as json */
        }

        var vars = {};
        try {
            vars = JSON.parse(resp.data.c_b2cToolsVars)
        } catch (e) { /* ignore; will recreate as json */
        }

        return {
            version: resp.data.c_b2cToolkitDataVersion,
            migrations: resp.data.c_b2cToolkitMigrations ? resp.data.c_b2cToolkitMigrations.split(',') : [],
            clients: bootstrappedClientIDs,
            vars
        };
    } catch (e) {
        if (e.response && e.response.status === 403) {
            logger.warn('No access to global_preferences; will attempt to update during bootstrap');
            return null; // will attempt to upgrade OCAPI through the import
        } else if (e.response && e.response.status === 404) {
            logger.debug('No global_preferences found; update required');
            return null;
        } else {
            throw e;
        }
    }
}

/**
 * Imports the latest toolkit metadata
 *
 * @param {Environment} env
 * @param {MigrationLifecycleFunctions} lifeCycleModule
 * @return {Promise<void>}
 */
async function updateInstanceMetadata(env, lifeCycleModule, vars) {
    var metaData = toolkitMetadata;

    var prefs = `<?xml version="1.0" encoding="UTF-8"?>
<preferences xmlns="http://www.demandware.com/xml/impex/preferences/2007-03-31">
    <custom-preferences>
        <development><preference preference-id="b2cToolkitDataVersion">0</preference></development>
    </custom-preferences>
</preferences>
`;

    try {
        await siteArchiveImportText(env, new Map([
            ['preferences.xml', prefs],
            ['meta/system-objecttype-extensions.xml', metaData],
        ]));
    } catch (e) {
        if (e.response && e.response.status === 403) {
            throw new Error(`Got status 403: At minimum your client ID (${env.clientID}) needs OCAPI DATAAPI access for jobs and webdav write access to /impex; see README.md`);
        } else {
            throw e;
        }
    }

    await ensureDataAPIPermissions(env, [
        {
            'resource_id': '/global_preferences/preference_groups/b2cToolkit/development',
            'methods': [
                'get',
                'patch'
            ],
            'read_attributes': '(**)',
            'write_attributes': '(**)'
        },
        // same as sfcc-ci; we don't both ensuring this as bootstrap wouldn't work if we didn't already have it
        // {resource_id: "/jobs/*/executions", methods: ["post"], read_attributes: "(**)", write_attributes: "(**)"},
        // {resource_id: "/jobs/*/executions/*", methods: ["get"], read_attributes: "(**)", write_attributes: "(**)"},
        {
            'methods': [
                'post'
            ],
            'resource_id': '/job_execution_search',
            'write_attributes': '(**)',
            'read_attributes': '(**)'
        }
    ], async () => {
        await env.ocapi.get('global_preferences/preference_groups/b2cToolkit/development');
        await env.ocapi.post('job_execution_search', {
            "query": {
                "term_query": {
                    "fields": ["status"],
                    "operator": "is",
                    "values": ["RUNNING"]
                }
            },
            "sorts": [{"field": "start_time", "sort_order": "asc"}]
        });
        return true;
    })

    // add client IDs to metadata
    var instanceState = await getInstanceState(env);
    instanceState.clients[env.clientID] = Object.assign({}, instanceState.clients[env.clientID], {
        version: B2C_TOOLKIT_DATA_VERSION
    })

    if (typeof lifeCycleModule.onBootstrap === 'function') {
        logger.info('Calling project onBootstrap...');
        await lifeCycleModule.onBootstrap({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars
        }, instanceState);
    }

    logger.debug(`Recording ${env.clientID} in metadata`);
    await env.ocapi.patch(`global_preferences/preference_groups/b2cToolkit/development`, {
        c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
        c_b2cToolsBootstrappedClientIDs: JSON.stringify(instanceState.clients, null, 2),
        c_b2cToolsVars: JSON.stringify(instanceState.vars, null, 2)
    });
}

/**
 * Updates instance with new migrations set
 * @param env {Environment}
 * @param migrations {string[]}
 * @return {Promise<void>}
 */
async function updateInstanceMigrations(env, migrations) {
    try {
        await env.ocapi.patch(`global_preferences/preference_groups/b2cToolkit/development`, {
            c_b2cToolkitMigrations: migrations.join(',')
        });
    } catch (e) {
        if (e.response.status === 403) {
            throw new Error('Permissions error; Ensure you have global_preferences configured for your client ID (run with --force-bootstrap to force a bootstrap upgrade)');
        } else if (e.response.status === 404) {
            throw new Error('Unable to set migrations');
        } else {
            throw e;
        }
    }
}

/**
 * Determines if bootstrap/upgrade is required
 * @param {Environment} env
 * @param {ToolkitInstanceState} instanceState
 * @returns {boolean}
 */
function isBootstrapRequired(env, instanceState) {
    return !instanceState
        || !instanceState.version
        || instanceState.version < B2C_TOOLKIT_DATA_VERSION
        || !instanceState.clients
        || !(env.clientID in instanceState.clients)
        || (instanceState.clients
            && instanceState.clients[env.clientID]
            && instanceState.clients[env.clientID].version < B2C_TOOLKIT_DATA_VERSION)
}

/**
 * @typedef {Object} MigrateInstanceOptions
 * @property {string[]} [exclude] array of regular expression strings
 * @property {boolean} [apply] should migrations be applied to the instance after running?
 * @property {boolean} [dryRun] only output migrations to be run
 * @property {boolean} [forceBootstrap]
 * @property {boolean} [allowBootstrap]
 * @property {object} [vars]
 * @property {boolean} [showNotes]
 */
/**
 * Inspects an instance and executes site impex imports and "migration scripts" from the
 * given `dir`.
 *
 * @param {Environment} env
 * @param {string} dir migrations directory
 * @param {MigrateInstanceOptions} options options
 * @return {Promise<void>}
 */
async function migrateInstance(env, dir, {
    exclude = [],
    apply = true,
    dryRun = false,
    forceBootstrap = false,
    allowBootstrap = true,
    vars = {},
    showNotes = true
} = {}) {
    const migrationScriptArguments = {
        env,
        logger,
        helpers: B2C_MIGRATION_HELPERS,
        vars
    };

    // setup logger to capture persisted logs; these will be used for instance log storage
    logger.debug('Setting up in memory logger...');
    const persistedLogTransport = new InMemoryTransport({
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.splat(),
            winston.format.printf(({timestamp, level, message}) => `${timestamp} ${level}: ${message}`)
        )
    });
    logger.add(persistedLogTransport);

    // set migrations dir global config
    CONFIG.MIGRATIONS_DIR = path.resolve(dir);

    /** @type {MigrationLifecycleFunctions} */
    var lifeCycleModule = {};
    if (fs.existsSync(path.join(dir, 'setup.js'))) {
        lifeCycleModule = _require(path.resolve(dir, 'setup.js'));
    }

    if (typeof lifeCycleModule.init === 'function') {
        logger.debug('Calling lifecycle function init')

        await lifeCycleModule.init(migrationScriptArguments);
    }

    var projectMigrations = await collectMigrations(dir, exclude);
    logger.debug(`Project Migrations ${projectMigrations.join(',')}`);
    logger.info('Getting instance migration state...');
    var instanceState = await getInstanceState(env);

    var bootstrapRequired = isBootstrapRequired(env, instanceState);

    if (typeof lifeCycleModule.shouldBootstrap === 'function' && !bootstrapRequired) {
        try {
            logger.debug('Calling lifecycle function shouldBootstrap');
            let result = await lifeCycleModule.shouldBootstrap(migrationScriptArguments, instanceState);
            if (result === true) {
                logger.debug('Bootstrapping as result of shouldBootstrap lifecycle method was true')
                bootstrapRequired = true;
            }
        } catch (e) {
            logger.debug(`Lifecycle function shouldBootstrap threw exception (will bootstrap): ${e}`);
            bootstrapRequired = true;
        }
    }

    if (bootstrapRequired && !allowBootstrap) {
        throw new Error('instance bootstrap or upgrade required but allow-boostrap set to false');
    } else if (forceBootstrap || bootstrapRequired) {
        logger.warn('Toolkit metadata bootstrap/upgrade required...');
        await updateInstanceMetadata(env, lifeCycleModule, vars);
        instanceState = await getInstanceState(env);
    } else if (instanceState && instanceState.version > B2C_TOOLKIT_DATA_VERSION) {
        throw new Error('Instance is using a b2c-tools version greater than currently installed; upgrade required');
    }

    logger.debug(JSON.stringify(instanceState, null, 2));

    var instanceMigrations = instanceState.migrations.slice();
    var migrationsToApply = projectMigrations.filter((m) => !instanceMigrations.includes(m));

    if (typeof lifeCycleModule.beforeAll === 'function') {
        logger.debug('Calling lifecycle function beforeAll');
        await lifeCycleModule.beforeAll(migrationScriptArguments, migrationsToApply, apply, dryRun);
    }

    var migrationsRan = [];
    if (migrationsToApply.length === 0) {
        logger.info(`No migrations required. Instance is up to date (last: ${instanceMigrations ? instanceMigrations.pop() : 'none'})`);
    } else {
        logger.info(`${migrationsToApply.length} Migrations Required:\n      ${migrationsToApply.join('\n      ')}`);

        if (dryRun) {
            logger.warn('Dry run requested. Will not run migrations.');
        } else {
            logger.info(`Running migrations on ${env.server}...`);
        }
        for (const migration of migrationsToApply) {
            let now = (new Date()).getTime();

            var target = path.join(dir, migration);
            var fileStat = await fs.promises.stat(target);

            // output notes
            if (fileStat.isDirectory()) {
                const noteFile = path.join(target, 'notes.txt');
                if (fs.existsSync(noteFile) && showNotes) {
                    logger.info(`[${migration}] Notes:\n` +
                        fs.readFileSync(noteFile).toString() + '\n');
                }
            } else {
                let migrationScript = _require(path.resolve(target));
                if (typeof migrationScript?.notes === "string" && showNotes) {
                    logger.info(`[${migration}] Notes:\n` + migrationScript.notes + '\n');
                }
            }

            if (dryRun) {
                continue
            }

            var runMigration = true;
            if (typeof lifeCycleModule.beforeEach === 'function') {
                logger.debug('Calling lifecycle function beforeEach');
                runMigration = await lifeCycleModule.beforeEach(migrationScriptArguments, migration, apply);
            }

            if (runMigration !== false) {
                try {
                    if (fileStat.isDirectory()) {
                        await siteArchiveImport(env, path.join(dir, migration));
                    } else {
                        var migrationScript = _require(path.resolve(target));
                        if (typeof migrationScript !== 'function') {
                            throw new Error(`${target} is not a valid migration; should export a function`);
                        }
                        await migrationScript.call(null, migrationScriptArguments);
                    }
                } catch (e) {
                    logger.error(`[${migration}] Unable to execute migration`);
                    if (typeof lifeCycleModule.onFailure === 'function') {
                        logger.warn('Calling lifecycle function onFailure');
                        await lifeCycleModule.onFailure(migrationScriptArguments, migration, e);
                        logger.warn(`[${migration}] onFailure handled exception, ignoring error...`);
                    } else {
                        throw e;
                    }
                }
            } else {
                logger.warn(`[${migration}] skipping execution due to lifecycle function...`);
            }

            instanceMigrations.push(migration);

            if (apply) {
                logger.debug(`Applying new migrations: ${instanceMigrations}`);
                await updateInstanceMigrations(env, instanceMigrations);
            }

            if (typeof lifeCycleModule.afterEach === 'function') {
                logger.debug('Calling lifecycle function afterEach');
                await lifeCycleModule.afterEach(migrationScriptArguments, migration, apply);
            }

            let timeToRun = (new Date()).getTime() - now;
            migrationsRan.push(migration);
            logger.info(`[${migration}] Migrated in (${timeToRun / 1000}s)`);
        }
    }

    if (!dryRun && typeof lifeCycleModule.afterAll === 'function') {
        logger.debug('Calling lifecycle function afterAll');
        await lifeCycleModule.afterAll(migrationScriptArguments, migrationsRan, apply);
    }

    // write logs; TODO: this should be done during the run
    try {
        const timestamp = (new Date()).toISOString().replace(/:/g, '');
        await env.webdav.put(`/IMPEX/log/b2c-tools/migration-${timestamp}.log`, persistedLogTransport.logs.join('\n'));
    } catch (e) {
        // ignoring until this is released
    }
}

/**
 *
 * @param {Environment} env
 * @param {string} target path to migration script
 * @param {object} options
 * @param {object} options.vars
 * @return {Promise<void>}
 */
async function runMigrationScript(env, target, {vars = {}}) {
    const migrationScript = _require(path.resolve(target));

    const migrationScriptArguments = {
        env,
        logger,
        helpers: B2C_MIGRATION_HELPERS,
        vars
    };

    var lifeCycleModule = {};
    if (fs.existsSync(path.resolve(path.dirname(target), 'setup.js'))) {
        lifeCycleModule = _require(path.resolve(path.dirname(target), 'setup.js'));
    }

    if (typeof lifeCycleModule.init === 'function') {
        logger.debug('Calling lifecycle function init');

        await lifeCycleModule.init(migrationScriptArguments);
    }

    if (typeof migrationScript !== 'function') {
        throw new Error(`${target} is not a valid migration; should export a function`);
    }
    await migrationScript.call(null, migrationScriptArguments);
}

/**
 * Execute a migration script provided as a string (i.e. from a heredoc)
 *
 * @param {Environment} env
 * @param {string} scriptText
 * @param {object} options
 * @param {object} options.vars
 * @return {Promise<void>}
 */
async function runMigrationScriptText(env, scriptText, {vars = {}}) {
    const migrationScriptArguments = {
        env,
        logger,
        helpers: B2C_MIGRATION_HELPERS,
        vars
    };

    var lifeCycleModule = {};
    if (fs.existsSync(path.resolve(process.cwd(), 'setup.js'))) {
        lifeCycleModule = _require(path.resolve(process.cwd(), 'setup.js'));
    }

    if (typeof lifeCycleModule.init === 'function') {
        logger.debug('Calling lifecycle function init');

        await lifeCycleModule.init(migrationScriptArguments);
    }
    const AsyncFunction = Object.getPrototypeOf(async function () {
    }).constructor;
    var func = new AsyncFunction(
        'args', 'env', 'logger', 'helpers', 'vars',
        'require',
        '__filename',
        '__dirname', scriptText);

    await func.call(null, migrationScriptArguments, env,
        logger, B2C_MIGRATION_HELPERS,
        vars, require, __filename, __dirname);
}

module.exports = {
    B2C_TOOLKIT_DATA_VERSION,
    B2C_MIGRATION_HELPERS,
    migrateInstance,
    runMigrationScript,
    runMigrationScriptText
};
