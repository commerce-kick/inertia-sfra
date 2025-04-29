const Environment = require("../../lib/environment");
const {codeDeploy} = require("../../lib/code");

const path = require("path");

const deployScriptImpl = require("../../examples/b2c-deploy");
const CARTRIDGES_DIR = path.join(__dirname, "../../examples/cartridges");
const DEPLOY_SCRIPT = path.resolve(path.join(__dirname, "../../examples/b2c-deploy.js"));

jest.mock('../../lib/environment');
jest.mock('../../examples/b2c-deploy');

jest.useFakeTimers()

beforeEach(() => {
    jest.clearAllMocks();
    Environment.mockImplementation((opts) => {
        return Object.assign(opts, {
            ocapi: {
                get: jest.fn(async () => {
                    return {
                        data: {
                            data: [{
                                id: 'version1',
                                active: false,
                                cartridges: ['a', 'b', 'c']
                            }, {
                                id: 'version2',
                                active: true,
                                cartridges: ['a', 'b', 'c']
                            }]
                        }
                    }
                }),
                put: jest.fn(async () => {
                    return {}
                }),
                patch: jest.fn(async () => {
                    return {}
                })
            },
            webdav: {
                put: jest.fn(async () => {
                    return {}
                }),
                post: jest.fn(async () => {
                    return {}
                }),
                delete: jest.fn(async () => {
                    return {}
                }),
                request: jest.fn(async () => {
                    return {}
                })
            }
        });
    });
    deployScriptImpl.beforeDeploy.mockImplementation((_args, e) => {
        return
    })
    deployScriptImpl.afterDeploy.mockImplementation((_args, e) => {
        return
    })
})

let env;
describe(('code deploy'), () => {
    beforeEach(() => {
        env = new Environment({
            'server': 'example.com',
            'clientID': '1234',
            'codeVersion': 'version1'
        });
    })
    test('deploys code via OCAPI and webdav', async () => {
        // expect to not throw
        let _codeDeploy = async () => {
            await codeDeploy(env, [], [], {
                cartridgeSearchDir: CARTRIDGES_DIR,
                executeDeployScript: false
            });
        }
        await expect(_codeDeploy()).resolves.not.toThrow();

        // does not reload code version
        expect(env.ocapi.patch).toHaveBeenCalledTimes(0);

        // uploads cartridges
        expect(env.webdav.put).toHaveBeenCalledTimes(1);
        // unzips
        expect(env.webdav.post).toHaveBeenCalledTimes(1);
        // removes zip file
        expect(env.webdav.delete).toHaveBeenCalledTimes(1);
    })

    test('loads/reloads code version', async () => {
        var env = new Environment({
            server: 'example.com',
            clientID: '1234',
            codeVersion: 'version2'
        });
        let _codeDeploy = async () => {
            await codeDeploy(env, [], [], {
                cartridgeSearchDir: CARTRIDGES_DIR,
                executeDeployScript: false,
                reload: true
            });
        }
        await expect(_codeDeploy()).resolves.not.toThrow();
        // reload code version
        expect(env.ocapi.patch).toHaveBeenCalledTimes(2);
    })

    test('executes deploy script lifecycle', async () => {
        let _codeDeploy = async () => {
            await codeDeploy(env, [], [], {
                cartridgeSearchDir: CARTRIDGES_DIR,
                executeDeployScript: true,
                deployScript: DEPLOY_SCRIPT,
                reload: true
            });
        }
        await expect(_codeDeploy()).resolves.not.toThrow();
        expect(deployScriptImpl.beforeDeploy).toHaveBeenCalledTimes(1);
        expect(deployScriptImpl.afterDeploy).toHaveBeenCalledTimes(1);
    })

    test('does not sync cartridges if beforeDeploy throws', async () => {
        deployScriptImpl.beforeDeploy.mockImplementation(() => {
            throw new Error("STOP THE DEPLOY");
        })
        let _codeDeploy = async () => {
            await codeDeploy(env, [], [], {
                cartridgeSearchDir: CARTRIDGES_DIR,
                executeDeployScript: true,
                deployScript: DEPLOY_SCRIPT,
                reload: true
            });
        }
        await expect(_codeDeploy()).rejects.toThrow();
        expect(deployScriptImpl.beforeDeploy).toHaveBeenCalledTimes(1);
        expect(deployScriptImpl.afterDeploy).toHaveBeenCalledTimes(0);
    })
})
