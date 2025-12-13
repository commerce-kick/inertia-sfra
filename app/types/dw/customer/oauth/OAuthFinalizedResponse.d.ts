import OAuthAccessTokenResponse = require('./OAuthAccessTokenResponse');
import OAuthUserInfoResponse = require('./OAuthUserInfoResponse');
/**
 * Contains the combined responses from the third-party OAuth server when finalizing the authentication.
 */
declare class OAuthFinalizedResponse {
    private constructor();

    /**
     * The access token response
     */
    readonly accessTokenResponse  :  OAuthAccessTokenResponse

    /**
     * The user info response
     */
    readonly userInfoResponse  :  OAuthUserInfoResponse | null


}

export = OAuthFinalizedResponse;
