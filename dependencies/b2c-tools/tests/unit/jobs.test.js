const path = require("path");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const Environment = require('../../lib/environment');
const {siteArchiveImport} = require("../../lib/jobs");
const util = require('../../lib/util');

jest.mock('../../lib/environment');
jest.mock('../../lib/util');

const MIGRATIONS_DIR = path.join(__dirname, "../fixtures/migrations");

let env;
let ocapiClient;
let webdavClient;
let mock;
let webdavMock;
beforeAll(() => {
    util.sleep.mockImplementation(() => {
        return new Promise(r => setTimeout(r, 1));
    })
})

beforeEach(() => {
    jest.clearAllMocks();
    ocapiClient = axios.create({
        baseURL: `https://example.com/`,
        timeout: 600000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    webdavClient = axios.create({
        baseURL: `https://example.com/`,
        timeout: 600000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    mock = new MockAdapter(ocapiClient);
    mock.onGet(/jobs\/[\w-]+\/executions\/\w+/).reply(200, {
        id: 1234,
        status: 'RUNNING',
        execution_status: 'finished'
    })
    mock.onPost(/jobs\/[\w-]+\/executions/).reply(200, {
        id: 1234,
        status: 'RUNNING',
    })
    webdavMock = new MockAdapter(webdavClient);
    webdavMock.onAny().reply(200);

    Environment.mockImplementation((opts) => {
        return Object.assign(opts, {
            ocapi: ocapiClient,
            webdav: webdavClient
        });
    });
    env = new Environment({
        'server': 'example.com',
        'clientID': '1234'
    });
});
test('dummy', () => {})

// test('siteArchiveImport imports a folder', async () => {
//     await siteArchiveImport(env, path.join(MIGRATIONS_DIR, '_METADATA'))
//     // put file
//     expect(webdavMock.history.put.length).toBe(1)
//     // start job
//     expect(mock.history.post.length).toBe(1)
//     // query job
//     expect(mock.history.get.length).toBe(1)
//     // delete file
//     expect(webdavMock.history.delete.length).toBe(1)
// })
//
// test('siteArchiveImport imports a folder and does not delete file', async () => {
//     await siteArchiveImport(env, path.join(MIGRATIONS_DIR, '_METADATA'), {
//         keepArchive: true
//     })
//     // delete file should NOT be called
//     expect(webdavMock.history.delete.length).toBe(0)
// })
//
// // TODO more coverage of jobs
