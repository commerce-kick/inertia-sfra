/*
 * Represents an SFCC Environment and HTTP Clients for Communication
 * with webdav, OCAPI, SCAPI, ODS API and account manager. Authentication via access keys or AM tokens.
 */

const axios = require('axios');
const open = require('open');
const http = require('http');
const _url = require('url');

const CONFIG = require('./global-config');
const logger = require('./logger');
const https = require("https");
const fs = require("fs");
// @ts-ignore
const pkg = require('../package.json');
const {redactSensitiveData} = require("./util/redact");

// same as SFCC-CI
const OAUTH_LOCAL_PORT = process.env.SFCC_OAUTH_LOCAL_PORT ? parseInt(process.env.SFCC_OAUTH_LOCAL_PORT) : 8080;
const OAUTH_REDIRECT_URL = 'http://localhost:' + OAUTH_LOCAL_PORT; // changing the uri requires to update the client_id settings in AM
const ACCOUNT_MANAGER_HOST = process.env.SFCC_LOGIN_URL ? process.env.SFCC_LOGIN_URL : 'account.demandware.com';
const SANDBOX_API_HOST = process.env.SFCC_SANDBOX_API_HOST ? process.env.SFCC_SANDBOX_API_HOST : 'admin.dx.commercecloud.salesforce.com';
// if set to true, will not redact authorization headers; not a published configuration for security reasons; useful for debugging
const DO_NOT_REDACT = process.env.SFCC_DO_NOT_REDACT ? process.env.SFCC_DO_NOT_REDACT : 'false';
const MOBIFY_BASE = process.env.MOBIFY_BASE || process.env.CLOUD_API_BASE || 'cloud.mobify.com';

const USER_AGENT = `b2c-tools/${pkg.version}`;

function getOauth2RedirectHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Return Flow</title>
</head>
<body onload="doReturnFlow()">
<script>
    function doReturnFlow() {
        document.location = "http://localhost:8080/?" + window.location.hash.substring(1);
    }
</script>

