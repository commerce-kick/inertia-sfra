const MockAdapter = require('axios-mock-adapter');
const Environment = require('../../lib/environment');

/** @type MockAdapter */
let amMock;
/** @type MockAdapter */
let webdavMock;
/** @type MockAdapter */
let ocapiMock;
/** @type Environment */
let env;

// @@Credential-Scanning-Service-Mock@@ - this is a test mock
const MOCK_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJraWQiOiJEMWhPUDdEODN4TjBqZWlqaTI3WWFvZFRjL0E9IiwiYWxnIjoiUlMyNTYifQo. eyJzdWIiOiJmZmZmZmZmZi1hYWFhLWFhYWEtYWFhYS1mZmZmZmZmZmZmZmYiLCJjdHMiOiJPQVVUSDJfU1RBVEVMRVNTX0dSQU5UIiwiYXVkaXRUcmFja2luZ0lkIjoiNzExYjYxYmItYjYzNS00YjJkLWExZTItZjdlMTI0YWM4ZDIxLTEyNTk0Mzg3NiIsInN1Ym5hbWUiOiJmZmZmZmZmZi1hYWFhLWFhYWEtYWFhYS1mZmZmZmZmZmZmZmYiLCJpc3MiOiJodHRwczovL2FjY291bnQuZGVtYW5kd2FyZS5jb206NDQzL2R3c3NvL29hdXRoMiIsInRva2VuTmFtZSI6ImFjY2Vzc190b2tlbiIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJhdXRoR3JhbnRJZCI6ImZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZiIsImF1ZCI6ImZmZmZmZmZmLWFhYWEtYWFhYS1hYWFhLWZmZmZmZmZmZmZmZiIsIm5iZiI6MTcxMjY3Mjk4MSwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInNjb3BlIjpbInRlbmFudEZpbHRlciIsIm9wZW5JZCIsInByb2ZpbGUiLCJyb2xlcyJdLCJhdXRoX3RpbWUiOjE3MTI2NzI5ODEsInJlYWxtIjoiLyIsImV4cCI6MTcxMjY3NDc4MSwiaWF0IjoxNzEyNjcyOTgxLCJleHBpcmVzX2luIjoxODAwLCJqdGkiOiJmMVBlNmJ4ZU9Cc2VjYXhIWHVtLTNGN0VHZ00iLCJjbGllbnRfaWQiOiJmZmZmZmZmZi1hYWFhLWFhYWEtYWFhYS1mZmZmZmZmZmZmZmYiLCJ0ZW5hbnRGaWx0ZXIiOiJDQ0RYX1NCWF9VU0VSOmFiY2RfMTIzNDtTQUxFU0ZPUkNFX0NPTU1FUkNFX0FQSTphYmNkXzEyMzQiLCJyb2xlcyI6WyJTQUxFU0ZPUkNFX0NPTU1FUkNFX0FQSSIsIkNDRFhfU0JYX1VTRVIiXX0.NOSIG"

describe('environment construction', () => {
    it('should throw an exception on missing client ID', async () => {
        var env = new Environment({
            server: 'example.com'
        });

        await expect(async () => {
            await env.webdav.get('test');
        }).rejects.toThrow("client ID")
    });
})

describe('client credentials authentication', () => {
    beforeEach(() => {
        env = new Environment({
            server: 'example.com',
            clientID: '12345',
            clientSecret: 'abc123'
        });

        amMock = new MockAdapter(env.am);
        webdavMock = new MockAdapter(env.webdav);
        webdavMock.onGet('test').reply(200, "testing");
    })


    it('should request a client credentials grant', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply((config) => {
                expect(config.auth.username).toEqual("12345");
                return [200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 300}]
            });

        await expect(async () => {
            return await env.webdav.get('test');
        }).resolves
    })

    it('throw an exception on invalid auth', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply(401, {error: 'test'})

        await expect(async () => {
            return await env.webdav.get('test');
        }).rejects.toThrow("401")
    })

    it('should reuse a cached token', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply(200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 300})

        await env.webdav.get('test');
        await env.webdav.get('test');

        expect(amMock.history.post.length).toBe(1);
        expect(webdavMock.history.get.length).toBe(2);
    })

    it('request a new token on expiration', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply(200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 1})

        await env.webdav.get('test');
        await new Promise((r) => setTimeout(r, 1100));
        await env.webdav.get('test');

        expect(amMock.history.post.length).toBe(2);
        expect(webdavMock.history.get.length).toBe(2);
    })

    it('should request a new token on scope changes', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token"
            )
            .reply(200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 100000})

        await env.webdav.get('test');
        env.scopes = ['test'];
        await env.webdav.get('test');

        expect(amMock.history.post.length).toBe(2);
        expect(webdavMock.history.get.length).toBe(2);
    })

    afterEach(() => {
        // this is needed due to shared state omong environment instances
        env.deauthenticate();
        amMock.reset();
        webdavMock.reset();
    })
})


const http = require('http');
const open = require('open');
jest.mock('http')
jest.mock('open', () => {
    return jest.fn(() => {});
})

