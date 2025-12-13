/**
 * AgentUserStatusCodes contains constants representing status codes that can be used with a Status object 
 * to indicate the success or failure of the agent user login process.
 */
declare class AgentUserStatusCodes {
	/**
	 * Indicates that the agent user is not available.
	 */
	static readonly AGENT_USER_NOT_AVAILABLE: "AGENT_USER_NOT_AVAILABLE"

	/**
	 * Indicates that the agent user is not logged in.
	 */
	static readonly AGENT_USER_NOT_LOGGED_IN: "AGENT_USER_NOT_LOGGED_IN"

	/**
	 * Indicates that the agent user is not enabled for the current site.
	 */
	static readonly AGENT_USER_NOT_ENABLED_FOR_SITE: "AGENT_USER_NOT_ENABLED_FOR_SITE"

	/**
	 * Indicates that the current connection is not secure (HTTP instead of HTTPS) and 
	 * the server is configured to require a secure connection.
	 */
	static readonly INSECURE_CONNECTION: "INSECURE_CONNECTION"

	/**
	 * Indicates that the given agent user does not have the permission 'Login_Agent' 
	 * which is required to login to the storefront as an agent user.
	 */
	static readonly INSUFFICIENT_PERMISSION: "INSUFFICIENT_PERMISSION"

	/**
	 * Indicates that the agent user login was successful.
	 */
	static readonly LOGIN_SUCCESSFUL: "LOGIN_SUCCESSFUL"

	/**
	 * Indicates that the current context is not a storefront request.
	 */
	static readonly NO_STOREFRONT: "NO_STOREFRONT"

	/**
	 * Indicates that the given agent user password has expired and needs to be changed 
	 * in the Business Manager.
	 */
	static readonly PASSWORD_EXPIRED: "PASSWORD_EXPIRED"

	/**
	 * Indicates that the agent user account has been disabled in the Business Manager.
	 */
	static readonly USER_DISABLED: "USER_DISABLED"

	/**
	 * Indicates that the agent user account is locked, because the maximum number of 
	 * failed login attempts was exceeded.
	 */
	static readonly USER_LOCKED: "USER_LOCKED"

}

export = AgentUserStatusCodes
