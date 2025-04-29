const path = require("path");

const Environment = require('../../lib/environment');
const {siteArchiveImport, siteArchiveImportText, siteArchiveExportText} = require('../../lib/jobs');
const setupFixture = require('../fixtures/migrations/setup')
const nullScriptMigration = require('../fixtures/migrations/null_script_migration')
const {B2C_TOOLKIT_DATA_VERSION, migrateInstance, runMigrationScript} = require('../../lib/migrations');

const MIGRATIONS_DIR = path.join(__dirname, "../fixtures/migrations");

jest.mock('../../lib/environment');
jest.mock('../../lib/jobs');
jest.mock('../fixtures/migrations/setup');
jest.mock('../fixtures/migrations/null_script_migration');

let env;
beforeAll(() => {
    nullScriptMigration.mockImplementation(() => {
    })
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
});
beforeEach(() => {
    jest.clearAllMocks();
    setupFixture.onFailure.mockImplementation((_args, e) => {
        throw e
    })
    Environment.mockImplementation((opts) => {
        return Object.assign(opts, {
            ocapi: {
                get: jest.fn(async () => {
                    return {
                        data: {
                            c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
                            c_b2cToolkitMigrations: "",
                            c_b2cToolsBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLKIT_DATA_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }'
                        }
                    }
                }),
                patch: jest.fn(async () => {
                    return {}
                })
            },
        });
    });
    siteArchiveImport.mockImplementation(() => {
    });
    env = new Environment({
        'server': 'example.com',
        'clientID': '1234'
    });
});

test('should import impex directories', async () => {
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true})
    // 3 directory migrations
    expect(siteArchiveImport).toHaveBeenCalledTimes(3);
    expect(nullScriptMigration).toHaveBeenCalledTimes(1);
    expect(env.ocapi.patch).toHaveBeenCalledTimes(4);
})

test('should not write preferences if not applying', async () => {
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: false})
    expect(env.ocapi.patch).toHaveBeenCalledTimes(0);
})

test('should not import on dry run', async () => {
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true, dryRun: true})
    expect(siteArchiveImport).toHaveBeenCalledTimes(0);
})

test('lifecycle methods', async () => {
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true})

    // init always called
    expect(setupFixture.init).toHaveBeenCalledTimes(1);

    // no bootstrap under normal run
    expect(setupFixture.onBootstrap).toHaveBeenCalledTimes(0);
    // no failures under normal run
    expect(setupFixture.onBootstrap).toHaveBeenCalledTimes(0);

    expect(setupFixture.beforeAll).toHaveBeenCalledTimes(1);
    expect(setupFixture.afterAll).toHaveBeenCalledTimes(1);

    // all migrations should have before/after each
    expect(setupFixture.beforeEach).toHaveBeenCalledTimes(4);
    expect(setupFixture.afterEach).toHaveBeenCalledTimes(4);
})

test('vars provided to migraton scripts on migrate', async () => {
    setupFixture.init.mockImplementation(({vars}) => {
        vars.test = "foo";
    })
    nullScriptMigration.mockImplementation(({vars}) => {
        if (vars.test !== "foo") throw new Error()
    })

    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true})
})

test('should bootstrap when missing preferences', async () => {
    var getCalls = 0;
    Environment.mockImplementation(() => {
        return {
            clientID: '1234',
            ocapi: {
                get: jest.fn(async (url) => {
                    getCalls++;
                    // return correct response after bootstrap
                    if (url === 'global_preferences/preference_groups/b2cToolkit/development' && getCalls >= 2) {
                        return {
                            data: {
                                c_b2cToolkitDataVersion: B2C_TOOLKIT_DATA_VERSION,
                                c_b2cToolkitMigrations: "",
                                c_b2cToolsBootstrappedClientIDs: '{ "1234": { "version": ' + B2C_TOOLKIT_DATA_VERSION + ', "_myCustomVersion": 6, "_exampleFeatureCustomThing": 5 } }'
                            }
                        }
                    } else {
                        throw {
                            response: {status: 404}
                        }
                    }
                }),
                patch: jest.fn(async () => {
                    return {}
                })
            },
        };
    });
    env = new Environment({
        'server': 'example.com',
        'clientID': '1234'
    });
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true, dryRun: true})
    // import preferences but no migrations (dry-run)
    expect(siteArchiveImportText).toHaveBeenCalledTimes(1);
    expect(setupFixture.onBootstrap).toHaveBeenCalledTimes(1);
})

test('should call onFailure on failed import and continue if no exception', async () => {
    siteArchiveImport.mockImplementation(() => {
        throw "Testing"
    });
    setupFixture.onFailure.mockImplementation(() => {
        return true;
    })
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true})
    expect(siteArchiveImport).toHaveBeenCalledTimes(3);
    expect(setupFixture.onFailure).toHaveBeenCalledTimes(3);
})

test('should call onFailure on failed import and reject', async () => {
    siteArchiveImport.mockImplementation(() => {
        throw "Error"
    });
    setupFixture.onFailure.mockImplementation(() => {
        throw "Error2"
    })
    await expect(async () => {
        await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true})
    }).rejects
})

test('should skip migration on beforeEach returning false', async () => {
    setupFixture.beforeEach.mockImplementation(() => {
        return false;
    })
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true});
    expect(setupFixture.beforeEach).toHaveBeenCalledTimes(4);
    expect(siteArchiveImport).toHaveBeenCalledTimes(0);
})

test('should bootstrap if clientID is not recorded', async () => {
    env = new Environment({
        'server': 'example.com',
        'clientID': '9876'
    });
    await migrateInstance(env, MIGRATIONS_DIR, {exclude: ['^ignore.*', "^_.*"], apply: true, dryRun: true});
    expect(setupFixture.onBootstrap).toHaveBeenCalledTimes(1);
})
