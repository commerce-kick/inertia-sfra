const logger = require('./logger');
const inquirer = require('inquirer');
const questions = require('./questions');
const fs = require('fs');
const open = require('open');
const {getInstanceInfo} = require("./info");
const Environment = require("./environment");
const {
    convertDWJsonToIntellij,
    decryptCredentials,
    encryptCredentials,
    getIntellijSFCCConnectionSettings
} = require("./intellij");
const fsPromise = require('fs').promises;

/**
 *
 * @param {string} hostname
 */
function configNameFromHostname(hostname) {
    return hostname.split('.')
        .shift();
}

async function setupDwjson(configFile, defaultClientID) {
    logger.info('Please answer the following questions.');
    var answers = await inquirer.prompt([
        questions.SERVER, questions.USERNAME, questions.PASSWORD, questions.CODE_VERSION,
        questions.CLIENT_ID(defaultClientID), questions.CLIENT_SECRET(defaultClientID)], {});

    if (fs.existsSync(configFile)) {
        var configName = configNameFromHostname(answers.server);
        logger.warn(`A dw.json file already exists. Add an additional config named ${configName}?`);
        var confirmAnswers = await inquirer.prompt([questions.CONFIRM]);
        if (!confirmAnswers.confirm) {
            return;
        }

        var newDwJson = JSON.parse(fs.readFileSync(configFile)
            .toString());

        newDwJson.configs = newDwJson.configs || [];

        if (newDwJson.name === configName || newDwJson.configs.find((c) => c.name === configName)) {
            throw new Error(`A configuration named ${configName} already exists`);
        }

        let instance = {
            name: configName,
            hostname: answers.server,
            username: answers.username,
            password: answers.password,
            'code-version': answers.codeVersion,
            active: false
        };
        if (answers.clientID && answers.clientID !== defaultClientID) {
            instance['client-id'] = answers.clientID;
        }
        if (answers.clientSecret) {
            instance['client-secret'] = answers.clientSecret;
        }
        newDwJson.configs.push(instance)
        logger.info('You can set this configuration as the default with `instance set`');
    } else {
        newDwJson = {
            name: configNameFromHostname(answers.server),
            hostname: answers.server,
            username: answers.username,
            password: answers.password,
            'code-version': answers.codeVersion,
            active: true
        };
        if (answers.clientID && answers.clientID !== defaultClientID) {
            newDwJson['client-id'] = answers.clientID;
        }
        if (answers.clientSecret) {
            newDwJson['client-secret'] = answers.clientSecret;
        }
    }

    await fsPromise.writeFile(configFile, JSON.stringify(newDwJson, null, 2));
    logger.info('Sucessfully Wrote new dw.json file...');
}

async function setActiveDwjson(instance, configFile) {
    if (fs.existsSync(configFile)) {
        var newDwJson = JSON.parse(fs.readFileSync(configFile)
            .toString());
        if (!newDwJson.configs) {
            logger.warn('No alternate configs found; Run dw.json setup to add additional');
        }
        var answers = await inquirer.prompt([questions.DW_JSON_CONFIG_NAME(configFile)], {
            configName: instance
        });
        var activeServer = newDwJson.hostname;
        if ((newDwJson.name === answers.configName) || (!newDwJson.name && answers.configName === 'Default')) {
            newDwJson.active = true;
        }
        for (var i = 0; i < newDwJson.configs.length; i++) {
            let _c = newDwJson.configs[i];
            if (_c.name === answers.configName) {
                _c.active = true;
                activeServer = _c.hostname;
                newDwJson.active = false;
            } else {
                _c.active = false;
            }
        }
        logger.info(`Setting ${activeServer} as default config for all commands`);
        await fsPromise.writeFile(configFile, JSON.stringify(newDwJson, null, 2));
    } else {
        logger.warn('No dw.json found...exiting');
    }
}

