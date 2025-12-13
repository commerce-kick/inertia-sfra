
/**
 * Contains OAuth-related artifacts from the HTTP response from the third-party OAuth server when requesting an access token
 */
declare class OAuthAccessTokenResponse {
    private constructor();

    /**
     * The access token
     */
    readonly accessToken  :  string

    /**
     * The access token expiration
     */
    readonly accessTokenExpiry  :  number

    /**
     * The error status. In cases of errors - more detailed error information can be seen in the error log files (specifity of error details vary by OAuth provider).
     */
    readonly errorStatus  :  string

    /**
     * The OAuth provider id
     */
    readonly oauthProviderId  :  string

    /**
     * The refresh token
     */
    readonly refreshToken  :  string


}

export = OAuthAccessTokenResponse;
