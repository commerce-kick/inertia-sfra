/*
 * b2c-tools
 * @module @SalesforceCommerceCloud/b2c-tools
 */

// eslint-disable-next-line no-unused-vars
const {AxiosError} = require('axios');
const {cli, runAsScript, parseConfig} = require('./config');
// @ts-ignore
const version = require('../package.json').version;
const Environment = require('./environment');
const logger = require('./logger');
const {migrateInstance, runMigrationScript, B2C_MIGRATION_HELPERS, runMigrationScriptText} = require('./migrations')

const exportCommand = require('./command-export');
const importCommand = require('./command-import');
const instanceCommand = require('./command-instance');
const codeCommand = require('./command-code');
const tailCommand = require('./command-tail');
const featureCommand = require('./command-feature');

const {
    executeJob,
    waitForJob,
    siteArchiveImport,
    siteArchiveExport,
    siteArchiveExportJSON,
    siteArchiveExportText,
    siteArchiveImportText,
    siteArchiveImportJSON,
    ensureDataAPIPermissions
} = require('./jobs');
const {sleep} = require("./util");
const {syncCartridges, findCartridges} = require("./code");
const CONFIG = require("./global-config");
const {getInstanceInfo, getInstancePreferenceInfo} = require("./info");
const {getInstanceFeatureState, collectFeatures, deployFeature, removeFeature, updateFeatureState} = require("./features");

module.exports = {
    version,
    cli, CONFIG, logger,
    Environment,
    migrateInstance, runMigrationScript, runMigrationScriptText, B2C_MIGRATION_HELPERS,
    syncCartridges, findCartridges,

    // jobs
    executeJob,
    waitForJob,
    sleep,
    siteArchiveImport,
    siteArchiveExport,
    siteArchiveExportJSON,
    siteArchiveImportJSON,
    siteArchiveExportText,
    siteArchiveImportText,
    ensureDataAPIPermissions,

    runAsScript, parseConfig,

    // info
    getInstanceInfo,
    getInstancePreferenceInfo,

    // features
    getInstanceFeatureState,
    collectFeatures,
    deployFeature,
    removeFeature,
    updateFeatureState,

    commands: [exportCommand, importCommand, instanceCommand, codeCommand, tailCommand, featureCommand]
};
