/*
 * import and export job helpers
 */

const {Buffer} = require('buffer');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

const logger = require('./logger');
const util = require('./util');
const {sleep} = require("./util");
// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');

/**
 *
 * @param {Environment} env
 * @param {string} jobId job identifier
 * @param {string} executionId job execution id
 * @return {Promise<void>}
 */
async function waitForJob(env, jobId, executionId) {
    var startTime = Date.now();
    var ticks = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await util.sleep(3000);
        var resp = await env.ocapi.get(`jobs/${jobId}/executions/${executionId}`);
        var jobStatus = resp.data.status;
        var executionStatus = resp.data.execution_status;
        if (executionStatus === 'aborted' || jobStatus === 'ERROR') {
            try {
                // log file path is relative to /webdav not /webdav/Sites; simpler to fix this in this one instance
                var logFile = await env.webdav.get(resp.data.log_file_path, {
                    baseURL: `https://${env.secureServer ? env.secureServer : env.server}/on/demandware.servlet/webdav`
                });
                logger.error(`Job log ${resp.data.log_file_path}`);
                logger.error('\n' + logFile.data);
            } catch (e) { /* ignore */
                logger.error("Error retrieving log file");
            }
            throw new Error(`Error executing job`);
        } else if (executionStatus === 'finished') {
            break;
        } else if (ticks % 5 === 0){
            var now = Date.now();

            logger.info(`Waiting for job ${executionId} (${jobId}) to finish (${(now-startTime)/1000}s elapsed)...`)
        }
        ticks++;
    }
    var duration = resp.data.duration / 1000;
    logger.info(`Job ${executionId} (${jobId}) finished. Status ${jobStatus} (duration: ${duration}s)`);
}

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
async function executeJob(env, jobId, parameters = [], {
    waitForRunningJobs = true
} = {}) {
    var resp;
    try {
        resp = await env.ocapi.post(`jobs/${jobId}/executions`, {
            parameters
        });
    } catch (e) {
        if (e.response && e.response.status === 400 && e.response.data.fault.type === 'JobAlreadyRunningException') {
            if (waitForRunningJobs) {
                logger.warn(`Job ${jobId} Already running; waiting for it to finish...`)

                resp = await env.ocapi.post('job_execution_search', {
                    "query":
                        {
                            bool_query: {
                                must: [
                                    {"term_query": {"fields": ["job_id"], "operator": "is", "values": [jobId]}},
                                    {"term_query": {"fields": ["status"], "operator": "one_of", "values": ['RUNNING', 'PENDING']}},
                                ]
                            }
                        },
                    "sorts": [{"field": "start_time", "sort_order": "asc"}]
                })
                if (resp.data.count > 0) {
                    logger.debug(`Found job execution ${resp.data.hits[0].id} for ${jobId}`)
                    await waitForJob(env, jobId, resp.data.hits[0].id)
                    return await executeJob(env, jobId, parameters)
                } else {
                    logger.debug(`Could not find running job execution`)
                    return await executeJob(env, jobId, parameters)
                }
            } else {
                throw new Error(`Job ${jobId} already running`)
            }
        } else {
            throw e;
        }
    }
    return resp.data;
}

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
async function siteArchiveImport(env, target, options = {}) {
    const {archiveName, keepArchive} = options;
    var now = (new Date()).getTime();

    if (Buffer.isBuffer(target)) {
        if (!archiveName) {
            throw new Error("archiveName is required for buffer objects");
        }
        /** @type {Buffer|archiver.Archiver} */
        var archive = target;
        var zipFilename = `${archiveName}.zip`;
    } else {
        if (!fs.existsSync(target)) {
            throw new Error(`${target} not found`);
        }

        if ((await fs.promises.stat(target)).isFile()) {
            archive = await fs.readFile(target);
            zipFilename = path.basename(target);
        } else {
            archive = archiver('zip', {
                zlib: {level: 9} // Sets the compression level.
            });
            archive.directory(target, `import-${now}`);
            archive.finalize();
            zipFilename = `import-${now}.zip`;
        }
    }

    var uploadPath = `Impex/src/instance/${zipFilename}`;

    logger.debug(`uploading ${uploadPath}...`);
    await env.webdav.put(uploadPath, archive);
    logger.debug(`${uploadPath} uploaded`);

    logger.info('Executing sfcc-site-archive-import job');
    var resp = await env.ocapi.post('jobs/sfcc-site-archive-import/executions', {
        file_name: zipFilename
    });
    var jobId = resp.data.id;
    var jobStatus = resp.data.status;
    logger.info(`Job ${jobId} executed. Status ${jobStatus}`);

    await waitForJob(env, 'sfcc-site-archive-import', jobId);

    if (!keepArchive) {
        await env.webdav.delete(uploadPath);
        logger.debug(`${uploadPath} deleted`);
    } else {
        logger.debug(`${uploadPath} not deleted`);
    }
}

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
async function siteArchiveExport(env, dataUnits, zipFilename) {
    var webdavPath = `Impex/src/instance/${zipFilename}`;

    var resp = await env.ocapi.post('jobs/sfcc-site-archive-export/executions', {
        export_file: zipFilename,
        data_units: dataUnits
    });
    var jobId = resp.data.id;
    var jobStatus = resp.data.status;
    logger.info(`Job ${jobId} executed. Status ${jobStatus}`);

    await waitForJob(env, 'sfcc-site-archive-export', jobId);
    logger.debug(`Downloading archive ${webdavPath}`);
    resp = await env.webdav.get(webdavPath, {
        responseType: 'arraybuffer'
    });
    await env.webdav.delete(webdavPath);
    return resp.data;
}

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
async function siteArchiveExportJSON(env, dataUnits) {
    var _export = await siteArchiveExportText(env, dataUnits);
    var jsonMap = new Map();
    for (const entry of _export.entries()) {
        let [filename, contents] = entry;
        if (filename.endsWith(".json")) {
            let parsedContents = {};
            try {
                parsedContents = JSON.parse(contents)
            } catch (e) {  /* ignore */}
            jsonMap.set(filename, parsedContents);
        } else if (filename.endsWith('.xml')) {
            jsonMap.set(filename, await xml2js.parseStringPromise(contents));
        } else {
            jsonMap.set(filename, contents);
        }
    }
    return jsonMap;
}

