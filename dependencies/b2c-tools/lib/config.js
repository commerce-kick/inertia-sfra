/*
 * Configuration store for options pattern
 */

const yargs = require("yargs");
const fs = require("fs");
const os = require("os");
const logger = require("./logger");
const winston = require("winston");
const path = require("path");
const {runMigrationScript} = require("./migrations");
const Environment = require("./environment");
const CONFIG = require("./global-config");
const {getIntellijSFCCConnectionSettings, decryptCredentials} = require("./intellij");

const homeDirectory = os.homedir();

function untildify(pathWithTilde) {
    return homeDirectory ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory) : pathWithTilde;
}

function setupLogging(logLevel = 'info', color = true) {
    logger.clear()
        .add(new winston.transports.Console({
            level: logLevel,
            silent: logLevel === 'none',
            format: color ? winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.simple()
            ) : winston.format.combine(
                winston.format.splat(),
                winston.format.simple()
            )

        }));
}

// intellij really not liking this builder pattern here
// noinspection
exports.cli = yargs
    .env("SFCC")
    .option('debug', {
        alias: 'D',
        describe: 'output debug logging (also to debug.log)',
        type: 'boolean',
        default: false
    })
    .option('log-level', {
        describe: 'log at a specific level',
        type: 'string',
        default: 'info',
        choices: ['none', 'debug', 'info', 'warn', 'error']
    })
    .option('color', {
        describe: 'color output',
        type: 'boolean',
        default: !!process.stdout.isTTY && process.env.FORCE_COLOR !== '0'
    })
    .option('i', {
        alias: 'instance',
        describe: 'instance name in config file',
    })
    .option('verify', {
        describe: 'verify SSL',
        type: 'boolean',
        default: true
    })
    .option('s', {
        alias: 'server',
        describe: 'b2c instance hostname'
    })
    .option('short-code', {
        describe: 'SCAPI short code'
    })
    .option('secure-server', {
        describe: 'b2c instance hostname (webdav write access)'
    })
    .option('certificate', {
        describe: 'path to pkcs12 certificate for 2FA'
    })
    .option('passphrase', {
        describe: 'passphrase for certificate option'
    })
    .option('u', {
        alias: 'username',
        describe: 'webdav username',
    })
    .option('p', {
        alias: 'password',
        describe: 'password/webdav access key',
        type: 'string'
    })
    .option('client-id', {
        alias: 'oauth-client-id',
        describe: 'API client ID'
    })
    .string('client-id')
    .option('client-secret', {
        alias: 'oauth-client-secret',
        describe: 'API client secret'
    })
    .string('client-secret')
    .option('oauth-scopes', {
        describe: 'OAuth scope list',
        type: 'array'
    })
    .option('mrt-api-key', {
        alias: 'managed-runtime-api-key',
        describe: 'MRT API Key'
    })
    .string('mrt-api-key')
    .option('mrt-credentials-file', {
        describe: 'MRT Credentials file',
        default: '~/.mobify'
    })
    .string('mrt-credentials-file')
    .option('code-version', {
        describe: 'b2c code version',
    })
    .string('code-version')
    .option('cartridge', {
        describe: 'cartridges (Default: autodetect)',
        alias: 'include-cartridges',
        type: 'array'
    })
    .option('exclude-cartridges', {
        describe: 'ignore these cartridges',
        type: 'array'
    })
    .option('use-intellij-connections', {
        describe: 'use intellij sfcc plugin connections from project',
        type: 'boolean',
        default: false
    })
    .option('intellij-project-file', {
        describe: 'path to intellij sfcc connections setting source file ',
        default: './.idea/misc.xml'
    })
    .option('intellij-credentials-file', {
        describe: 'path to intellij sfcc plugin encrypted credentials file'
    })
    .option('intellij-credentials-key', {
        describe: 'key for intellij sfcc plugin encrypted credentials file'
    })
    .option('config', {
        describe: 'path to dw.json config',
        default: 'dw.json'
    })
    .option('vars', {
        describe: 'arbitrary variables for scripts (see extra-vars)',
    })
    .option('vars-json', {
        describe: 'arbitrary variables for scripts; merged with vars; json string',
    })
    .option('vars-file', {
        describe: 'load arbitrary variables from json files (merged with vars)',
    })
    .middleware(function (argv, _yargs) {
        if (argv["vars-file"]) {
            var varsContents = JSON.parse(fs.readFileSync(argv["vars-file"], 'utf-8'));
            // vars from file should not override vars from cli/env
            argv["vars"] = Object.assign({}, varsContents, argv["vars"]);
        }
        if (argv["vars-json"]) {
            var varsJson = JSON.parse(argv["vars-json"]);
            // vars from json should not override vars from cli/env
            argv["vars"] = Object.assign({}, varsJson, argv["vars"]);
        }
    })
    .group(['i', 's', 'u', 'p', 'client-id', 'client-secret', 'code-version', 'verify', 'secure-server', 'certificate', 'passphrase', 'cartridge', 'exclude-cartridges', 'short-code'], "B2C Connection:")
    .group(['mrt-api-key', 'mrt-credentials-file'], 'Managed Runtime')
    .group(['use-intellij-connections', 'intellij-project-file', 'intellij-credentials-file', 'intellij-credentials-key'], 'IntellijSFCC Plugin')
    // Load default configs from "b2c-tools" key in package.json (if present)
    .pkgConf("b2c-tools")
    .middleware(function (argv, _yargs) {
        var logLevel = argv.debug ? 'debug' : 'info';
        var color = argv.color;
        if (argv.logLevel && !argv.debug) {
            // debug switch should override log level as it came first
            logLevel = argv.logLevel;
        }
        setupLogging(logLevel, color);
    })
    // load from intellij sfcc plugin sources if requested
    .middleware(function (argv, _yargs) {
        var connectionsSource = argv['intellij-project-file']
        var hasConnectionsSource = fs.existsSync(connectionsSource);
        if (argv['use-intellij-connections'] && hasConnectionsSource) {
            logger.debug(`Loading from intellij project ${connectionsSource}`)
            var connectionSettings = getIntellijSFCCConnectionSettings(connectionsSource)
            if (!connectionSettings) {
                logger.warn("Can't find intellij project file")
                return;
            }

            if (connectionSettings && !argv.server) {
                var dwJson = connectionSettings?.source.flatMap(source => {
                    return source.isGroup && source.configs ? source.configs : source;
                }).find(source => {
                    if (argv.instance) {
                        return source.name === argv.instance;
                    } else {
                        return source.active;
                    }
                });
                if (argv.instance && !dwJson) {
                    logger.warn(`Cannot find ${argv.instance} in ${connectionsSource}`);
                    return;
                } else if (dwJson) {
                    argv.server = argv.s = dwJson.hostname;
                    argv.username = argv.u = dwJson.username;

                    // code version should always use configuration priority
                    argv["code-version"] = argv["code-version"] ? argv["code-version"] : (dwJson["code-version"] ? dwJson["code-version"] : undefined);

                    if (dwJson.useOcapi && dwJson["clientId"]) { // don't set if empty string
                        argv["client-id"] = argv["oauth-client-id"] = dwJson["clientId"];
                    }
                    if (dwJson["name"] && !argv.instance) {
                        argv.instance = argv.i = dwJson["name"];
                    }

                    if (dwJson["secureHostname"] && !argv["secure-server"]) {
                        argv["secure-server"] = dwJson["secureHostname"];
                    }
                }
            }
        }

    })
    // load from a dw.json (or specific config in same format) and fallback defaults
    .middleware(function (argv, yargs) {
        var hasDwJson = fs.existsSync(argv.config);
        var hasDwJs = fs.existsSync('./dw.js');
        var dwJson;

        // if a './dw.js' module is found require it and use the object it exports as the config source
        // this is also used by prophet debugger so we can shim in multi-config support to that tool per-project
        // if an instance or custom config is provided assume we want to read directly from config file
        if (hasDwJs && !argv.instance && yargs.parsed.defaulted.config === true) {
            logger.debug(`Loading configuration from dw.js`);
            dwJson = require(path.resolve(process.cwd(), 'dw.js'));
        } else if (hasDwJson) {
            logger.debug(`Loading configuration from ${argv.config}`);
            try {
                dwJson = JSON.parse(fs.readFileSync(argv.config, 'utf-8'));
            } catch (e) {
                logger.warn(`Cannot parse config: ${e.message}`)
            }
        }

        // only assume dw.json usage if not explicitly provided a server via higher priority configuration
        // or have an instance already specified
        // to avoid merging incompatible configuration assumptions
        if (dwJson && (!argv.server || argv.instance)) {
            // Support (older) jetbrains plugin style multi-config: https://smokeelow.visualstudio.com/Intellij%20SFCC/_wiki/wikis/intellij-sfcc.wiki/25/dw.json?anchor=multiple-connections
            // note: the plugin changed away from using dw.json but we still support the same form here
            if (Array.isArray(dwJson.configs)) {
                if (argv.instance) {
                    if (dwJson.name === argv.instance) {
                        var _config = dwJson;
                    } else {
                        _config = dwJson.configs.find((v) => v.name === argv.instance);
                    }
                    if (!_config) {
                        if (!argv.server) {
                            // if not instance found and no server has been resolved warn here
                            logger.warn(`Cannot find ${argv.instance} in ${argv.config}`);
                        }
                        return; // no config to resolve
                    }
                } else if (dwJson.active === false) { // default config is inactive; find active one
                    _config = dwJson.configs.find((v) => v.active === true);
                }
                if (_config) {
                    dwJson = _config;
                }
            }

            if (!argv.instance || argv.instance === dwJson.name) {
                if (!argv.server) {
                    argv.server = argv.s = dwJson.hostname;
                }
                if (!argv.username) {
                    argv.username = argv.u = dwJson.username;
                }
                if (!argv.password) {
                    argv.password = argv.p = dwJson.password;
                }

                // code version should always use configuration priority
                if (!argv["code-version"]) {
                    argv["code-version"] = dwJson["code-version"]
                }

                if (!argv['client-id']) { // don't set if empty string
                    argv["client-id"] = argv["oauth-client-id"] = dwJson["client-id"];
                }
                if (!argv['client-secret']) {
                    argv["client-secret"] = argv["oauth-client-secret"] = dwJson["client-secret"];
                }
                if (dwJson["name"] && !argv.instance) {
                    argv.instance = argv.i = dwJson["name"];
                }
                // if self-signed is set and we have not explicitly asked to (no)verify then don't
                if (dwJson["self-signed"] === true && yargs.parsed.defaulted.verify === true) {
                    argv.verify = false;
                }

                if (dwJson["certificatePath"] && !argv.certificate) {
                    argv.certificate = dwJson["certificatePath"];
                }
                if (dwJson["certificatePassphrase"] && !argv.passphrase) {
                    argv.passphrase = dwJson["certificatePassphrase"];
                }
                if (dwJson["secureHostname"] && !argv["secure-server"]) {
                    argv["secure-server"] = dwJson["secureHostname"];
                }

                if (dwJson.cartridge && Array.isArray(dwJson.cartridge) && !argv["cartridge"]) {
                    argv["cartridge"] = dwJson.cartridge;
                }

                if (dwJson["shortCode"] && !argv["short-code"]) {
                    argv["short-code"] = dwJson["shortCode"];
                } else if (dwJson["short-code"] && !argv["short-code"]) {
                    argv["short-code"] = dwJson["short-code"];
                }

                if (Array.isArray(dwJson["oauth-scopes"]) && !argv["oauth-scopes"]) {
                    argv["oauth-scopes"] = dwJson["oauth-scopes"]
                }

                // load vars
                if (typeof dwJson.vars === "object") {
                    argv["vars"] = Object.assign({}, argv["vars"], dwJson.vars);
                }
            }
        }

        // finally allow providing of defaultClientId if we do not have one at this stage
        // (i.e. project-level from package.json)
        if (!argv["client-id"] && argv.defaultClientId) {
            argv["client-id"] = argv.defaultClientId;
        }
    })
    .middleware(function (argv, _yargs) {
        var credentialsFile = argv['intellij-credentials-file']
        if (!credentialsFile) {
            return;
        }
        var credentialsKey = argv['intellij-credentials-key']
        var hasCredentialsFile = fs.existsSync(credentialsFile);
        // if missing password at this stage and intellij credentials is configured
        // attempt to decrypt and load; in this way the credentials file can be used
        // to back an intellij plugin connections source or any other (dw.json, cli, etc)
        if (hasCredentialsFile && credentialsKey) {
            try {
                var ciphertext = (fs.readFileSync(credentialsFile)).toString()
                var decryptedCredentials = JSON.parse(decryptCredentials(ciphertext, credentialsKey))

                if (argv.server && argv.username && !argv.password) {
                    var account = decryptedCredentials.accounts?.find(a => a.username === argv.username)
                    if (!account) {
                        logger.debug(`Cannot find account ${argv.username} in credentials file ${credentialsFile}`)
                    } else {
                        var accountAccessKeys = account.accessKeys?.find(a => a.username === argv.username)?.keys
                        if (accountAccessKeys) {
                            var webdavAccessKey = Object.entries(accountAccessKeys).find(([key, _value]) => key === argv.server)?.[1].WebDAV
                            argv.password = webdavAccessKey;
                        }

                        if (!argv.password) {
                            // use account password if no acccess key
                            logger.debug(`No WebDAV access key found for ${argv.username}; falling back to account password`)
                            argv.password = account.password
                        }
                    }
                }

                var clientId = argv['client-id']
                if (clientId) {
                    var ocapiKey = decryptedCredentials.ocapiKeys?.find(o => o.clientId === clientId)
                    if (ocapiKey) {
                        argv["client-secret"] = argv["oauth-client-secret"] = ocapiKey.clientSecret
                    }
                }

            } catch (e) {
                logger.warn(`Cannot read from credentials file: ${e.message}`)
                return
            }
        }

    })
    // load MRT key
    .middleware(function (argv, _yargs) {
        var credentialsFilename = argv['mrt-credentials-file']
        credentialsFilename = untildify(credentialsFilename);
        var hasCredentialsFile = fs.existsSync(credentialsFilename);
        if (!argv.managedRuntimeApiKey && hasCredentialsFile) {
            try {
                logger.debug(`Loading MRT credentials from ${credentialsFilename}`)
                var credentials = JSON.parse(fs.readFileSync(credentialsFilename, 'utf-8'));
                argv.managedRuntimeApiKey = credentials.api_key;
            } catch (e) {
                logger.warn(`Cannot read from MRT credentials file: ${e.message}`)
            }
        }
    })
    .middleware(function (argv, _yargs) {
        // set b2c connection info to global config store
        CONFIG.ENVIRONMENT = Object.assign(CONFIG.ENVIRONMENT, {
            server: argv.server,
            secureServer: argv["secure-server"],
            username: argv.username,
            password: argv.password,
            clientID: argv['client-id'],
            clientSecret: argv['client-secret'],
            codeVersion: argv['code-version'],
            verify: argv.verify,
            certificate: argv.certificate,
            passphrase: argv.passphrase,
            cartridges: argv.cartridge,
            shortCode: argv["short-code"],
            scopes: argv["oauth-scopes"],
            managedRuntimeApiKey: argv.managedRuntimeApiKey
        });

        if (argv["migrations-dir"]) {
            CONFIG.MIGRATIONS_DIR = argv["migrations-dir"];
        }
        if (argv["features-dir"]) {
            CONFIG.FEATURES_DIR = argv["features-dir"];
        }
    })