const QUERY_CHOICES = ['all', 'sites', 'libraries', 'codeVersions', 'global', 'preferences']
module.exports = {
    command: 'instance',
    desc: 'project/environment management commands',
    builder: (yargs) => yargs
        .command('setup', 'create or add to dwjson',
            async (y) => y,
            async (argv) => {
                // TODO support intellij
                await setupDwjson(argv.config, argv.defaultClientId);
            }
        )
        .command('set [name]', 'set active instance',
            async (y) => y.positional('name', {
                describe: 'name to set active'
            }),
            async (argv) => {
                // TODO support intellij
                await setActiveDwjson(argv.name, argv.config)
            }
        )
        .command('debug', 'debugging cli environment',
            async (y) => y,
            async (argv) => {
                console.log(JSON.stringify(argv, null, 2));
            }
        )
        .command('info', 'gather information from instance',
            async (y) => y
                .option('query', {
                    describe: 'info to query',
                    choices: QUERY_CHOICES,
                    default: ['all'],
                })
                .array("query")
                .option('custom-preferences', {
                    describe: 'custom preference(s) to query'
                })
                .array("custom-preferences")
                .option('suppress', {
                    describe: 'suppress logging output',
                    default: true
                })
                .boolean('suppress')
                .group(['query', 'custom-preferences', 'suppress'], "Info Query"),
            async (argv) => {
                var env = new Environment();
                // supress logging output during run unless debug
                if (argv.suppress) {
                    logger.silent = true;
                }
                var query = argv.query.includes('all') ? QUERY_CHOICES : argv.query;
                var options = query.reduce((obj, cur) => {
                    obj[cur] = true;
                    return obj;
                }, {})
                console.log(JSON.stringify(await getInstanceInfo(env, {
                    ...options,
                    customPreferences: argv["custom-preferences"]
                }), null, 2));
                if (argv.suppress) {
                    logger.silent = false;
                }
            }
        )
        .command('open', 'open business manager',
            async (yargs) => yargs,
            async (argv) => {
                if (!argv.server) {
                    throw new Error("No server specified or configured");
                }
                var url = `https://${argv.server}/on/demandware.store/Sites-Site`;
                logger.info(`Opening ${url}`);
                open(url);
            }
        )
        .command('list', 'list instances',
            async (y) => y,
            async (argv) => {
                var names = []
                if (argv['use-intellij-connections']) {
                    var connectionsSource = argv['intellij-project-file']
                    var hasConnectionsSource = fs.existsSync(connectionsSource);
                    if (hasConnectionsSource) {
                        var connectionSettings = getIntellijSFCCConnectionSettings(connectionsSource)
                        if (!connectionSettings) {
                            logger.warn("Can't find intellij project file")
                            return;
                        }

                        names = names.concat(connectionSettings?.source.flatMap(source => {
                            return source.isGroup && source.configs ? source.configs : source;
                        }).map(source => source.name))
                    }
                }

                if (fs.existsSync(argv.config)) {
                    var dwJson = JSON.parse(fs.readFileSync(argv.config)
                        .toString());
                    if (dwJson.configs) {
                        dwJson.configs.forEach(c => {
                            if (!names.includes(c.name)) {
                                names.push(c.name)
                            }
                        })
                    }
                    if (dwJson.name && !names.includes(dwJson.name)) {
                        names.unshift(dwJson.name);
                    }
                }
                console.log(names.join('\n'));
            }
        )
        .command('intellij', 'intellijSFCC plugin credential helpers',
            async (y) => y
                // TODO add and set different credential types
                .command('get', 'get a password/secret',
                    async (_y) => _y,
                    async (_argv) => {
                        console.log("TODO")
                    })
                .command('set', 'add/set password/secret',
                    async (_y) => _y,
                    async (_argv) => {
                        console.log("TODO")
                    })
                .command('decrypt', 'decrypt credentials file',
                    async (_y) => _y,
                    async (argv) => {
                        if (!argv["intellij-credentials-key"] || !argv["intellij-credentials-file"]) {
                            throw new Error("Must specify an intellij-credentials-key and intellij-credentials-file")
                        }
                        let contents = (await fs.promises.readFile(argv['intellij-credentials-file'])).toString()
                        console.log(decryptCredentials(contents, argv['intellij-credentials-key']))
                    })
                .command('encrypt <file>', 'encrypt json to credentials file format',
                    async (_y) => _y
                        .positional('file', {
                            describe: 'input file to encrypt',
                            type: "string",
                            required: true
                        })
                        .coerce('file', function (arg) {
                            if (arg === '') {
                                arg = 0
                            }
                            return (fs.readFileSync(arg, 'utf8')).toString()
                        }),
                    async (argv) => {
                        if (!argv["intellij-credentials-key"] || !argv["intellij-credentials-file"]) {
                            throw new Error("Must specify an intellij-credentials-key and intellij-credentials-file")
                        }
                        var cipherText = encryptCredentials(argv.file, argv["intellij-credentials-key"])
                        logger.info(`Writing ${argv["intellij-credentials-file"]}...`)
                        await fs.promises.writeFile(argv["intellij-credentials-file"], cipherText)
                    })
                .command('convert', 'convert dw.json to new configuration',
                    async (_y) => _y,
                    async (argv) => {
                        if (!argv["intellij-credentials-key"] || !argv["intellij-credentials-file"]) {
                            throw new Error("Must specify an intellij-credentials-key and intellij-credentials-file")
                        }
                        var dwJson = JSON.parse(fs.readFileSync(argv.config, 'utf-8'))
                        await convertDWJsonToIntellij(dwJson, argv["intellij-credentials-file"], argv["intellij-credentials-key"], argv['intellij-project-file'])
                    })
                .demandCommand(),
            async () => {
            }
        )
        .demandCommand()
};
