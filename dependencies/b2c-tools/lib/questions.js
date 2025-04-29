/*
 * Shared questions for interactive queries
 */

function required(msg) {
    return (v) => {
        if (!v || v.length === 0) {
            return msg;
        }
        return true;
    };
}

module.exports = {
    SERVER: {
        name: 'server',
        message: 'What is your sandbox hostname/URL?',
        filter: (v) => v.replace('https://', '')
            .split('/')[0],
        validate: required('Please specify your sandbox server name')
    },
    CODE_VERSION: {
        name: 'codeVersion',
        message: 'What is your code version ID (this will be created if it does not exist)?',
        validate: required('Please specify a code version')
    },
    USERNAME: {
        name: 'username',
        message: 'What is your username (example@salesforce.com)?',
        validate: required('Please specify your account manager username')
    },
    PASSWORD: {
        name: 'password',
        message: function (answers) {
            if (answers.server) {
                return `What is your WebDAV Access Key. Open https://${answers.server}/on/demandware.store/Sites-Site/default/ViewAccessKeys-List to create?`
            }
            return 'What is your WebDAV Access Key?'
        },
        validate: required('Please specify an access key')
    },
    CONFIRM: {
        name: 'confirm',
        message: 'Are you sure?',
        type: 'confirm',
        default: false
    },
    CONFIRM_YES: {
        name: 'confirm',
        message: 'Are you sure?',
        type: 'confirm',
        default: true
    },
    CLIENT_ID: function (defaultClientID) {
        return {
            name: 'clientID',
            message: 'Client ID for Data API (enter for default)?',
            default: defaultClientID
        }
    },
    CLIENT_SECRET: function (defaultClientID) {
        return {
            name: 'clientSecret',
            message: 'Client Secret for Data API?',
            default: '',
            when: (answers) => answers.clientID && answers.clientID !== defaultClientID
        }
    },
    DW_JSON_CONFIG_NAME: function (configFile) {
        return {
            name: 'configName',
            message: 'Select your instance?',
            type: 'list',
            choices: function () {
                const fs = require('fs');
                var configs = [{name: "Default", value: "Default", short: "Default"}];
                if (fs.existsSync(configFile)) {
                    var dwJson = JSON.parse(fs.readFileSync(configFile).toString());
                    if (dwJson.name) {
                        configs[0] = {
                            name: dwJson.active ? dwJson.name + ' (active)' : dwJson.name,
                            value: dwJson.name,
                            short: dwJson.name
                        };
                    }
                    if (Array.isArray(dwJson.configs)) {
                        configs = configs.concat(dwJson.configs.map((c) => ({
                            name: c.active ? c.name + ' (active)' : c.name,
                            value: c.name,
                            short: c.name
                        })));
                    }
                }
                return configs;
            },
            validate: required('Please specify a valid name')
        }
    }
};
