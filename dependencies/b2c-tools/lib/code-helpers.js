// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');

const logger = require('./logger');
const archiver = require('archiver');
const glob = require('glob');
const path = require('path');

const UNZIP_BODY = new URLSearchParams({ method: 'UNZIP' });

/**
 * @typedef {Object} CartridgeMapping
 * @property {string} name - cartridge name
 * @property {string} dest - cartridge name (legacy)
 * @property {string} src - directory
 */

/**
 * Find Cartridges recursively in the working directory
 *
 * @param {string} [directory] - directory search for cartridges
 * @return {CartridgeMapping[]}
 */
function findCartridges(directory) {
    if (!directory) {
        directory = process.cwd();
    }
    var projectFiles = glob.sync('.project', {
        matchBase: true,
        ignore: '**/node_modules/**',
        cwd: directory
    });
    var cartridges = projectFiles.map(f => {
        var dirname = path.resolve(directory, path.dirname(f));
        var cartridge = path.basename(dirname);
        return {
            name: cartridge,
            dest: cartridge,
            src: dirname
        };
    });
    return cartridges;
}

/**
 * Reloads (or activates) the environments code version
 *
 * @param {Environment} env
 * @return {Promise<void>}
 */
async function reloadCodeVersion(env) {
    var resp = await env.ocapi.get('code_versions');
    var activeVersion = resp.data.data.filter((cv) => cv.active).pop();
    const currentCodeVersion = env.codeVersion || activeVersion.id
    if (activeVersion.id === currentCodeVersion) {
        var anyOtherVersion = resp.data.data.filter((cv) => cv.id !== currentCodeVersion).pop();
        if (anyOtherVersion) {
            logger.debug(`Activating ${anyOtherVersion.id}`)
            await env.ocapi.patch(`code_versions/${anyOtherVersion.id}`, {
                active: true
            });
        } else {
            throw new Error("Cannot find alternate code version to activate");
        }
    }
    logger.debug(`Activating ${currentCodeVersion}`)
    await env.ocapi.patch(`code_versions/${currentCodeVersion}`, {
        active: true
    });
}

/**
 * Syncs the given cartridge mapping (src:dest) to the environments code version
 *
 * @param {Environment} env
 * @param {CartridgeMapping[]} cartridges
 * @param {boolean} reload
 * @param {object} options
 * @param {boolean} [options.cleanCartridges]
 * @return {Promise<void>}
 */
async function syncCartridges(env, cartridges, reload = false, options = {}) {
    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    var now = (new Date()).getTime();
    const {cleanCartridges = false} = options;

    var cartridgesToClean = [];
    cartridges.forEach((c) => {
        archive.directory(c.src, path.join(env.codeVersion, c.dest));
        cartridgesToClean.push(path.join('Cartridges', env.codeVersion, c.dest));
    });
    var uploadPath = `Cartridges/_sync-${now}.zip`;
    archive.finalize();

    try {
        // delete existing cartridges prior to upload
        if (cleanCartridges && cartridgesToClean.length) {
            for (const fp of cartridgesToClean) {
                try {
                    await env.webdav.delete(fp);
                    logger.info(`${fp} deleted`);
                } catch (e) {
                    logger.debug(e.message || e);
                }
            }
        }

        await env.webdav.put(uploadPath, archive, {
            headers: {
                'Content-Type': 'application/zip'
            }
        });
        logger.debug(`${uploadPath} uploaded`);

        await env.webdav.post(uploadPath, UNZIP_BODY);
        logger.debug(`${uploadPath} unzipped`);
        logger.info(`[UPLOAD] uploaded to ${env.server} code version ${env.codeVersion}`);
        await env.webdav.delete(uploadPath);
        logger.debug(`${uploadPath} deleted`);
        if (reload) {
            logger.info("Reloading code version...");
            try {
                await reloadCodeVersion(env)
            } catch (e) {
                logger.error("Could not reload code version; You may need to do this manually: ");
                logger.error(e.message || e);
            }
        }
    } catch (e) {
        logger.error(e.message || e);
    }
}

module.exports = {
    syncCartridges,
    findCartridges,
    reloadCodeVersion
}