/**
 * Imports an object of impex filenames to objects to XML/JSON/text
 *
 * @param {Environment} env
 * @param {Map<string, object>} data
 * @return {Promise<void>}
 */
async function siteArchiveImportJSON(env, data) {
    var now = (new Date()).toISOString()
        .replace(/[:.-]+/g, '');
    var archiveDir = `${now}_import`;

    var zip = new AdmZip();
    var builder = new xml2js.Builder();

    for (const [filename, content] of data.entries()) {
        logger.debug(`adding ${archiveDir}/${filename} to archive`);
        if (filename.endsWith(".json")) {
            zip.addFile(`${archiveDir}/${filename}`, Buffer.from(JSON.stringify(content, null, 2), "utf8"));
        } else if (filename.endsWith('.xml')) {
            var xmlStr = builder.buildObject(content);
            zip.addFile(`${archiveDir}/${filename}`, Buffer.from(xmlStr, "utf8"));
        } else {
            zip.addFile(`${archiveDir}/${filename}`, Buffer.from(content, "utf8"));
        }
    }

    return await siteArchiveImport(env, zip.toBuffer(), {
        archiveName: archiveDir
    })
}

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
async function siteArchiveExportText(env, dataUnits) {
    var now = (new Date()).toISOString()
        .replace(/[:.-]+/g, '');
    var archiveDir = `${now}_export`;
    var zipFilename = `${archiveDir}.zip`;

    const data = await siteArchiveExport(env, dataUnits, zipFilename);

    var zip = new AdmZip(data);
    var zipEntries = zip.getEntries();

    return new Map(zipEntries.map((e) => {
        return [
            e.entryName.substr(`${archiveDir}/`.length),
            zip.readAsText(e)
        ]
    }))
}

/**
 * Import filename to text strings as site impex
 *
 * @param {Environment} env
 * @param {Map<string, string>} data
 * @return {Promise<void>}
 */
async function siteArchiveImportText(env, data) {
    var now = (new Date()).toISOString()
        .replace(/[:.-]+/g, '');
    var archiveDir = `${now}_import`;

    var zip = new AdmZip();

    for (const [filename, content] of data.entries()) {
        logger.debug(`adding ${archiveDir}/${filename} to archive`);
        zip.addFile(`${archiveDir}/${filename}`, Buffer.from(content, "utf8"));
    }

    return await siteArchiveImport(env, zip.toBuffer(), {
        archiveName: archiveDir
    })
}

/**
 * @typedef {Object} ResourceDocument
 * @property {string} resource_id
 * @property {number} [cache_time]
 * @property {string[]} methods
 * @property {string} [read_attributes]
 * @property {string} [write_attributes]
 */

/**
 * This callback is displayed as part of the Requester class.
 * @callback permissionValidatorCallback
 * @returns {Promise<boolean>} true if permission is validated
 */

/**
 *
 * @param {ResourceDocument} current
 * @param {ResourceDocument} wanted
 * @returns {boolean} true if the documents are equal or if the current is a superset
 */
