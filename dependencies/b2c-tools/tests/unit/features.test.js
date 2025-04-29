const path = require("path");

const Environment = require('../../lib/environment');
const {syncCartridges} = require('../../lib/code')
const {siteArchiveImport, siteArchiveImportText, siteArchiveExportText} = require('../../lib/jobs');
const setupFixture = require('../fixtures/features/exampleFeature/migrations/setup')
const nullScriptMigration = require('../fixtures/migrations/null_script_migration')
const {B2C_TOOLKIT_DATA_VERSION} = require("../../lib/migrations");
const {B2C_TOOLS_FEATURES_VERSION, deployFeature} = require("../../lib/features");

const FEATURES_DIR = path.join(__dirname, "../fixtures/features");

jest.mock('../../lib/environment');
jest.mock('../../lib/jobs');
jest.mock('../fixtures/features/exampleFeature/migrations/setup');
jest.mock('../../lib/code', () => ({
    ...jest.requireActual('../../lib/code'),
    syncCartridges: jest.fn(async () => {
    })
}));

let env;
beforeAll(() => {
    siteArchiveExportText.mockImplementation(async () => {
        return new Map([
            ["ocapi-settings/wapi_shop_config.json", ""],
            ["ocapi-settings/wapi_data_config.json", JSON.stringify({
                clients: [
                    {
                        client_id: "1234",
                        resources: []
                    }
                ]
            })]
        ])
    })
    siteArchiveImport.mockImplementation(() => {
    });
});
beforeEach(() => {
    jest.clearAllMocks();
    Environment.mockImplementation((opts) => {
        return Object.assign(opts, {
            ocapi: {
                get: jest.fn(async (url) => {
                    return {
                        data: {
                            c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
                            c_b2cToolkitMigrations: "",
                            c_b2cToolsBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLKIT_DATA_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }',
                            c_b2cToolsFeaturesVersion: B2C_TOOLS_FEATURES_VERSION,
                            c_b2cToolsFeaturesBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLS_FEATURES_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }',
                        }
                    }
                }),
                post: jest.fn(async () => {
                    return {
                        data: {
                            count: 0
                        }
                    }
                }),
                patch: jest.fn(async () => {
                    return {}
                })
            },
        });
    });
    env = new Environment({
        'server': 'example.com',
        'clientID': '1234',
        codeVersion: 'version1'
    });
});

test('should bootstrap features when missing preferences', async () => {
    var getCalls = 0;
    var postCalls = 0;
    // mock environment such that initial calls return an un-bootstrapped client id
    Environment.mockImplementation((opts) => {
        return Object.assign(opts, {
            ocapi: {
                get: jest.fn(async (url) => {
                    getCalls++;
                    if (url === 'global_preferences/preference_groups/b2cToolkit/development' && getCalls >= 2) {
                        return {
                            data: {
                                c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
                                c_b2cToolkitMigrations: "",
                                c_b2cToolsBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLKIT_DATA_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }',
                                c_b2cToolsFeaturesVersion: B2C_TOOLS_FEATURES_VERSION,
                                c_b2cToolsFeaturesBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLS_FEATURES_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }',
                            }
                        }
                    } else {
                        return {
                            data: {
                                c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
                                c_b2cToolkitMigrations: "",
                                c_b2cToolsBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLKIT_DATA_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }'
                            }
                        }
                    }
                }),
                post: jest.fn(async () => {
                    postCalls++;
                    if (postCalls >= 2) {
                        return {
                            data: {
                                count: 0
                            }
                        }
                    } else {
                        throw {
                            response: {
                                status: 404
                            }
                        }
                    }
                }),
                patch: jest.fn(async () => {
                    return {}
                })
            },
        });
    });
    env = new Environment({
        'server': 'example.com',
        'clientID': '1234',
        codeVersion: 'version1'
    });
    await deployFeature(env, 'Example Feature', {
        featuresDir: FEATURES_DIR, vars: {
            question: 'foo',
            secret: 'bar'
        }
    })
    // import preferences but no migrations (dry-run)
    expect(siteArchiveImportText).toHaveBeenCalledTimes(2);
})

test('should bootstrap if clientID is not recorded', async () => {
    env = new Environment({
        'server': 'example.com',
        'clientID': '9876',
        codeVersion: 'version1'
    });
    await deployFeature(env, 'Example Feature', {
        featuresDir: FEATURES_DIR, vars: {
            question: 'foo',
            secret: 'bar'
        }
    })
    // both features and migrations will bootstrap here - so called twice
    expect(siteArchiveImportText).toHaveBeenCalledTimes(3);
})
