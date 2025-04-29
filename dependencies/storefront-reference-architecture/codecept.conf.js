const { setHeadlessWhen } = require('@codeceptjs/configure');
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

const DEFAULT_HOST = 'https://' + getDwJson().hostname;

const HOST = DEFAULT_HOST || process.env.HOST;

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

const browser = process.env.profile || 'chrome';
const windowSize = process.env.windowSize || '1440x1200'
let conf = {
  cleanup: true,
  coloredLogs: true,
  output: OUTPUT_PATH,
  helpers: {
    WebDriver: {
      url: HOST,
      waitForTimeout: 10000,
      browser: browser,
      windowSize: windowSize,
    }
  },
  include: metadata.include,
  gherkin: {
    features: RELATIVE_PATH + '/features/**/*.feature',
    steps: metadata.gherkin_steps
  },
  name: 'storefront-reference-architecture',
  plugins: {
    wdio: {
        enabled: true,
        services: ['selenium-standalone']
    },
    retryFailedStep: {
      enabled: true,
      retries: 3
    },
    screenshotOnFail: {
      enabled: true
    }
  }
}

exports.config = conf
