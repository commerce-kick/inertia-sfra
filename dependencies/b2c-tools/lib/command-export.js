const AdmZip = require('adm-zip');
const http = require('http');
const exportTemplate = require('./assets/export-template')
const open = require('open');

const Environment = require('./environment');
const logger = require('./logger');
const {siteArchiveExport} = require('./jobs');
const {exportPagesToFolder} = require("./page-designer");
const {getInstanceInfo} = require("./info");


/**
 * @typedef {Object} CollectionLists
 * @property {string[]} sites
 * @property {string[]} inventoryLists
 * @property {string[]} catalogs
 * @property {string[]} libraries
 */

/**
 * Retrieves list of catalogs, inventory lists, sites and libraries for interactive display
 *
 * @param env {Environment}
 * @return {Promise<CollectionLists>}
 */
async function getCollectionsFromInstance(env) {
    var resp;
    var sites = [];
    var catalogs = [];
    var inventoryLists = [];
    var libraries = [];
    try {
        let retrieved = 0;
        do {
            resp = await env.ocapi.get(`sites?start=${retrieved}&count=100`);
            if (resp.data.count) {
                sites = sites.concat(resp.data.data.map((s) => s.id));
                retrieved += resp.data.count;
            }
        } while (retrieved !== resp.data.total);
    } catch (e) {
        if (e.response && e.response.status === 403) {
            logger.warn('Cannot query sites (check DATA API permissions)');
        } else {
            throw e;
        }
    }
    try {
        let retrieved = 0;
        do {
            resp = await env.ocapi.get(`catalogs?start=${retrieved}&count=100`);
            if (resp.data.count) {
                catalogs = catalogs.concat(resp.data.data.map((s) => s.id));
                retrieved += resp.data.count;
            }
        } while (retrieved !== resp.data.total);
    } catch (e) {
        if (e.response && e.response.status === 403) {
            logger.warn('Cannot query catalogs (check DATA API permissions)');
        } else {
            throw e;
        }
    }
    try {
        let retrieved = 0;
        do {
            resp = await env.ocapi.get(`inventory_lists?start=${retrieved}&count=100`);
            if (resp.data.count) {
                inventoryLists = inventoryLists.concat(resp.data.data.map((s) => s.id));
                retrieved += resp.data.count;
            }
        } while (retrieved !== resp.data.total);
    } catch (e) {
        if (e.response && e.response.status === 403) {
            logger.warn('Cannot query inventories (check DATA API permissions)');
        } else {
            throw e;
        }
    }

    try {
        var instanceInfo = await getInstanceInfo(env)
        libraries = instanceInfo.libraries.filter(l => !l.isSiteLibrary).map(l => l.id)
    } catch (e) {
        logger.warn(`Cannot query libraries: ${e.message}`)
    }

    return {
        sites,
        inventoryLists,
        catalogs,
        libraries
    };
}

/**
 * Launch a web page to collect data units to export
 *
 * @param env {Environment}
 * @param collections {CollectionLists}
 * @return {Promise<object>}
 */
function getDataUnitsFromWeb(env, collections) {
    var {
        sites,
        inventoryLists,
        catalogs,
        libraries
    } = collections;
    return new Promise(function (resolve, _reject) {
        var sockets = [];
        var server = http.createServer(function (request, response) {
            if (request.method === 'GET') {
                // serve html page
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write(exportTemplate({
                    sites,
                    catalogs,
                    inventoryLists,
                    libraries,
                    env
                }));
                response.end();
            } else {
                // return access token
                var body = '';
                request.on('data', function (data) {
                    body += data;
                });
                request.on('end', function () {
                    var parsed = require('querystring')
                        .parse(body);
                    delete parsed.export;

                    var dataUnits = {};
                    Object.keys(parsed)
                        .forEach((dataUnit) => {
                            var parts = dataUnit.split('|');
                            var parent = parts[0];
                            var subunits = parts.slice(1);

                            if (!dataUnits[parent]) {
                                dataUnits[parent] = {};
                            }
                            var unitConfig = dataUnits[parent];
                            for (var i = 0; i < subunits.length; i++) {
                                var subunit = subunits[i];
                                if (i === subunits.length - 1) { // end of chain
                                    unitConfig[subunit] = true;
                                }
                                if (typeof unitConfig[subunit] === 'undefined') {
                                    unitConfig[subunit] = {};
                                }
                                unitConfig = unitConfig[subunit];
                            }
                        });
                    resolve(dataUnits);
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('You may close this browser window now and return to your terminal or Visual Studio Code...');
                    response.end();
                    setTimeout(function () {
                        logger.debug('Shutting down server');
                        server.close(() => logger.debug('Server shutdown'));
                        sockets.forEach((s) => {
                            if (s) {
                                s.destroy();
                            }
                        });
                    }, 2000);
                });
            }
        });
        server.on('connection', function (socket) {
            sockets.push(socket);
        });
        server.listen(4567, function () {
            var url = 'http://localhost:4567';
            logger.info('Export interface url: %s', url);
            logger.info('If the url does not open automatically, copy/paste the above url into a browser on this machine.');

            // attempt to open the machines default user agent
            open(url).then(() => {
            });
        });
    });
}

