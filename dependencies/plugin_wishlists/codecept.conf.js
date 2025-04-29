const debug = require('debug')('acceptance:config');
let merge = require('deepmerge');
let codeceptjsShared = require('codeceptjs-shared');
let codeceptJsSauce = require('codeceptjs-saucelabs');
const cwd = process.cwd();
const path = require('path');
const fs = require('fs');

const metadata = require('./test/acceptance/metadata.json');

const RELATIVE_PATH = './test/acceptance';
const OUTPUT_PATH = RELATIVE_PATH + '/report';

function getDwJson() {
    if (fs.existsSync(path.join(cwd, 'dw.json'))) {
        return require(path.join(cwd, 'dw.json'));
    }
    return {};
}

const SAUCE_USER = getDwJson().sauce_username || process.env.SAUCE_USERNAME;
const SAUCE_KEY = getDwJson().sauce_key || process.env.SAUCE_KEY;

const DEFAULT_HOST = 'https://' + getDwJson().hostname;
const HOST = DEFAULT_HOST || process.env.HOST;

// Here is where you can target specific browsers/configuration to run on sauce labs.
const userSpecificBrowsers = {
    phone: {
        browser: 'chrome',
        desiredCapabilities: {
            chromeOptions: {
                mobileEmulation: {
                    deviceName: "iPhone X"
                }
            }
        }
    },
    tablet: {
        browser: 'chrome',
        desiredCapabilities: {
            chromeOptions: {
              mobileEmulation: {
                deviceName: "iPad"
              }
            }
          }
    }
}

let conf = {
    output: OUTPUT_PATH,
    cleanup: true,
    coloredLogs: true,
    helpers: {
        REST: {},
        WebDriver: {
            url: HOST,
            waitForTimeout: 10000
        }
    },
    plugins: {
        wdio: {
            enabled: true,
            services: []
        },
        retryFailedStep: {
            enabled: true,
            retries: 3
        },
        allure: {
            enabled: true,
            require: '@codeceptjs/allure-legacy',
        }        
    },
    include: metadata.include,
    gherkin: {
        features: RELATIVE_PATH + '/features/**/*.feature',
        steps: metadata.gherkin_steps
    },
    name: 'plugin_wishlists'
};

exports.config = merge(merge(conf, codeceptjsShared.config.master), codeceptJsSauce.config.saucelabs(SAUCE_USER, SAUCE_KEY, userSpecificBrowsers));