</body>
</html>
    `;
}

// TODO: this is hacky to support multiple instances
const ACCESS_TOKEN_CACHE = {};

/**
 * Is this object a stream?
 * @param stream
 * @returns {boolean}
 */
function isStream(stream) {
    return stream !== null
        && typeof stream === 'object'
        && typeof stream.pipe === 'function';
}

/**
 * Logs axios requests
 *
 * @param {axios.AxiosRequestConfig} config
 * @return {*}
 * @private
 */
function loggingRequestInterceptor(config) {
    var now = new Date()
    var requestUrl = (config.baseURL ? config.baseURL : '') + config.url;

    var headers = Object.entries(config.headers)
        .filter(([_key, value]) => typeof value != "object")
        // change the authorization to redact information after the 16th character (post bearer, basic, etc)
        .map(([key, value]) => {
            if (key.toLowerCase() === "authorization" && typeof value === "string" && DO_NOT_REDACT !== "true") {
                return [key, value.substring(0, 16) + "...REDACTED"]
            } else {
                return [key, value]
            }
        })
        .map(([key, value]) => `${key.toString()}: ${value}`)

    if (config.auth) {
        headers.push(`Authorization: Basic ${Buffer.from(`${config.auth.username}:REDACTED`).toString('base64')}`)
    }
    let body = `${config.method.toUpperCase()} ${requestUrl}${headers.length ? '\n' : ''}${headers.join('\n')}`;
    if (isStream(config.data)) {
        body += `\n\n<BINARY DATA (stream)>`
    } else if (Buffer.isBuffer(config.data)) {
        body += `\n\n<BINARY DATA ${Buffer.byteLength(config.data)} bytes>`
    } else if (typeof config.data === "object") {
        body += `\n\n${JSON.stringify(config.data, null, 2)}`
    } else if (typeof config.data !== "undefined") {
        body += `\n\n${config.data}`
    }

    logger.debug(`[HTTP REQUEST] <${now.toISOString()}>` + `\n${body}`);
    return config;
}

/**
 *
 * @param {axios.AxiosResponse} response
 * @param {axios.AxiosError} err
 * @return {Promise<never>|*}
 * @private
 */
function loggingResponseInterceptor(response, err) {
    var now = new Date()

    if (err && !err.response) {
        return Promise.reject(err);
    }

    var resp = response ? response : err.response;

    var headers = [];
    if (resp.headers) {
        headers = Object.entries(resp.headers)
            .filter(([_key, value]) => typeof value != "object")
            .map(([key, value]) => `${key}: ${value}`)
    }
    let body = `${resp.status.toString()} ${resp.statusText}\n${headers.join('\n')}`;
    if (Buffer.isBuffer(resp.data)) {
        body += `\n\n<BINARY DATA ${Buffer.byteLength(resp.data)} bytes>`
    } else if (typeof resp.data === "object") {
        let data = {}
        try {
            data = DO_NOT_REDACT === 'true' ? resp.data : redactSensitiveData(resp.data);
        } catch (e) {
            /* ignore */
        }
        body += `\n\n${JSON.stringify(data, null, 2)}`
    } else if (typeof resp.data !== "undefined") {
        body += `\n\n${resp.data}`
    }
    logger.debug(`[HTTP Response] <${now.toISOString()}>` + `\n${body}`);

    if (err) {
        return Promise.reject(err);
    } else {
        return response;
    }
}


/**
 * @typedef {Object} EnvironmentOpts
 * @property {string} [server]
 * @property {string} [secureServer] hostname used for WebDAV access
 * @property {string} [username]
 * @property {string} [password]
 * @property {string} [clientID]
 * @property {string} [clientSecret]
 * @property {string} [codeVersion]
 * @property {string} [shortCode]
 * @property {boolean} [verify] verify SSL
 * @property {string | Buffer} [certificate] pfx path
 * @property {string} [passphrase] passphrase for pfx above
 * @property {string[]} [scopes] authz scopes
 */

/**
 * Provides for authentication and WebDAV/API access
 *
 * `server` and `secureServer` represent ECOM (b2c) instances but an Environment can be used
 * in non-ECOM contexts (SCAPI, ODS, etc)
 *
 * @example
 * const {Environment} = require('@SalesforceCommerceCloud/b2c-tools');
 * const env = new Environment({
 *     server: '...',
 *     clientID: '...',
 *     clientSecret: '...'
 * });
 * const resp = await env.ocapi.get('sites');
 *
 */
class Environment {
    // declare these as fields for the types build
    /**
     * @type {string}
     */
    server;
    /**
     * @type {string}
     */
    secureServer;
    /**
     * @type {string}
     */
    username;
    /**
     * @type {string}
     */
    password;
    /**
     * @type {string}
     */
    clientID;
    /**
     * @type {string}
     */
    clientSecret;
    /**
     * @type {string}
     */
    codeVersion;
    /**
     * @type {string}
     */
    shortCode;
    /**
     * @type {boolean}
     */
    verify;
    /**
     * @type {string|Buffer}
     */
    certificate;
    /**
     * @type {string}
     */
    passphrase;
    /**
     * @type {string[]}
     */
    scopes;
    /**
     * @type {string}
     */
    managedRuntimeApiKey;

    /**
     * @param {EnvironmentOpts} opts
     */
    constructor(opts = {}) {
        // if not provided explicitly will be loaded via the various means (dw.json, etc.)
        // stored in global conf store (./global-config.js)
        Object.assign(this, CONFIG.ENVIRONMENT, opts);

        /**
         * @public
         */
        this.scopes = [];

        /**
         * @private
         */
        this._webdavClient = null;
        /**
         * @private
         */
        this._ocapiClient = null;
        /**
         * @private
         */
        this._amClient = null;
        /**
         * @private
         */
        this._odsClient = null;
        /**
         * @private
         */
        this._scapiClient = null;
        /**
         * @private
         */
        this._mrtClient = null;

        let agentOptions = {
            rejectUnauthorized: this.verify !== false,
        }
        if (this.certificate) {
            agentOptions.pfx = typeof this.certificate == 'string' ? fs.readFileSync(this.certificate) : this.certificate;
            if (this.passphrase) {
                agentOptions.passphrase = this.passphrase;
            }
        }
        this._httpsAgent = new https.Agent(agentOptions);
        if (!this.server && !this.clientID) {
            throw new Error("No server or clientID found; Have you configured your dw.json file?");
        }
        return this;
    }

    /**
     * account manager (account.demandware.net) scoped Axios instance
     *
     * @type {axios.AxiosInstance}
     */
    get am() {
        if (this._amClient) {
            return this._amClient;
        }
        // @ts-ignore
        this._amClient = axios.create({
            baseURL: `https://${ACCOUNT_MANAGER_HOST}/`,
            timeout: 8000,
            auth: {
                username: this.clientID,
                password: this.clientSecret
            },
            headers: {
                'user-agent': USER_AGENT
            }
        })
        this._amClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._amClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._amClient;
    }

    /**
     * OCAPI scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get ocapi() {
        if (this._ocapiClient) {
            return this._ocapiClient;
        }
        // @ts-ignore
        this._ocapiClient = axios.create({
            baseURL: `https://${this.server}/s/-/dw/data/v21_10/`,
            timeout: 120000, // 2 minute
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this._httpsAgent,
            headers: {
                'user-agent': USER_AGENT
            }
        });
        this._ocapiClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._ocapiClient.interceptors.request.use((config) => this._requestInterceptor(config, true), (err) => Promise.reject(err))
        this._ocapiClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._ocapiClient;
    }

    /**
     * ODS scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get ods() {
        if (this._odsClient) {
            return this._odsClient;
        }
        // @ts-ignore
        this._odsClient = axios.create({
            baseURL: `https://${SANDBOX_API_HOST}/api/v1/`,
            timeout: 60000, // 1 minute
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this._httpsAgent,
            headers: {
                'user-agent': USER_AGENT
            }
        });
        this._odsClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._odsClient.interceptors.request.use((config) => this._requestInterceptor(config, true), (err) => Promise.reject(err))
        this._odsClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._odsClient;
    }

    /**
     * SCAPI scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get scapi() {
        if (this._scapiClient) {
            return this._scapiClient;
        }
        if (!this.shortCode) {
            throw new Error("SCAPI clients require a shortCode configured")
        }

        // @ts-ignore
        this._scapiClient = axios.create({
            baseURL: `https://${this.shortCode}.api.commercecloud.salesforce.com/`,
            timeout: 60000, // 1 minute
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this._httpsAgent,
            headers: {
                'user-agent': USER_AGENT
            }
        });
        this._scapiClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._scapiClient.interceptors.request.use((config) => this._requestInterceptor(config, true), (err) => Promise.reject(err))
        this._scapiClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._scapiClient;
    }

    /**
     * Managed Runtime scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get mrt() {
        if (this._mrtClient) {
            return this._mrtClient;
        }

        if (!this.managedRuntimeApiKey) {
            throw new Error("No managed runtime API key found; Set managedRuntimeApiKey");
        }

        // @ts-ignore
        this._mrtClient = axios.create({
            baseURL: `https://${MOBIFY_BASE}/`,
            timeout: 60000, // 1 minute
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this._httpsAgent,
            headers: {
                'user-agent': USER_AGENT,
                'authorization': `Bearer ${this.managedRuntimeApiKey}`
            }
        });
        this._mrtClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._mrtClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._mrtClient;
    }

    /**
     * WebDAV scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get webdav() {
        if (this._webdavClient) {
            return this._webdavClient;
        }
        // @ts-ignore
        this._webdavClient = axios.create({
            baseURL: `https://${this.secureServer ? this.secureServer : this.server}/on/demandware.servlet/webdav/Sites/`,
            timeout: 600000, // 10 minutes
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this._httpsAgent,
            headers: {
                'user-agent': USER_AGENT
            }
        });
        this._webdavClient.interceptors.request.use(loggingRequestInterceptor, (err) => Promise.reject(err))
        this._webdavClient.interceptors.request.use(this._requestInterceptor.bind(this), (err) => Promise.reject(err))
        this._webdavClient.interceptors.response.use(loggingResponseInterceptor, (err) => loggingResponseInterceptor(null, err))
        return this._webdavClient;
    }

    /**
     * Request interceptor provides authentication services and lazily loads
     * configuration through the credentials loading options
     *
     * @param {axios.AxiosRequestConfig} config
     * @param {boolean} requireAccessToken
     * @return {Promise<axios.AxiosRequestConfig>}
     * @private
     */
    async _requestInterceptor(config, requireAccessToken = false) {

        // for webdav we can use access key if available; faster and no expiration
        if (this.username && this.password && !requireAccessToken) {
            config.auth = {
                username: this.username,
                password: this.password
            };
        } else {
            if (!this.clientID) {
                throw new Error("No client ID available; Cannot get access token");
            }
            config.headers['x-dw-client-id'] = this.clientID;
            var accessToken = await this._getAccessToken()
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    }

    /**
     * Performs an implicit oauth2 login flow
     * User will flow through AM login procedure to obtain access token
     *
     * NOTE: this method requires a TTY and user intervention; it is interactive
     * NOTE: access token is valid for 30 minutes and cannot be renewed
     *
     * @return {Promise<AccessTokenResponse>}
     * @private
     */
    async _implicitFlowLogin() {
        var queryStr = new URLSearchParams({
            client_id: this.clientID,
            redirect_uri: OAUTH_REDIRECT_URL,
            response_type: "token"
        })
        const This = this;

        if (this.scopes && this.scopes.length > 0) {
            queryStr.append("scope", this.scopes.join(' '))
        }
        var url = `https://${ACCOUNT_MANAGER_HOST}/dwsso/oauth2/authorize?${queryStr.toString()}`;

        // print url to console (in case machine has no default user agent)
        logger.info('Login url: %s', url);
        logger.info('If the url does not open automatically, copy/paste the login url into a browser on this machine.');

        // attempt to open the machines default user agent
        open(url);

        return new Promise(function (resolve, reject) {

            var sockets = [];
            var server = http.createServer(function (request, response) {
                var parsed = _url.parse(request.url, true)

                if (!parsed.query['access_token'] && !parsed.query['error']) {
                    // serve html page
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(getOauth2RedirectHTML());
                    response.end();
                } else if (parsed.query['access_token']) {
                    // return access token
                    logger.debug('Got access token response ' + parsed.query['access_token']);
                    logger.info('Successfully authenticated');
                    try {
                        const jwt = This._decodeJWT(parsed.query.access_token.toString());
                        logger.debug('JWT\n' + JSON.stringify(jwt.payload, null, 2));
                    } catch (e) {
                        logger.debug("Error decoding JWT", e);
                    }
                    var now = new Date();
                    var expiration = new Date(now.getTime() + parseInt(typeof parsed.query["expires_in"] === "string" ? parsed.query["expires_in"] : "0") * 1000);
                    var scopes = parsed.query['scope']?.toString().split(' ') ?? []
                    resolve({
                        accessToken: parsed.query['access_token'].toString(),
                        expires: expiration,
                        scopes
                    })
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('You may close this browser window now and return to your terminal or Visual Studio Code...');
                    response.end();
                    setTimeout(function () {
                        logger.debug("Shutting down server")
                        server.close(() => logger.debug("Server shutdown"));
                        sockets.forEach((s) => {
                            if (s) {
                                s.destroy();
                            }
                        });
                    }, 1);
                } else if (parsed.query['error']) {
                    // throw exception
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.write(`${parsed.query['error']}: ${parsed.query['error']}`);
                    response.end();
                    reject(parsed.query['error']);
                }
            });
            server.on('connection', function (socket) {
                sockets.push(socket);
            });
            server.listen(OAUTH_LOCAL_PORT, function () {
                logger.debug('Local server for login redirect listening at http://localhost:%s', OAUTH_LOCAL_PORT);
                logger.info('Waiting for user to authenticate...');
            });
        });
    }

    /**
     * @typedef {Object} AccessTokenResponse
     * @property {string} accessToken
     * @property {Date} expires
     * @property {string[]} scopes
     */

    /**
     * Gets an access token from a client credentials grant
     * @return {Promise<AccessTokenResponse>}
     * @private
     */
    async _accessTokenFromClientCredentials() {
        logger.debug("Getting access token from client credentials");
        var queryStr = new URLSearchParams({
            grant_type: "client_credentials"
        })

        if (this.scopes && this.scopes.length > 0) {
            queryStr.append("scope", this.scopes.join(' '))
        }
        var resp = await this.am.post('dwsso/oauth2/access_token', queryStr.toString())
        const jwt = this._decodeJWT(resp.data.access_token);
        logger.debug('JWT\n' + JSON.stringify(jwt.payload, null, 2));

        var now = new Date();
        var expiration = new Date(now.getTime() + parseInt(resp.data.expires_in) * 1000);
        var scopes = resp.data.scope?.split(' ') ?? []

        return {
            accessToken: resp.data.access_token,
            expires: expiration,
            scopes: scopes
        }
    }

    /**
     * Returns the decodes JWT
     * @param {string} jwt
     * @return {{payload: any, header: any}}
     */
    _decodeJWT(jwt) {
        // decode jwt and return structure
        try {
            const parts = jwt.split('.');
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            return {
                header,
                payload
            }
        } catch (e) {
            logger.error("Error decoding JWT", e);
            throw e;
        }
    }

    /**
     * Returns the decodes JWT
     * @return {Promise<{payload: any, header: any}>}
     */
    async getJWT() {
        const jwt = await this._getAccessToken()
        return this._decodeJWT(jwt);
    }

    /**
     * Gets an access token from account manager
     * @return {Promise<string>}
     * @private
     */
    async _getAccessToken() {
        // use module cache to manage tokens across instances of this class
        // discard those that have expired
        if (ACCESS_TOKEN_CACHE[this.clientID]) {
            var now = new Date()
            var _tokenStruct = ACCESS_TOKEN_CACHE[this.clientID]
            var tokenScopes = _tokenStruct.scopes
            const hasAllScopes = this.scopes.every((scope) => tokenScopes.includes(scope))
            if (!hasAllScopes) {
                logger.warn('Access token missing scopes; invalidating and re-authenticating')
                delete ACCESS_TOKEN_CACHE[this.clientID]
            } else if (_tokenStruct.expires && now.getTime() > _tokenStruct.expires) {
                logger.warn('Access token expired; invalidating and re-authenticating')
                delete ACCESS_TOKEN_CACHE[this.clientID]
            } else {
                logger.debug('Reusing cached access token')
                return ACCESS_TOKEN_CACHE[this.clientID].accessToken
            }
        }
        if (this.clientID && this.clientSecret) {
            let accessTokenStruct = await this._accessTokenFromClientCredentials()
            ACCESS_TOKEN_CACHE[this.clientID] = accessTokenStruct
            return accessTokenStruct.accessToken
        } else {
            // finally try implicit login if we are still lacking info for obtaining a token
            let accessTokenStruct = await this._implicitFlowLogin()
            ACCESS_TOKEN_CACHE[this.clientID] = accessTokenStruct
            return accessTokenStruct.accessToken
        }
    }

    /**
     * Clear access token so auths are performed anew
     *
     * @return {void}
     */
    deauthenticate() {
        if (ACCESS_TOKEN_CACHE[this.clientID]) {
            delete ACCESS_TOKEN_CACHE[this.clientID]
        }
    }
}

module.exports = Environment;
module.exports.loggingRequestInterceptor = loggingRequestInterceptor;
module.exports.loggingResponseInterceptor = loggingResponseInterceptor;
