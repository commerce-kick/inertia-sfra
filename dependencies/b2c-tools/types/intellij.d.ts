/**
 * Decrypts the credentials blob; which should be in base64 encoding
 *
 * This method is synchronous
 *
 * @param {string} cipherText base64 string
 * @param {string} key
 * @return {string} plaintext
 */
export function decryptCredentials(cipherText: string, key: string): string;
/**
 * Encrypt the given plaintext to a credentials blob
 *
 * This method is synchronous
 *
 * @param {string} plainText
 * @param {string} key
 */
export function encryptCredentials(plainText: string, key: string): string;
/**
 * converts a dwjson multi-config object (i.e. pre-2022.3 config) to a post-2022.3 config
 * and encrypted credentials file. Connections source is considered to be in .idea/misc.xml
 * and credentials file is passed in
 *
 * Note: ALL dw.json passwords are assumed to be webdav access keys and will be inserted
 * into the credentials store as this is typical of SSO AM usage. Existing access keys will
 * NOT be updated (a warning will be printed).
 *
 * Your intellij project should already be initialized (i.e. create a single connection)
 *
 * @param {object} dwJson
 * @param {string} credentialsFilename
 * @param {string} key
 */
export function convertDWJsonToIntellij(dwJson: object, credentialsFilename: string, key: string, projectFile: any): Promise<void>;
/**
 * Gets the currently encoded connections setting document from the IDEA
 * user project settings file.
 *
 * NOTE: this uses fast-xml-parser internally as opposed to xml2js to allow sync use;
 * this is less robust than xml2js but fast and allows for usage in sync scenarios
 * like config loading
 *
 * @param {string} filename
 * @return {object}
 */
export function getIntellijSFCCConnectionSettings(filename: string): object;
/**
 * Writes a new connections setting object
 *
 * NOTE: for compatibility this object should be a modified version of
 * the object read from the get function above
 *
 * @param {string} filename
 * @param {object} obj
 * @return {Promise<void>}
 */
export function setIntellijSFCCConnectionSettings(filename: string, obj: object): Promise<void>;
//# sourceMappingURL=intellij.d.ts.map