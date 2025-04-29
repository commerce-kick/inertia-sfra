/// <reference types="node" />
export type JobExecutionParameter = {
    name: string;
    value: string;
};
export type JobExecution = {
    id: string;
    job_id: string;
    status: string;
};
export type ExecuteJobOptions = {
    /**
     * wait for running executions to finish (Default true)
     */
    waitForRunningJobs: boolean;
};
export type ExportSitesConfiguration = {
    ab_tests: boolean;
    active_data_feeds: boolean;
    all: boolean;
    cache_settings: boolean;
    campaigns_and_promotions: boolean;
    content: boolean;
    coupons: boolean;
    custom_objects: boolean;
    customer_cdn_settings: boolean;
    customer_groups: boolean;
    distributed_commerce_extensions: boolean;
    dynamic_file_resources: boolean;
    gift_certificates: boolean;
    ocapi_settings: boolean;
    payment_methods: boolean;
    payment_processors: boolean;
    redirect_urls: boolean;
    search_settings: boolean;
    shipping: boolean;
    site_descriptor: boolean;
    site_preferences: boolean;
    sitemap_settings: boolean;
    slots: boolean;
    sorting_rules: boolean;
    source_codes: boolean;
    static_dynamic_alias_mappings: boolean;
    stores: boolean;
    tax: boolean;
    url_rules: boolean;
};
export type ExportGlobalDataConfiguration = {
    access_roles: boolean;
    all: boolean;
    csc_settings: boolean;
    csrf_whitelists: boolean;
    custom_preference_groups: boolean;
    custom_quota_settings: boolean;
    custom_types: boolean;
    geolocations: boolean;
    global_custom_objects: boolean;
    job_schedules: boolean;
    job_schedules_deprecated: boolean;
    locales: boolean;
    meta_data: boolean;
    oauth_providers: boolean;
    ocapi_settings: boolean;
    page_meta_tags: boolean;
    preferences: boolean;
    price_adjustment_limits: boolean;
    services: boolean;
    sorting_rules: boolean;
    static_resources: boolean;
    system_type_definitions: boolean;
    users: boolean;
    webdav_client_permissions: boolean;
};
export type ExportDataUnitsConfiguration = {
    catalog_static_resources: {
        [x: string]: boolean;
    };
    catalogs: {
        [x: string]: boolean;
    };
    customer_lists: {
        [x: string]: boolean;
    };
    inventory_lists: {
        [x: string]: boolean;
    };
    library_static_resources: {
        [x: string]: boolean;
    };
    libraries: {
        [x: string]: boolean;
    };
    price_books: {
        [x: string]: boolean;
    };
    sites: {
        [x: string]: Partial<ExportSitesConfiguration>;
    };
    global_data: Partial<ExportGlobalDataConfiguration>;
};
export type ResourceDocument = {
    resource_id: string;
    cache_time?: number;
    methods: string[];
    read_attributes?: string;
    write_attributes?: string;
};
/**
 * This callback is displayed as part of the Requester class.
 */
export type permissionValidatorCallback = () => Promise<boolean>;
export type PermissionDocument = {
    path: string;
    operations: string[];
};
/**
 * @typedef {Object} JobExecutionParameter
 * @property {string} name
 * @property {string} value
 */
/**
 * @typedef {Object} JobExecution
 * @property {string} id
 * @property {string} job_id
 * @property {string} status
 */
/**
 * @typedef {Object} ExecuteJobOptions
 * @property {boolean} waitForRunningJobs wait for running executions to finish (Default true)
 */
/**
 *
 * @param {Environment} env
 * @param {string} jobId job identifier
 * @param {JobExecutionParameter[]} parameters
 * @param {Partial<ExecuteJobOptions>} options
 * @return {Promise<JobExecution>}
 */
export function executeJob(env: Environment, jobId: string, parameters?: JobExecutionParameter[], { waitForRunningJobs }?: Partial<ExecuteJobOptions>): Promise<JobExecution>;
/**
 *
 * @param {Environment} env
 * @param {string} jobId job identifier
 * @param {string} executionId job execution id
 * @return {Promise<void>}
 */
export function waitForJob(env: Environment, jobId: string, executionId: string): Promise<void>;
/**
 * Export an object of impex files to strings of XML
 *
 * returns:
 * {
 *     "meta/system-objecttype-extensions.xml": "<?xml version=\"1.0\"...."
 * }
 *
 * @param {Environment} env
 * @param {Partial<ExportDataUnitsConfiguration>} dataUnits
 * @return {Promise<Map<string, string>>}
 */
export function siteArchiveExportText(env: Environment, dataUnits: Partial<ExportDataUnitsConfiguration>): Promise<Map<string, string>>;
/**
 * Import filename to text strings as site impex
 *
 * @param {Environment} env
 * @param {Map<string, string>} data
 * @return {Promise<void>}
 */
export function siteArchiveImportText(env: Environment, data: Map<string, string>): Promise<void>;
/**
 * Import a site impex
 *
 * @param {Environment} env
 * @param {string|Buffer} target directory, zip file path or buffer of zip content
 * @param {object} options
 * @param {string} [options.archiveName] required if Buffer is used
 * @param {boolean} [options.keepArchive] if true, keep archive on isntance
 * @return {Promise<void>}
 */
