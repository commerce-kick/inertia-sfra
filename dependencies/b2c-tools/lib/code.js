// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');

const logger = require('./logger');
const path = require('path');
const fs = require("fs");
const {B2C_MIGRATION_HELPERS} = require("./migrations");
const {createRequire} = require("module");
const {findCartridges, syncCartridges, reloadCodeVersion} = require("./code-helpers");
const _require = createRequire(__filename);


/**
 * Downloads the code version as a zipped archive
 *
 * @param {Environment} env
 * @return {Promise<Buffer>}
 */
async function downloadCodeVersion(env) {
    var webdavPath = `Cartridges/${env.codeVersion}?method=ZIP`;
    var zipPath = `Cartridges/${env.codeVersion}.zip`

    logger.debug(`Zipping cartridges: ${webdavPath}`);
    var resp = await env.webdav.post(webdavPath);
    logger.debug(`Downloading archive ${zipPath}`);
    resp = await env.webdav.get(zipPath, {
        responseType: 'arraybuffer'
    });
    logger.debug(`Deleting archive ${zipPath}`);
    await env.webdav.delete(zipPath);
    return resp.data;
}

/**
 * Set code version to active code version if not found in env variables
 */
async function setEnvCodeVersion(env) {
    try {
        // set env code version to current on instance
        let resp = await env.ocapi.get('code_versions');
        env.codeVersion = resp.data.data.find(c => c.active).id;
    } catch (e) {
        throw new Error(`Unable to determine code version: ${e.message}`);
    }
}

/**
 * Find's cartridges, filters them, executes deploy scripts and syncs to the instance
 *
 * See `syncCartridges` for upload only
 *
 * @param {Environment} env
 * @param {string[]} cartridges included cartridge names
 * @param {string[]} excludeCartridges excluded cartridge names
 * @param {object} options
 * @param {boolean} options.reload reload code version
 * @param {boolean} options.cleanCartridges
 * @param {string} options.cartridgeSearchDir
 * @param {boolean} options.executeDeployScript
 * @param {string} options.deployScript
 * @param {object} options.vars
 * @return {Promise<void>}
 */
async function codeDeploy(env, cartridges, excludeCartridges, {
    reload = false,
    cleanCartridges = false,
    cartridgeSearchDir = null,
    executeDeployScript = false,
    deployScript = 'deploy.js',
    vars = {}
}) {
    logger.info('Finding cartridges...');
    var _cartridgeSearchDir = process.cwd();
    if (cartridgeSearchDir) {
        _cartridgeSearchDir = cartridgeSearchDir
    }
    var _cartridges = findCartridges(_cartridgeSearchDir);
    if (cartridges && cartridges.length) {
        _cartridges = _cartridges.filter((c) => cartridges.includes(c.dest))
    }
    if (excludeCartridges && excludeCartridges.length) {
        _cartridges = _cartridges.filter((c) => !excludeCartridges.includes(c.dest))
    }
    if (!_cartridges) {
        throw new Error("No cartridges found");
    }
    _cartridges.forEach(c => logger.info(`\t${c.dest}`));

    if (!env.codeVersion) {
        // set env code version to current on instance
        await setEnvCodeVersion(env);
    }

    var deployScriptModule;
    if (executeDeployScript && fs.existsSync(deployScript)) {
        deployScriptModule = _require(path.resolve(deployScript));
    }

    if (deployScriptModule && deployScriptModule.beforeDeploy) {
        logger.debug('Running beforeDeploy lifecycle...');
        await deployScriptModule.beforeDeploy({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars
        }, _cartridges)
    }

    logger.info('Syncing cartridges...');
    await syncCartridges(env, _cartridges, reload, {cleanCartridges});

    if (deployScriptModule && deployScriptModule.afterDeploy) {
        logger.debug('Running afterDeploy lifecycle...');
        await deployScriptModule.afterDeploy({
            env,
            logger,
            helpers: B2C_MIGRATION_HELPERS,
            vars
        }, _cartridges)
    }
}

module.exports = {
    syncCartridges,
    reloadCodeVersion,
    findCartridges,
    downloadCodeVersion,
    codeDeploy,
    setEnvCodeVersion
}
