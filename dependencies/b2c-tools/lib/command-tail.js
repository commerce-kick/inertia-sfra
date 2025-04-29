const xml2js = require("xml2js");

const Environment = require("./environment");
const util = require("./util");
const logger = require("./logger");
const {findCartridges} = require("./code-helpers");

/**
 * @typedef {Object} LogFile
 * @property {string} name
 * @property {Date} lastModified
 */

/**
 * Get the logs from the instance
 *
 * @param env {Environment}
 * @return {Promise<LogFile[]>}
 */
async function getLogs(env) {
    var resp = await env.webdav({
        url: "Logs/",
        method: "PROPFIND",
    });
    var xml = await xml2js.parseStringPromise(resp.data);

    return xml.multistatus.response
        .map((_resp) => {
            let prop = _resp.propstat[0].prop[0];
            let name = prop.displayname[0];
            // getlastmodified: Array(1) [Sat, 04 Dec 2021 02:32:05 GMT]
            let _lastModified = prop.getlastmodified[0];
            if (prop.resourcetype[0].collection) {
                // is dir
                return;
            }
            let lastModified = new Date(Date.parse(_lastModified));
            return {
                name,
                lastModified,
            };
        })
        .filter((_file) => !!_file);
}

/**
 * Normalizes log entries by replacing all cartridge file paths
 * with their local paths.
 * @param logEntries {string[]}
 * @param cartridges {import("./code-helpers").CartridgeMapping[]}
 * @returns {void}
 */
function normalizePaths(logEntries, cartridges) {
    for (let i = 0; i < logEntries.length; i++) {
        if (!logEntries[i]) {
            continue;
        }
        for (let cartridge of cartridges) {
            let re = new RegExp(
                `\\(${cartridge.name}/([^\\)]+\\))`,
                "g",
            );
            let relativePath = cartridge.src.replace(process.cwd(), "");
            relativePath = relativePath.replace(/^\//, "");
            try {
                logEntries[i] = logEntries[i].replace(
                    re,
                    `(${relativePath}/$1`,
                );
            } catch (e) {
                logger.error(e);
                console.log(logEntries[i]);
            }
        }
    }
}

/**
 *
 * @param filters {string[]}
 * @param task {boolean} normalize file paths for tasks.json
 * @return {Promise<void>}
 */
async function tailCommand(filters, task = false) {
    /* @type Environment */
    var env = new Environment();

    var contentPositions = {};
    var cartridges = [];
    if (task) {
        cartridges = findCartridges();
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        var logs = await getLogs(env);
        for (const filter of filters) {
            var targetLogs = logs.filter(
                (l) => l.name.substring(0, filter.length) === filter,
            );
            if (!targetLogs || !targetLogs.length) {
                continue;
            }
            targetLogs.sort(
                (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
            );
            var targetLog = targetLogs.pop();

            // TODO: this probably doesn't support multi-byte utf-8 chars; fix to calculate actual byte offset
            var currentPosition = contentPositions[targetLog.name];
            if (currentPosition) {
                try {
                    var resp = await env.webdav.get(`Logs/${targetLog.name}`, {
                        headers: {
                            range: `bytes=${currentPosition}-`,
                        },
                    });
                } catch (e) {
                    if (e.response.status === 416) {
                        continue;
                    } else {
                        throw e;
                    }
                }
                // TODO better regexp split
                var logEntries = resp.data.split(/(?<=^)\[/m).filter(
                    (entry) => entry !== "",
                );
                contentPositions[targetLog.name] =
                    resp.data.length + currentPosition;
            } else {
                // initial request
                resp = await env.webdav.get(`Logs/${targetLog.name}`);
                // get only the last log entry
                logEntries = [resp.data.split(/(?<=^)\[/m).filter((entry) => entry !== "").pop()];
                contentPositions[targetLog.name] = resp.data.length;
            }

            if (task) {
                normalizePaths(logEntries, cartridges);
            }

            if (resp.data.length) {
                console.log("-".repeat(targetLog.name.length + 6));
                logger.info(targetLog.name);
                console.log("-".repeat(targetLog.name.length + 6));
                // kindy hacky
                console.log(logEntries.map((e) => "[" + e).join(""));
                console.log("");
            }
        }
        await util.sleep(3000);
    }
}

module.exports = {
    command: "tail",
    desc: "watch instance logs",
    builder: (yargs) =>
        yargs.option("f", {
            alias: "filter",
            default: ["error-", "customerror-"],
            describe: "log prefixes to watch",
            type: "array",
        }).option("task", {
            describe: "normalize file paths",
            type: "boolean",
            default: false,
        }).group(["f", "task"], "Tail"),
    handler: async (argv) => await tailCommand(argv.filter, argv.task),
};