export function siteArchiveImport(env: Environment, target: string | Buffer, options?: {
    archiveName?: string;
    keepArchive?: boolean;
}): Promise<void>;
/**
 * @typedef {Object} ExportSitesConfiguration
 * @property {boolean} ab_tests
 * @property {boolean} active_data_feeds
 * @property {boolean} all
 * @property {boolean} cache_settings
 * @property {boolean} campaigns_and_promotions
 * @property {boolean} content
 * @property {boolean} coupons
 * @property {boolean} custom_objects
 * @property {boolean} customer_cdn_settings
 * @property {boolean} customer_groups
 * @property {boolean} distributed_commerce_extensions
 * @property {boolean} dynamic_file_resources
 * @property {boolean} gift_certificates
 * @property {boolean} ocapi_settings
 * @property {boolean} payment_methods
 * @property {boolean} payment_processors
 * @property {boolean} redirect_urls
 * @property {boolean} search_settings
 * @property {boolean} shipping
 * @property {boolean} site_descriptor
 * @property {boolean} site_preferences
 * @property {boolean} sitemap_settings
 * @property {boolean} slots
 * @property {boolean} sorting_rules
 * @property {boolean} source_codes
 * @property {boolean} static_dynamic_alias_mappings
 * @property {boolean} stores
 * @property {boolean} tax
 * @property {boolean} url_rules
 */
/**
 * @typedef {Object} ExportGlobalDataConfiguration
 * @property {boolean} access_roles
 * @property {boolean} all
 * @property {boolean} csc_settings
 * @property {boolean} csrf_whitelists
 * @property {boolean} custom_preference_groups
 * @property {boolean} custom_quota_settings
 * @property {boolean} custom_types
 * @property {boolean} geolocations
 * @property {boolean} global_custom_objects
 * @property {boolean} job_schedules
 * @property {boolean} job_schedules_deprecated
 * @property {boolean} locales
 * @property {boolean} meta_data
 * @property {boolean} oauth_providers
 * @property {boolean} ocapi_settings
 * @property {boolean} page_meta_tags
 * @property {boolean} preferences
 * @property {boolean} price_adjustment_limits
 * @property {boolean} services
 * @property {boolean} sorting_rules
 * @property {boolean} static_resources
 * @property {boolean} system_type_definitions
 * @property {boolean} users
 * @property {boolean} webdav_client_permissions
 */
/**
 * @typedef {Object} ExportDataUnitsConfiguration
 * @property {Object<string, boolean>} catalog_static_resources
 * @property {Object<string, boolean>} catalogs
 * @property {Object<string, boolean>} customer_lists
 * @property {Object<string, boolean>} inventory_lists
 * @property {Object<string, boolean>} library_static_resources
 * @property {Object<string, boolean>} libraries
 * @property {Object<string, boolean>} price_books
 * @property {Object<string, Partial<ExportSitesConfiguration>>} sites
 * @property {Partial<ExportGlobalDataConfiguration>} global_data
 */
/**
 * Export the given site archive, returning the zip data
 *
 * @param {Environment} env
 * @param {Partial<ExportDataUnitsConfiguration>} dataUnits
 * @param {string} zipFilename filename of the export
 * @return {Promise<Buffer>}
 */
export function siteArchiveExport(env: Environment, dataUnits: Partial<ExportDataUnitsConfiguration>, zipFilename: string): Promise<Buffer>;
/**
 * Export an object of impex files to JSON objects in xml2js form
 *
 * returns:
 * {
 *     "meta/system-objecttype-extensions.xml": {
 *          ...
 *     }
 * }
 *
 * @param {Environment} env
 * @param {Partial<ExportDataUnitsConfiguration>} dataUnits
 * @return {Promise<Map<string, object>>}
 */
export function siteArchiveExportJSON(env: Environment, dataUnits: Partial<ExportDataUnitsConfiguration>): Promise<Map<string, object>>;
/**
 * Imports an object of impex filenames to objects to XML/JSON/text
 *
 * @param {Environment} env
 * @param {Map<string, object>} data
 * @return {Promise<void>}
 */
export function siteArchiveImportJSON(env: Environment, data: Map<string, object>): Promise<void>;
/**
 * Ensures the environment has access to the given DATA API resources by adding or updating
 * Resource Documents for the client ID.
 *
 * If changes are made `validator` will be called asynchronously until it returns true
 *
 * Note: this method only trivially compares resource identifiers, methods and read/write attributes. If all
 * values are equal to the instance's state the resource will not be updated.
 *
 * Pass {clientID: '...'} to the options to use an arbitrary client ID rather than the current environment
 *
 * @param {Environment} env
 * @param {ResourceDocument[]} resources array of resources to add/update
 * @param {permissionValidatorCallback} validator array of resources to add/update
 * @param {object} options
 * @param {number} [options.maximumChecks] maximum number of permission checks
 * @param {string} [options.clientID] set permissions for this client id (Default: environments)
 * @return {Promise<void>}
 */
export function ensureDataAPIPermissions(env: Environment, resources: ResourceDocument[], validator: permissionValidatorCallback, options?: {
    maximumChecks?: number;
    clientID?: string;
}): Promise<void>;
/**
 * Ensures the environment has access to the given WEBDAV resources by adding or updating
 * Resource Documents for the client ID.
 *
 * If changes are made `validator` will be called asynchronously until it returns true
 *
 * Note: this method only trivially compares resource identifiers, methods and read/write attributes. If all
 * values are equal to the instance's state the resource will not be updated.
 *
 * @param {Environment} env
 * @param {PermissionDocument[]} permissions array of permissions to add/update
 * @param {permissionValidatorCallback} validator array of resources to add/update
 * @param {object} options
 * @param {number} [options.maximumChecks] maximum number of permission checks
 * @param {number} [options.clientID] set permissions for this client id (Default: environments)
 * @return {Promise<void>}
 */
export function ensureWebDAVPermissions(env: Environment, permissions: PermissionDocument[], validator: permissionValidatorCallback, options?: {
    maximumChecks?: number;
    clientID?: number;
}): Promise<void>;
import Environment = require("./environment");
import { Buffer } from "buffer";
//# sourceMappingURL=jobs.d.ts.map