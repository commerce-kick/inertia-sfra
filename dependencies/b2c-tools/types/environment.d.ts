/// <reference types="node" />
export = Environment;
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
declare class Environment {
    /**
     * @param {EnvironmentOpts} opts
     */
    constructor(opts?: EnvironmentOpts);
    /**
     * @type {string}
     */
    server: string;
    /**
     * @type {string}
     */
    secureServer: string;
    /**
     * @type {string}
     */
    username: string;
    /**
     * @type {string}
     */
    password: string;
    /**
     * @type {string}
     */
    clientID: string;
    /**
     * @type {string}
     */
    clientSecret: string;
    /**
     * @type {string}
     */
    codeVersion: string;
    /**
     * @type {string}
     */
    shortCode: string;
    /**
     * @type {boolean}
     */
    verify: boolean;
    /**
     * @type {string|Buffer}
     */
    certificate: string | Buffer;
    /**
     * @type {string}
     */
    passphrase: string;
    /**
     * @type {string[]}
     */
    scopes: string[];
    /**
     * @type {string}
     */
    managedRuntimeApiKey: string;
    /**
     * @private
     */
    private _webdavClient;
    /**
     * @private
     */
    private _ocapiClient;
    /**
     * @private
     */
    private _amClient;
    /**
     * @private
     */
    private _odsClient;
    /**
     * @private
     */
    private _scapiClient;
    /**
     * @private
     */
    private _mrtClient;
    _httpsAgent: https.Agent;
    /**
     * account manager (account.demandware.net) scoped Axios instance
     *
     * @type {axios.AxiosInstance}
     */
    get am(): axios.AxiosInstance;
    /**
     * OCAPI scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get ocapi(): axios.AxiosInstance;
    /**
     * ODS scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get ods(): axios.AxiosInstance;
    /**
     * SCAPI scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get scapi(): axios.AxiosInstance;
    /**
     * Managed Runtime scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get mrt(): axios.AxiosInstance;
    /**
     * WebDAV scoped Axios Client
     *
     * @type {axios.AxiosInstance}
     */
    get webdav(): axios.AxiosInstance;
    /**
     * Request interceptor provides authentication services and lazily loads
     * configuration through the credentials loading options
     *
     * @param {axios.AxiosRequestConfig} config
     * @param {boolean} requireAccessToken
     * @return {Promise<axios.AxiosRequestConfig>}
     * @private
     */
    private _requestInterceptor;
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
    private _implicitFlowLogin;
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
    private _accessTokenFromClientCredentials;
    /**
     * Returns the decodes JWT
     * @param {string} jwt
     * @return {{payload: any, header: any}}
     */
    _decodeJWT(jwt: string): {
        payload: any;
        header: any;
    };
    /**
     * Returns the decodes JWT
     * @return {Promise<{payload: any, header: any}>}
     */
    getJWT(): Promise<{
        payload: any;
        header: any;
    }>;
    /**
     * Gets an access token from account manager
     * @return {Promise<string>}
     * @private
     */
    private _getAccessToken;
    /**
     * Clear access token so auths are performed anew
     *
     * @return {void}
     */
    deauthenticate(): void;
}
declare namespace Environment {
    export { loggingRequestInterceptor, loggingResponseInterceptor, EnvironmentOpts };
}
import https = require("https");
import axios = require("axios");
/**
 * Logs axios requests
 *
 * @param {axios.AxiosRequestConfig} config
 * @return {*}
 * @private
 */
declare function loggingRequestInterceptor(config: axios.AxiosRequestConfig): any;
/**
 *
 * @param {axios.AxiosResponse} response
 * @param {axios.AxiosError} err
 * @return {Promise<never>|*}
 * @private
 */
declare function loggingResponseInterceptor(response: axios.AxiosResponse, err: axios.AxiosError): Promise<never> | any;
type EnvironmentOpts = {
    server?: string;
    /**
     * hostname used for WebDAV access
     */
    secureServer?: string;
    username?: string;
    password?: string;
    clientID?: string;
    clientSecret?: string;
    codeVersion?: string;
    shortCode?: string;
    /**
     * verify SSL
     */
    verify?: boolean;
    /**
     * pfx path
     */
    certificate?: string | Buffer;
    /**
     * passphrase for pfx above
     */
    passphrase?: string;
    /**
     * authz scopes
     */
    scopes?: string[];
};
//# sourceMappingURL=environment.d.ts.map