function compareResourceDocuments(current, wanted) {
    return (
        current.resource_id === wanted.resource_id
        && (wanted.methods.every((v) => current.methods.includes(v)))
        && (wanted.read_attributes && current.read_attributes === wanted.read_attributes)
        && (wanted.write_attributes && current.write_attributes === wanted.write_attributes)
    );
}

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
async function ensureDataAPIPermissions(env, resources = [], validator, options = {maximumChecks: 60}) {
    const {maximumChecks} = options;
    const currentClientID = options.clientID || env.clientID;
    if (!resources.length) {
        throw new Error("Resources must not be empty");
    }

    logger.info(`Ensuring DATA API permissions for clientID ${currentClientID}`);

    const archive = await siteArchiveExportText(env, {
        global_data: {
            ocapi_settings: true
        }
    });

    archive.delete('ocapi-settings/wapi_shop_config.json');
    var dataAPIConfig = JSON.parse(archive.get('ocapi-settings/wapi_data_config.json'));

    var currentConfig = dataAPIConfig.clients.find((config) => config.client_id === currentClientID);
    var hasUpdatedAnything = false;

    if (!currentConfig) {
        currentConfig = {
            client_id: currentClientID,
            resources: []
        }
        dataAPIConfig.clients.push(currentConfig)
    }

    resources.reverse().forEach((resource) => {
        let idx = currentConfig.resources.findIndex((r) => r.resource_id === resource.resource_id);
        if (idx === -1) {
            hasUpdatedAnything = true;
            logger.debug(`Adding resource to DATA API: ${resource}`)
            currentConfig.resources.unshift(resource);
        } else if (!compareResourceDocuments(currentConfig.resources[idx], resource)) { // update
            hasUpdatedAnything = true;
            /** @type {ResourceDocument} */
            let current = currentConfig.resources[idx];
            logger.debug(`Updating resource to DATA API: ${resource} (current: ${current})`)
            current.methods = current.methods.concat(
                resource.methods.filter(m => !current.methods.includes(m))
            );
            current.write_attributes = resource.write_attributes ? resource.write_attributes : current.write_attributes;
            current.read_attributes = resource.read_attributes ? resource.read_attributes : current.read_attributes;
        }
    });

    if (hasUpdatedAnything) {
        archive.set('ocapi-settings/wapi_data_config.json', JSON.stringify(dataAPIConfig, null, 2));
        await siteArchiveImportText(env, archive);

        var iterations = 1;
        var success = false;
        while (iterations <= maximumChecks) {
            logger.warn(`Checking for updated permissions (try ${iterations} / ${maximumChecks})...`);
            try {
                success = await validator();
                if (success) {
                    break;
                }
                logger.debug(`Permissions check returned falsey value`);
            } catch (e) {
                logger.debug(`Permissions check exception: ${e.message}`)
            }
            await sleep(2000);
            iterations++;
        }

        if (!success) {
            throw new Error('Could not verify DATA API permissions were applied')
        }
    } else {
        logger.info('No permissions update required');
    }
}

/**
 * @typedef {Object} PermissionDocument
 * @property {string} path
 * @property {string[]} operations
 */
/**
 *
 * @param {PermissionDocument} a
 * @param {PermissionDocument} b
 * @returns {boolean} true if the documents are trivially equal
 */
function comparePermissionDocuments(a, b) {
    return (
        a.path === b.path
        && (a.operations.length === b.operations.length && a.operations.every((v) => b.operations.includes(v)))
    );
}

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
async function ensureWebDAVPermissions(env, permissions = [], validator, options = {maximumChecks: 60}) {
    const {maximumChecks} = options;
    const currentClientID = options.clientID || env.clientID;
    if (!permissions.length) {
        throw new Error("permissions must not be empty");
    }

    logger.info(`Ensuring WebDAV permissions for clientID ${currentClientID}`);

    const archive = await siteArchiveExportJSON(env, {
        global_data: {
            webdav_client_permissions: true
        }
    });

    var webdav = archive.get('webdav/client_permissions.json');

    var currentConfig = webdav.clients.find((config) => config.client_id === currentClientID);
    var hasUpdatedAnything = false;

    if (!currentConfig) {
        currentConfig = {
            client_id: currentClientID,
            permissions: []
        }
        webdav.clients.push(currentConfig)
    }

    permissions.reverse().forEach((resource) => {
        let idx = currentConfig.permissions.findIndex((r) => r.path === resource.path);
        if (idx === -1) {
            hasUpdatedAnything = true;
            currentConfig.permissions.unshift(resource);
        } else if (!comparePermissionDocuments(currentConfig.permissions[idx], resource)) { // update
            hasUpdatedAnything = true;
            currentConfig.permissions[idx] = resource;
        }
    });

    if (hasUpdatedAnything) {
        archive.set('webdav/client_permissions.json', webdav);
        await siteArchiveImportJSON(env, archive);

        var iterations = 1;
        while (iterations <= maximumChecks) {
            logger.warn(`Checking for updated permissions (try ${iterations} / ${maximumChecks})...`);
            try {
                var checkResult = await validator();
                if (checkResult) {
                    break;
                }
                logger.debug(`Permissions check returned falsey value`);
            } catch (e) {
                logger.debug(`Permissions check exception: ${e.message}`)
            }
            await sleep(2000);
            iterations++;
        }
    } else {
        logger.info('No permissions update required');
    }
}

module.exports = {
    executeJob,
    waitForJob,
    siteArchiveExportText,
    siteArchiveImportText,
    siteArchiveImport,
    siteArchiveExport,
    siteArchiveExportJSON,
    siteArchiveImportJSON,
    ensureDataAPIPermissions,
    ensureWebDAVPermissions
}