/**
 * Use the -d (dataunits) argument value to use data units to export
 *
 * @param dataUnitsParam {String}
 * @return {Promise<object>}
 */
function getDataUnitsFromArgument(dataUnitsParam) {
    try {
        return JSON.parse(dataUnitsParam);
    } catch (e) {
        logger.error('Data Units argument could not be parsed.');
        logger.error('Data Units argument that passed to the command below.');
        console.log(dataUnitsParam)
        throw e;
    }
}

async function exportSiteCommand(outputPath, dataUnitsParam) {
    logger.info(`Exporting to ${outputPath}`);

    var env = new Environment();
    var now = (new Date()).toISOString()
        .replace(/[:.-]+/g, '');
    var archiveDir = `${now}_export`;
    var zipFilename = `${archiveDir}.zip`;

    var dataUnits;
    if (dataUnitsParam) {
        dataUnits = await getDataUnitsFromArgument(dataUnitsParam)
    } else {
        logger.info('Querying sites, catalogs, libraries and inventory lists...');

        let collections = await getCollectionsFromInstance(env)
        dataUnits = await getDataUnitsFromWeb(env, collections);
    }

    if (dataUnits && dataUnits["cancel"]) {
        return;
    }

    logger.info('Exporting data units...');
    console.log(JSON.stringify(dataUnits, null, 2));

    const data = await siteArchiveExport(env, dataUnits, zipFilename);

    var zip = new AdmZip(data);

    logger.info('Extracting...');
    await zip.extractAllToAsync(outputPath, true);
    logger.info(`Saved to ${outputPath}/${archiveDir}`);
}

module.exports = {
    command: 'export',
    desc: 'exports data from b2c instances',
    builder: (yargs) => yargs
        .command('page <pageid..>', 'export pages by id with all components',
            (y) => y
                .option('library', {
                    describe: 'Library ID to Use',
                    required: true
                })
                .option('is-site-library', {
                    describe: 'library is a site ID (private)',
                    default: false
                })
                .boolean('is-site-library')
                .option('q', {
                    alias: 'asset-query',
                    describe: 'json paths for file extraction',
                    default: ['image.path'],
                    type: 'array'
                })
                .option('folder', {
                    describe: 'page folders to filter on',
                    default: [],
                    type: 'array'
                })
                .option('o', {
                    alias: 'output',
                    describe: 'Output path',
                    default: './tmp'
                })
                .option('r', {
                    alias: 'regex',
                    describe: 'Page IDs are regular expressions',
                    default: false
                })
                .boolean("r")
                .option('offline', {
                    describe: 'Offline mode (do not download assets)',
                    default: false
                })
                .option('library-file', {
                    describe: 'Library XML to use instead of exporting from instance'
                })
                .boolean("offline")
                .positional('pageid', {describe: 'page(s) to export', type: 'array', required: true})
                .group(['library', 'is-site-library', 'output', 'q', 'library-file', 'offline', 'folder'], 'Export Options:'),
            async (argv) => {
                var pageIds = argv.pageid;
                if (argv.r) {
                    pageIds = pageIds.map(p => new RegExp(p))
                }
                await exportPagesToFolder(pageIds, argv.library, argv.output, {
                    isSite: argv['is-site-library'],
                    assetQuery: argv.q,
                    offline: argv.offline,
                    libraryFile: argv['library-file'],
                    folders: argv.folder
                })
            }
        )
        .command('site', 'export a site import/export archive',
            (y) => y
                .option('o', {
                    alias: 'output',
                    describe: 'Output path',
                    default: './tmp'
                })
                .option('d', {
                    alias: 'dataunits',
                    describe: 'Data units'
                }),
            async (argv) => await exportSiteCommand(argv.output, argv.dataunits)
        )
        .demandCommand()
};
