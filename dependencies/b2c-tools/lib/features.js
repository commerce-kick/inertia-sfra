const logger = require("./logger");
const fs = require("fs");
const path = require("path");
const {siteArchiveImportText, ensureDataAPIPermissions} = require("./jobs");
const {migrateInstance, B2C_MIGRATION_HELPERS} = require("./migrations");
const inquirer = require("inquirer");
const {syncCartridges, findCartridges} = require("./code");
// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');
const featuresMetadata = require('./assets/features-metadata')
const { createRequire } = require('module');
const {getInstanceFeatureState, updateFeatureState} = require("./features-helpers");

/**
 * These are question objects from the inquirer module. We're only interested in the name
 *
 * @typedef {Object} Question
 * @property {string} name
 */

/**
 * @typedef {Object} Feature
 * @property {string} featureName
 * @property {string[]} requires
 * @property {object} defaultVars
 * @property {string[]} secretVars
 * @property {function?} beforeDeploy
 * @property {function|Question[]} questions
 * @property {string[]} excludeMigrations
 * @property {string[]} excludeCartridges
 * @property {function?} remove
 * @property {function?} finish
 * @property {string} path
 */


const B2C_TOOLS_FEATURES_VERSION = 3;

/**
 *
 * @param dir
 * @returns {Promise<Feature[]>}
 */
async function collectFeatures(dir) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Features dir (${dir}) does not exist`);
    }

    logger.debug('Searching for features...')
    const require = createRequire(__filename);
    return (await fs.promises.readdir(dir, {withFileTypes: true}))
        .filter((d) => d.isDirectory() && fs.existsSync(path.resolve(dir, d.name, 'feature.js')))
        .map((d) => {
            return {
                path: path.resolve(dir, d.name),
                ...require(path.resolve(dir, d.name, 'feature.js'))
            }
        });
}

/**
 * Boostrap feature functionality (access and custom object)
 * or update to latest
 *
 * @param {Environment} env
 * @returns {Promise<void>}
 */
async function boostrapFeatures(env) {
    var metaData = featuresMetadata;

    var prefs = `<?xml version="1.0" encoding="UTF-8"?>
<preferences xmlns="http://www.demandware.com/xml/impex/preferences/2007-03-31">
    <custom-preferences>
        <development><preference preference-id="b2cToolsFeaturesVersion">0</preference></development>
    </custom-preferences>
