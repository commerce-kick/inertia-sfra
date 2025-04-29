const logger = require("./logger");
const {findCartridges, downloadCodeVersion, reloadCodeVersion, setEnvCodeVersion, codeDeploy} = require("./code");
const Environment = require("./environment");
const AdmZip = require("adm-zip");
const chokidar = require('chokidar');
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const UPLOAD_DEBOUNCE_TIME = process.env.SFCC_UPLOAD_DEBOUNCE_TIME ? parseInt(process.env.SFCC_UPLOAD_DEBOUNCE_TIME) : 100

function debounce(fn, time) {
    var timer = null;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = null;
            fn();
        }, time);
    };
}

const UNZIP_BODY = (new URLSearchParams({
    method: 'UNZIP'
})).toString()

async function codeDownload(outputDir, cartridges, mirror = false, excludeCartridges) {
    logger.info('Downloading cartridges...');
    var localCartridges = {};
    if (mirror) {
        var _cartridges = findCartridges();
        if (cartridges && cartridges.length) {
            _cartridges = _cartridges.filter((c) => cartridges.includes(c.dest))
        }
        _cartridges.forEach((c) => localCartridges[c.dest] = c)
        logger.debug("local cartridges to mirror", _cartridges);
    }
    var env = new Environment();
    const archive = await downloadCodeVersion(env);

    var zip = new AdmZip(archive);

    if (zip.getEntryCount() === 0) {
        throw new Error(`Code version ${env.codeVersion} empty`)
    }
    logger.info('Extracting cartridges...');
    zip.getEntries().forEach((entry) => {
        const entryParts = entry.entryName.split('/');
        if (entryParts.length < 3) {
            return;
        }
        // eslint-disable-next-line no-unused-vars
        const codeVersion = entryParts.shift();
        const cartridgeName = entryParts.shift();

        if (cartridges && cartridges.length && !cartridges.includes(cartridgeName)) {
            return;
        } else if (excludeCartridges && excludeCartridges.length && excludeCartridges.includes(cartridgeName)) {
            return;
        } else if (mirror && localCartridges[cartridgeName]) {
            let outputPath = entryParts.join('/');
            let targetFileName = path.join(localCartridges[cartridgeName].src, outputPath);
            var oldMode = null;
            if (fs.existsSync(targetFileName)) {
                oldMode = fs.statSync(targetFileName).mode;
            }
            zip.extractEntryTo(entry, localCartridges[cartridgeName].src, false, true, false, outputPath);
            if (oldMode) {
                fs.chmodSync(targetFileName, oldMode);
            }
        } else {
            let outputPath = path.join(cartridgeName, entryParts.join('/'));
            let targetFileName = path.join(outputDir, outputPath);
            oldMode = null;
            if (fs.existsSync(targetFileName)) {
                oldMode = fs.statSync(targetFileName).mode;
            }
            zip.extractEntryTo(entry, outputDir, false, true, false, outputPath);
            if (oldMode) {
                fs.chmodSync(targetFileName, oldMode);
            }
        }
    })
}

