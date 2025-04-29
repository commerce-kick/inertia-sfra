export type MigrationScriptArguments = {
    env: Environment;
    logger: winston.Logger;
    helpers: MigrationHelpers;
    vars: object | undefined;
};
export type MigrationScriptCallback = (args: MigrationScriptArguments) => Promise<boolean | void>;
export type ToolkitClientState = {
    version: number;
};
export type ToolkitInstanceState = {
    version: number;
    migrations: string[];
    /**
     * map of client IDs that have been bootstrapped
     */
    clients: {
        [x: string]: ToolkitClientState;
    };
    vars: object;
};
export type InitLifecycleFunction = (args: MigrationScriptArguments) => Promise<void>;
export type ShouldBootstrapLifecycleFunction = (args: MigrationScriptArguments, instanceState: ToolkitInstanceState) => Promise<boolean>;
export type OnBootstrapLifecycleFunction = (args: MigrationScriptArguments, instanceState: ToolkitInstanceState) => Promise<void>;
export type BeforeAllLifecycleFunction = (args: MigrationScriptArguments, migrationsToRun: string[], willApply: boolean, dryRun: boolean) => Promise<void>;
export type BeforeEachLifecycleFunction = (args: MigrationScriptArguments, migration: string, willApply: boolean) => Promise<boolean>;
export type AfterEachLifecycleFunction = (args: MigrationScriptArguments, migration: string, willApply: boolean) => Promise<void>;
export type AfterAllLifecycleFunction = (args: MigrationScriptArguments, migrationsRan: string[], willApply: boolean) => Promise<void>;
export type OnFailureLifecycleFunction = (args: MigrationScriptArguments, migration: string, e: Error) => Promise<void>;
export type MigrationLifecycleFunctions = {
    init?: InitLifecycleFunction;
    shouldBootstrap?: ShouldBootstrapLifecycleFunction;
    onBootstrap?: OnBootstrapLifecycleFunction;
    beforeAll?: BeforeAllLifecycleFunction;
    beforeEach?: BeforeEachLifecycleFunction;
    afterEach?: AfterEachLifecycleFunction;
    afterAll?: AfterAllLifecycleFunction;
    onFailure?: OnFailureLifecycleFunction;
};
export type MigrateInstanceOptions = {
    /**
     * array of regular expression strings
     */
    exclude?: string[];
    /**
     * should migrations be applied to the instance after running?
     */
    apply?: boolean;
    /**
     * only output migrations to be run
     */
    dryRun?: boolean;
    forceBootstrap?: boolean;
    allowBootstrap?: boolean;
    vars?: object;
    showNotes?: boolean;
};
export type MigrationHelpers = {
    executeJob: typeof executeJob;
    waitForJob: typeof waitForJob;
    siteArchiveImport: typeof siteArchiveImport;
    siteArchiveExport: typeof siteArchiveExport;
    siteArchiveImportJSON: typeof siteArchiveImportJSON;
    siteArchiveExportJSON: typeof siteArchiveExportJSON;
    siteArchiveImportText: typeof siteArchiveImportText;
    siteArchiveExportText: typeof siteArchiveExportText;
    ensureDataAPIPermissions: typeof ensureDataAPIPermissions;
    ensureWebDAVPermissions: typeof ensureWebDAVPermissions;
    sleep: typeof sleep;
    runMigrationScript: typeof runMigrationScript;
    syncCartridges: typeof syncCartridges;
    findCartridges: typeof findCartridges;
    reloadCodeVersion: typeof reloadCodeVersion;
    migrateInstance: typeof migrateInstance;
    uploadArchive: typeof uploadArchive;
    uploadArchiveText: typeof uploadArchiveText;
    getInstanceFeatureState: typeof getInstanceFeatureState;
    updateFeatureState: typeof updateFeatureState;
    Library: typeof Library;
    LibraryNode: typeof LibraryNode;
    exportPagesToFolder: typeof exportPagesToFolder;
    getInstanceInfo: typeof getInstanceInfo;
    getInstancePreferenceInfo: typeof getInstancePreferenceInfo;
    version: string;
    CONFIG: object;
    Environment: typeof Environment;
};
export const B2C_TOOLKIT_DATA_VERSION: 7;
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
export const B2C_MIGRATION_HELPERS: MigrationHelpers;
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
export function migrateInstance(env: Environment, dir: string, { exclude, apply, dryRun, forceBootstrap, allowBootstrap, vars, showNotes }?: MigrateInstanceOptions): Promise<void>;
/**
 *
 * @param {Environment} env
 * @param {string} target path to migration script
 * @param {object} options
 * @param {object} options.vars
 * @return {Promise<void>}
 */
export function runMigrationScript(env: Environment, target: string, { vars }: {
    vars: object;
}): Promise<void>;
/**
 * Execute a migration script provided as a string (i.e. from a heredoc)
 *
 * @param {Environment} env
 * @param {string} scriptText
 * @param {object} options
 * @param {object} options.vars
 * @return {Promise<void>}
 */
export function runMigrationScriptText(env: Environment, scriptText: string, { vars }: {
    vars: object;
}): Promise<void>;
import Environment = require("./environment");
import winston = require("winston");
import { executeJob } from "./jobs";
import { waitForJob } from "./jobs";
import { siteArchiveImport } from "./jobs";
import { siteArchiveExport } from "./jobs";
import { siteArchiveImportJSON } from "./jobs";
import { siteArchiveExportJSON } from "./jobs";
import { siteArchiveImportText } from "./jobs";
import { siteArchiveExportText } from "./jobs";
import { ensureDataAPIPermissions } from "./jobs";
import { ensureWebDAVPermissions } from "./jobs";
import { sleep } from "./util";
import { syncCartridges } from "./code-helpers";
import { findCartridges } from "./code-helpers";
import { reloadCodeVersion } from "./code-helpers";
import { uploadArchive } from "./webdav";
import { uploadArchiveText } from "./webdav";
import { getInstanceFeatureState } from "./features-helpers";
import { updateFeatureState } from "./features-helpers";
import { Library } from "./page-designer";
import { LibraryNode } from "./page-designer";
import { exportPagesToFolder } from "./page-designer";
import { getInstanceInfo } from "./info";
import { getInstancePreferenceInfo } from "./info";
//# sourceMappingURL=migrations.d.ts.map