</preferences>
`;

    logger.info(`Bootstrapping features for ${env.clientID}...`);

    try {
        await siteArchiveImportText(env, new Map([
            ['preferences.xml', prefs],
            ['meta/features.xml', metaData],
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
            'methods': [
                'get',
                'patch'
            ],
            'read_attributes': '(**)',
            'resource_id': '/global_preferences/preference_groups/b2cToolkit/development',
            'write_attributes': '(**)'
        },
        {
            "methods": [
                "get"
            ],
            "read_attributes": "(**)",
            "resource_id": "/code_versions",
            "write_attributes": "(**)"
        },
        {
            "methods": [
                "patch",
                "delete"
            ],
            "read_attributes": "(**)",
            "resource_id": "/code_versions/*",
            "write_attributes": "(**)"
        },
        {
            'methods': [
                'post'
            ],
            'read_attributes': '(**)',
            'resource_id': '/custom_objects_search/*',
            'write_attributes': '(**)'
        },
        {
            'methods': [
                'get',
                'put',
                'delete',
                'patch'
            ],
            'read_attributes': '(**)',
            'resource_id': '/custom_objects/**',
            'write_attributes': '(**)'
        }
    ], async () => {
        await env.ocapi.post('custom_objects_search/B2CToolsFeature', {
            query: {
                match_all_query: {}
            },
            "select": "(**)"
        })
        return true;
    })

    // add client IDs to metadata
    var instanceState = await getInstanceFeatureState(env);
    instanceState.b2cToolsFeaturesBootstrappedClientIDs[env.clientID] = {
        version: B2C_TOOLS_FEATURES_VERSION
    }
    logger.debug(`Recording ${env.clientID} in metadata`);
    await env.ocapi.patch(`global_preferences/preference_groups/b2cToolkit/development`, {
        c_b2cToolsFeaturesVersion: B2C_TOOLS_FEATURES_VERSION,
        c_b2cToolsFeaturesBootstrappedClientIDs: JSON.stringify(instanceState.b2cToolsFeaturesBootstrappedClientIDs, null, 2)
    });
}

/**
 * Determines if bootstrap/upgrade is required
 * @param {Environment} env
 * @param {import("./features-helpers").InstanceFeatureState} instanceState
 * @returns {boolean}
 */
function isBootstrapRequired(env, instanceState) {
    return !instanceState
        || !instanceState.b2cToolsFeaturesVersion
        || instanceState.b2cToolsFeaturesVersion < B2C_TOOLS_FEATURES_VERSION
        || !instanceState.b2cToolsFeaturesBootstrappedClientIDs
        || !(env.clientID in instanceState.b2cToolsFeaturesBootstrappedClientIDs)
        || (instanceState.b2cToolsFeaturesBootstrappedClientIDs
            && instanceState.b2cToolsFeaturesBootstrappedClientIDs[env.clientID]
            && instanceState.b2cToolsFeaturesBootstrappedClientIDs[env.clientID].version < B2C_TOOLS_FEATURES_VERSION)
}

/**
 * @namespace FeatureHelpers
 */
const FEATURE_HELPERS = {
    deployFeature,
    removeFeature,
    updateFeatureState,
    collectFeatures
}

/**
 * @typedef {object} FeatureScriptArguments
 * @property {typeof FEATURE_HELPERS} featureHelpers
 * @property {string} featuresDir directory of current features
 * @property {boolean} saveSecrets persist secrets to instance
 * @property {import("./features-helpers").InstanceFeatureState} instanceState
 */

/**
 * @typedef {object} DeployFeatureOptions
 * @property {string} featuresDir directory of current features
 * @property {object} vars
 * @property {boolean} saveSecrets persist secrets to instance
 *
 */
/**
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {Partial<DeployFeatureOptions>} options
 * @returns {Promise<void>}
 */
async function deployFeature(env, featureName, {featuresDir, vars = {}, saveSecrets = true} = {}) {
    var projectFeatures = await collectFeatures(featuresDir);

    var feature = projectFeatures.find(f => f.featureName === featureName);

    if (!feature) {
        throw new Error(`Cannot find feature ${featureName} in project`)
    }

    if (typeof feature.beforeDeploy === 'function') {
        await feature.beforeDeploy({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars
        })
    }

    var instanceState = await getInstanceFeatureState(env);

    if (isBootstrapRequired(env, instanceState)) {
        logger.warn('Feature metadata bootstrap/upgrade required...');
        await boostrapFeatures(env);
        instanceState = await getInstanceFeatureState(env);
    }

    var instanceFeatureState = instanceState.features.find(f => f.featureName === featureName);

    if (!instanceFeatureState) {
        logger.info(`Installing ${featureName}...`)
    } else {
        logger.info(`Updating ${featureName}...`)
    }

    // 1. get vars

    // merge incoming environment vars with feature defaults and custom object state (if available)
    var featureVars = Object.assign({}, feature.defaultVars, instanceFeatureState ? instanceFeatureState.vars : {}, vars);

    var questions;
    if (typeof feature.questions === "function") {
        questions = await feature.questions({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars: featureVars
        }, {
            featureHelpers: FEATURE_HELPERS,
            featuresDir,
            saveSecrets,
            instanceState
        })

        // instance state may have been modified by an advanced feature init
        instanceState = await getInstanceFeatureState(env);
    } else {
        questions = feature.questions;
    }

    if (questions && questions.length > 0) {
        // ask questions; will prompt if any questions do not have answers in featureVars
        var answers = await inquirer.prompt(questions, featureVars);
        featureVars = Object.assign({}, featureVars, answers);
    }

    // 2. apply migrations
    var featureMigrationDir = path.resolve(feature.path, 'migrations');
    if (fs.existsSync(featureMigrationDir)) {
        logger.info('Applying feature migrations...')
        await migrateInstance(env, featureMigrationDir, {
            exclude: feature.excludeMigrations ? feature.excludeMigrations : [],
            vars: featureVars
        })
    }

    // 3. deploy feature cartridges
    var cartridges = findCartridges(feature.path);
    if (cartridges.length) {
        if (!env.codeVersion) {
            try {
                // set env code version to current on instance
                let resp = await env.ocapi.get('code_versions');
                env.codeVersion = resp.data.data.find(c => c.active).id;
            } catch (e) {
                throw new Error(`Unable to determine code version: ${e.message}`);
            }
        }
        let exclude = feature.excludeCartridges ? feature.excludeCartridges : [];
        logger.info('Syncing feature cartridges...');
        cartridges = cartridges.map(c => ({
            name: c.dest,
            dest: c.dest,
            src: path.resolve(feature.path, c.src)
        })).filter(c => !exclude.includes(c.dest))
        logger.debug(`Cartridges: ${cartridges.map(c => c.dest).join(',')}`)
        await syncCartridges(env, cartridges, false, {cleanCartridges: true});
    }

    // 4. finalize feature w/ lifecycle call
    if (typeof feature.finish === "function") {
        await feature.finish({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars: featureVars
        }, {
            featureHelpers: FEATURE_HELPERS,
            featuresDir,
            saveSecrets,
            instanceState
        })
    }

    // 5. write feature data (masking secrets)
    logger.info('Updating feature state on instance...')
    await updateFeatureState(env, featureName, featureVars, feature.secretVars, saveSecrets);

    logger.info(`Feature "${featureName}" deployed to ${env.server}`);
}

/**
 * Remove a feature
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {object} options
 * @param {string} options.featuresDir
 * @param {object} [options.vars]
 * @returns {Promise<void>}
 */
async function removeFeature(env, featureName, {featuresDir, vars = {}}) {
    var features = await collectFeatures(featuresDir);
    var instanceState = await getInstanceFeatureState(env);

    if (instanceState === null) {
        logger.warn('No features installed on this instance; skipping feature updates...')
        return;
    }

    var feature = features.find(f => f.featureName === featureName);

    if (!feature) {
        throw new Error(`Cannot find feature "${featureName}"`)
    }

    var featureState = instanceState.features.find(f => f.featureName === featureName);

    if (!featureState) {
        throw new Error(`"${featureName}" not deployed to instance ${env.server}`)
    }

    if (typeof feature.remove === "function") {
        logger.info('Calling feature removal method...');

        // merge incoming environment vars with feature defaults and custom object state (if available)
        var featureVars = Object.assign({}, feature.defaultVars, featureState.vars, vars);

        await feature.remove({env, logger, helpers: B2C_MIGRATION_HELPERS, vars: featureVars}, {
            featureHelpers: FEATURE_HELPERS,
            featuresDir,
            saveSecrets: true, // this value shouldn't come into play for removals
            instanceState
        })
    }

    logger.info('Deleting Feature...')
    await env.ocapi.delete(`custom_objects/B2CToolsFeature/${featureName}`)
}

module.exports = {
    getInstanceFeatureState,
    boostrapFeatures,
    collectFeatures,
    deployFeature,
    removeFeature,
    updateFeatureState,
    B2C_TOOLS_FEATURES_VERSION
}