async function codeWatch(cartridges, excludeCartridges, {
    cartridgeSearchDir = null
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
    var env = new Environment();

    if (!env.codeVersion) {
        // set env code version to current on instance
        await setEnvCodeVersion(env);
    }

    var cwd = process.cwd()
    var filesToUpload = new Set()
    var filesToDelete = new Set()
    var lastError = 0;

    // map an absolute path to the cartridge
    function fileToCartridge(f) {
        var cartridge = _cartridges.find(c => {
            return f.startsWith(c.src)
        })

        if (!cartridge) {
            logger.warn(`Could not find cartridge for ${f}`)
            return;
        }

        var cartridgeRelativeFilename = path.join(cartridge.dest, f.substring(cartridge.src.length))
        return {
            src: f,
            dest: cartridgeRelativeFilename
        }
    }

    // debounce upload so that all file events in close proximity
    // are uploaded together; queue of files will be drained after
    // x ms
    var _upload = debounce(async function upload() {
        let _filesToUpload = Array.from(filesToUpload).map(fileToCartridge)
        let _filesToDelete = Array.from(filesToDelete).map(fileToCartridge)
        filesToUpload.clear()
        filesToDelete.clear()

        var webdavLocation = `Cartridges/${env.codeVersion}`
        var archive = archiver('zip', {
            zlib: {level: 5} // Sets the compression level.
        });

        var now = (new Date()).getTime()
        // don't spam upload on error
        if (now - lastError < (5 * 1000)) {
            logger.warn('Waiting...')
            return;
        }

        if (_filesToUpload.length) {
            var uploadPath = `${webdavLocation}/_upload-${now}.zip`

            _filesToUpload.forEach(f => {
                archive.file(f.src, {name: f.dest})
            });

            // don't await this; the webdav operation next will consume the stream
            archive.finalize();

            try {
                await env.webdav.put(uploadPath, archive)
                logger.debug(`${uploadPath} uploaded`)
                await env.webdav.post(uploadPath, UNZIP_BODY)
                logger.debug(`${uploadPath} unzipped`)
                logger.info(`[UPLOAD] uploaded to ${env.server} ${webdavLocation}`)
                for (var i = 0; i < _filesToUpload.length; i++) {
                    if (i > 10) {
                        logger.info(`\t...${_filesToUpload.length - i} more...`)
                        break;
                    }
                    logger.info('\t' + _filesToUpload[i].dest)
                }
                await env.webdav.delete(uploadPath)
                logger.debug(`${uploadPath} deleted`)
            } catch (e) {
                lastError = now
                logger.error(`Error uploading ${e.message}`)
            }
        }

        if (_filesToDelete.length) {
            logger.info(`[DELETE] deleting files on ${env.server} ${webdavLocation}`);
            for (i = 0; i < _filesToDelete.length; i++) {
                var deletePath = `${webdavLocation}/${_filesToDelete[i].dest}`;
                try {
                    await env.webdav.delete(deletePath);
                } catch (e) {
                    /* ignore as it's probably not found anyway */
                }
                if (i > 10) {
                    logger.info(`\t...${_filesToDelete.length - i} more...`);
                    break;
                }
                logger.info('\t' + _filesToDelete[i].dest);
            }
        }
    }, UPLOAD_DEBOUNCE_TIME)

    logger.info('Watching for changes...')
    chokidar.watch(_cartridges.map(c => c.src), {
        ignored: /(^|[/\\])\../,
        ignoreInitial: true,
        cwd: process.cwd()
    }).on('all', (event, p) => {
        var fullPath = path.resolve(cwd, p)
        logger.debug(`file event: ${event} ${fullPath}`);

        if (['change', 'add'].indexOf(event) !== -1) {
            filesToUpload.add(fullPath);
            _upload();
        } else if (['unlink'].indexOf(event) !== -1) {
            filesToDelete.add(fullPath);
            _upload();
        }
    });
}

module.exports = {
    command: 'code',
    desc: 'manage code versions',
    builder: (yargs) => yargs
        .option('cartridges-dir', {
            desc: 'cartridge search directory (default CWD)',
            type: 'string',
        })
        .command('deploy', 'deploy cartridges to code version',
            async (y) => y
                .option('r', {
                    desc: 'reload code version',
                    alias: 'reload',
                    type: 'boolean',
                    default: true
                })
                .option('clean', {
                    desc: 'clean cartridges from WebDAV prior to upload',
                    type: 'boolean',
                    default: false
                })
                .option('execute-deploy-script', {
                    desc: 'execute deploy lifecycle script',
                    type: 'boolean',
                    default: true
                })
                .option('deploy-script', {
                    desc: 'path to deployment lifecycle script',
                    default: 'b2c-deploy.js'
                })
                .group(['reload', 'clean', 'cartridges-dir', 'execute-deploy-script', 'deploy-script'], 'Code Deployment'),
            async (argv) => {
                const env = new Environment();
                await codeDeploy(env, argv.cartridge, argv['exclude-cartridges'], {
                    reload: argv.reload,
                    cleanCartridges: argv.clean,
                    cartridgeSearchDir: argv['cartridges-dir'],
                    executeDeployScript: argv['execute-deploy-script'],
                    deployScript: argv['deploy-script'],
                    vars: argv.vars
                })
            }
        )
        .command('download', 'download cartridges from code version',
            async (y) => y
                .option('o', {
                    desc: 'cartridge output dir',
                    alias: 'output',
                    default: './cartridges'
                })
                .option('mirror', {
                    desc: 'download cartridges to their local directory',
                    type: 'boolean',
                    default: false
                })
                .group(['output', 'mirror'], 'Code Download'),
            async (argv) => await codeDownload(argv.output, argv.cartridge, argv.mirror, argv['exclude-cartridges'])
        )
        .command('watch', 'deploy cartridges to code version',
            async (y) => y
                .group(['cartridges-dir'], 'Code Watch'),
            async (argv) => await codeWatch(argv.cartridge, argv['exclude-cartridges'], {
                cartridgeSearchDir: argv['cartridges-dir']
            })
        )
        .command('reload', 'reload active code version',
            (yargs) => yargs,
            async () => {
                const env = new Environment();
                if (!env.codeVersion) {
                    try {
                        // set env code version to current on instance
                        let resp = await env.ocapi.get('code_versions');
                        env.codeVersion = resp.data.data.find(c => c.active).id;
                    } catch (e) {
                        throw new Error(`Unable to determine code version: ${e.message}`);
                    }
                }
                logger.info(`Reloading code version ${env.codeVersion}...`);
                try {
                    await reloadCodeVersion(env)
                } catch (e) {
                    logger.error("Could not reload code version");
                    logger.error(e.message || e);
                }
            }
        ).demandCommand()
};
