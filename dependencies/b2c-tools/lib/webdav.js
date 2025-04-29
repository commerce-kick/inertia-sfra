/*
 * General Utility functions for WebDAV
 */

// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');
const logger = require('./logger');
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const {Buffer} = require("buffer");

const UNZIP_BODY = new URLSearchParams({ method: 'UNZIP' });

/**
 * @typedef {Object} UploadArchiveOptions
 * @property {boolean} [extract=true] extract archive on server
 * @property {boolean} [keepArchive=false] keep archive on server
 * @property {string} [archiveName] required if a buffer is provided
 */
/**
 * Higher level helpers for WebDAV uploading of multiple files.
 * Supports regular files, zip Files, directories or Buffers with automatic extraction.
 *
 * Directories are added recursively to the root of the archive (i.e. without given
 * directory name)
 *
 * @param {Environment} env
 * @param {string|Buffer} target file, directory or zip buffer
 * @param {string} uploadPath target directory related to webdav root
 * @param {UploadArchiveOptions} options
 * @returns {Promise<string>} the filename of the uploaded file/archive
 */
async function uploadArchive(env, target, uploadPath, {
    extract = true,
    keepArchive = false,
    archiveName
} = {}) {
    /** @type {Buffer|archiver.Archiver} */
    var archive = target;
    var fileName;

    if (Buffer.isBuffer(target)) {
        if (!archiveName) {
            throw new Error('archiveName is required for buffer objects');
        }
        fileName = `${archiveName}.zip`;
    } else {
        if (!fs.existsSync(target)) {
            throw new Error(`${target} not found`);
        }

        if ((await fs.promises.stat(target)).isFile()) {
            archive = await fs.promises.readFile(target);
            fileName = path.basename(target);
        } else {
            archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            archive.directory(target, false);
            archive.finalize();
            const now = (new Date()).getTime();
            fileName = `import-${now}.zip`;
        }
    }

    var webdavUploadPath = `${uploadPath}/${fileName}`;

    // upload files
    logger.debug(`uploading ${webdavUploadPath}...`);
    if (fileName.endsWith('.zip')) {
        await env.webdav.put(webdavUploadPath, archive, {
            headers: {
                'Content-Type': 'application/zip'
            }
        });
    } else {
        await env.webdav.put(webdavUploadPath, archive, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
    }
    logger.debug(`${webdavUploadPath} uploaded`);

    // unzip files
    if (fileName.endsWith('.zip') && extract) {
        await env.webdav.post(webdavUploadPath, UNZIP_BODY);
        logger.debug(`${webdavUploadPath} unzipped`);
        // delete zip file?
        if (!keepArchive) {
            await env.webdav.delete(webdavUploadPath);
            logger.debug(`${webdavUploadPath} deleted`);
        } else {
            logger.info(`${webdavUploadPath} not deleted`);
        }
    }
    return fileName;
}

/**
 * @typedef {Object} UploadArchiveTextOptions
 * @property {boolean} [extract=true] extract archive on server
 * @property {boolean} [keepArchive=false] keep archive on server
 * @property {string} [archiveName] required if a buffer is provided
 */
/**
 * Import a zip file created from a mapping of filenames to text strings
 *
 * @param {Environment} env
 * @param {Map<string, string>} data map of filenames to text data to archive
 * @param {string} uploadPath target directory related to webdav root
 * @param {UploadArchiveTextOptions} options
 * @return {Promise<string>} the filename of the uploaded archive
 */
async function uploadArchiveText(env, data, uploadPath, options = {}) {
    var {archiveName} = options;

    if (!archiveName) {
        var now = (new Date()).toISOString()
            .replace(/[:.-]+/g, '');
        archiveName = `${now}_import`;
    }

    var zip = new AdmZip();

    for (const [filename, content] of data.entries()) {
        logger.debug(`adding ${filename} to archive`);
        zip.addFile(filename, Buffer.from(content, "utf8"));
    }

    return await uploadArchive(env, zip.toBuffer(), uploadPath, Object.assign({}, options, {
        archiveName
    }))
}

module.exports = {
    uploadArchive,
    uploadArchiveText
}