var _response = {
    writeHead: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
};
describe('implicit flow authentication', () => {
    let env;
    beforeEach(() => {
        env = new Environment({
            server: "example.com",
            clientID: '12345'
        })
        webdavMock = new MockAdapter(env.webdav);
        webdavMock.onGet('test').reply(200, "testing");
    })

    test('uses local server when no secret available', async () => {
        var _listen = jest.fn();
        http.createServer.mockImplementation((cb) => {
            cb({ url: '/'}, _response);
            cb({ url: '/?access_token=testing&expires_in=300'}, _response);
            return {listen: _listen, on: jest.fn(), close: jest.fn()};
        })
        await env.webdav.get('test');
        expect(http.createServer).toBeCalled();
        // opens the users web browser
        expect(open).toHaveBeenCalledWith(expect.stringContaining("account.demandware.com"))
        expect(open).toHaveBeenCalledWith(expect.stringContaining("12345"))
        // initial response and then refresh with access token in query string
        expect(_response.end).toHaveBeenCalledTimes(2);
        expect(_listen).toBeCalled();
    })

    test('auth error should reject', async () => {
        var _listen = jest.fn();
        http.createServer.mockImplementation((cb) => {
            cb({ url: '/'}, _response);
            cb({ url: '/?error=TEST_ERROR'}, _response);
            return {listen: _listen, on: jest.fn(), close: jest.fn()};
        })

        await expect(async () => {
            await env.webdav.get('test');
        }).rejects.toEqual(expect.stringContaining("TEST_ERROR"));
    })
    afterEach(() => {
        env.deauthenticate();
        jest.resetAllMocks();
        webdavMock.reset();
    })
});

describe('user and token decoding', () => {
    beforeEach(() => {
        env = new Environment({
            server: 'example.com',
            clientID: '12345',
            clientSecret: 'abc123'
        });

        amMock = new MockAdapter(env.am);
    })

    it('should decode the JWT contents', async () => {
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply((config) => {
                expect(config.auth.username).toEqual("12345");
                return [200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 300}]
            });

        // this will authenticate if not already
        const jwt = await env.getJWT();
        expect(jwt.payload.sub).toEqual("ffffffff-aaaa-aaaa-aaaa-ffffffffffff");
    })

    it('should decode the JWT contents for implicit flow', async () => {
        env = new Environment({
            server: 'example.com',
            clientID: '12345',
        });
        var _listen = jest.fn();
        http.createServer.mockImplementation((cb) => {
            cb({ url: '/'}, _response);
            cb({ url: `/?access_token=${MOCK_ACCESS_TOKEN}&expires_in=300`}, _response);
            return {listen: _listen, on: jest.fn(), close: jest.fn()};
        })
        // this will authenticate if not already
        const jwt = await env.getJWT();
        expect(jwt.payload.sub).toEqual("ffffffff-aaaa-aaaa-aaaa-ffffffffffff");
    })
    afterEach(() => {
        // this is needed due to shared state omong environment instances
        env.deauthenticate();
        amMock.reset();
    })
})

describe("webdav client", () => {
    beforeEach(() => {
        env = new Environment({
            server: 'example.com',
            username: 'a@b.com',
            password: 'abc123'
        });

        amMock = new MockAdapter(env.am);
        webdavMock = new MockAdapter(env.webdav);
        webdavMock.onGet('test').reply(200, "testing");
    })

    test('should support password auth', async () => {
        await env.webdav.get('test');
        expect(webdavMock.history.get.length).toBe(1);
        expect(amMock.history.post.length).toBe(0);
    })

    afterEach(() => {
        env.deauthenticate();
        webdavMock.reset();
    })
})

describe("ocapi client", () => {
    beforeEach(() => {
        env = new Environment({
            server: 'example.com',
            clientID: '12345',
            clientSecret: 'abc123'
        });
        amMock = new MockAdapter(env.am);
        amMock
            .onPost(
                "dwsso/oauth2/access_token",
                "grant_type=client_credentials"
            )
            .reply(200, {access_token: MOCK_ACCESS_TOKEN, expires_in: 300});
        ocapiMock = new MockAdapter(env.ocapi);
        ocapiMock.onGet('test').reply(200, {"test":"testing"});
    })

    test('should include client ID in headers', async () => {

        ocapiMock.onGet('test').reply((config) => {
            expect(config.headers["x-dw-client-id"]).toEqual("12345");
            return [200, {"test":"testing"}];
        });
        await env.ocapi.get('test');
        await env.ocapi.get('test');

        expect(amMock.history.post.length).toBe(1);
        expect(ocapiMock.history.get.length).toBe(2);
    })

    test('should require client ID auth', async () => {
        env = new Environment({
            server: 'example.com',
            username: 'a@b.com',
            password: 'abc123'
        });
        ocapiMock = new MockAdapter(env.ocapi);
        ocapiMock.onGet('test').reply(200, {"test":"testing"});

        await expect(async () => {
            await env.ocapi.get('test');
        }).rejects.toThrow("client ID")
    })

    afterEach(() => {
        env.deauthenticate();
        ocapiMock.reset();
    })
})