/**
 * Run's the current nodejs main module (i.e. entry point) as a migration
 * @returns {Promise<void>}
 */
async function runAsScript() {
    require('dotenv').config({override: true})

    exports.cli
        .epilogue('For more information, read our manual at https://github.com/SalesforceCommerceCloud/b2c-tools')
        .fail(function (msg, err, yargs) {
            if (err) {
                logger.error(err.message);
                logger.debug(err.stack);
            } else {
                console.error(yargs.help());
                console.error();
                console.error(msg);
            }
            process.exit(1);
        })
        .demandCommand()
        .strictCommands()
        .help()
        .command('$0', 'default command', () => {
        }, async (argv) => {
            const env = new Environment();
            await runMigrationScript(env, require.main.filename, {
                vars: argv.vars
            })
        })
        .parse()
}

exports.runAsScript = runAsScript;

/**
 * Parse the environment headlessly (i.e. not via CLI directly) to
 * return the parsed configuration
 *
 * @param {string|string[]} argv arguments in lieu of command line
 * @return {yargs.Arguments}
 */
function parseConfig(argv = "") {
    require('dotenv').config({override: true})

    return exports.cli
        .epilogue('For more information, read our manual at https://github.com/SalesforceCommerceCloud/b2c-tools')
        .fail(function (msg, err, yargs) {
            if (err) {
                logger.error(err.message);
                logger.debug(err.stack);
            } else {
                console.error(yargs.help());
                console.error();
                console.error(msg);
            }
            process.exit(1);
        })
        .demandCommand()
        .strictCommands()
        .help()
        .command('$0', 'default command', () => {
        }, () => {
        })
        // @ts-ignore
        .parseSync(argv)
}

exports.parseConfig = parseConfig;

