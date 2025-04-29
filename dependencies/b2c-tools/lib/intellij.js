/*
 * Provide an adapter to the intellij sfcc plugin (https://plugins.jetbrains.com/plugin/13668-salesforce-b2c-commerce-sfcc-) credential and instance storage
 *
 * The version for intellij 2022.3 changed from using a dw.json based storage
 * to a custom credential storage based on keychain or encrypted file. The latter (encrypted
 * file) is what this API uses.
 *
 * Additionally, the instance connections are decoupled from the credential storage and stored in
 * the .idea/misc.xml user project file
 *
 * This API surfaces this new configuration in a dw.json compatible way for use with b2c-tools and other
 * tools (prophet, etc)
 */

const fs = require('fs')
const crypto = require('crypto')
const xml2js = require('xml2js');
const {XMLParser} = require("fast-xml-parser");
const {Buffer} = require("buffer");

const logger = require('./logger')

// expose env var for overriding algorithm
const ALGORITHM = process.env.SFCC_INTELLIJ_ALGORITHM ? process.env.SFCC_INTELLIJ_ALGORITHM : "aes-192-ecb"

/**
 * Decrypts the credentials blob; which should be in base64 encoding
 *
 * This method is synchronous
 *
 * @param {string} cipherText base64 string
 * @param {string} key
 * @return {string} plaintext
 */
function decryptCredentials(cipherText, key) {
    var _cipherText = Buffer.from(cipherText, "base64")

    const cipher = crypto.createDecipheriv(ALGORITHM, key, null)
    return Buffer.concat([cipher.update(_cipherText), cipher.final()]).toString("utf-8")

}

/**
 * Encrypt the given plaintext to a credentials blob
 *
 * This method is synchronous
 *
 * @param {string} plainText
 * @param {string} key
 */
function encryptCredentials(plainText, key) {
    const cipher = crypto.createCipheriv(ALGORITHM, key, null)
    return Buffer.concat([cipher.update(plainText), cipher.final()]).toString("base64")
}

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
async function convertDWJsonToIntellij(dwJson, credentialsFilename, key, projectFile) {
    var credentialsObj = DEFAULT_CREDENTIALS_OBJ
    if (fs.existsSync(credentialsFilename)) {
        logger.debug(`Reading from ${credentialsFilename}`)
        let contents = (await fs.promises.readFile(credentialsFilename)).toString()
        credentialsObj = JSON.parse(decryptCredentials(contents, key))
    }

    logger.debug(JSON.stringify(credentialsObj, null, 2))

    var configs = dwJson.configs ? dwJson.configs : []
    delete dwJson.configs
    configs.unshift(dwJson)

    var connectionsSettings = await getIntellijSFCCConnectionSettings(projectFile)
    if (!connectionsSettings) {
        throw new Error("Updated plugin connections settings not found in project folder; upgrade plugin or check current directory")
    }

    configs.forEach(c => {
        logger.debug(JSON.stringify(c, null, 2))
        if (c['client-id']) {
            let match = credentialsObj.ocapiKeys.find(o => o.clientId === c['client-id'])
            if (!match) {
                credentialsObj.ocapiKeys.push({
                    clientId: c['client-id'],
                    clientSecret: c['client-secret'] ?? ""
                })
            } else {
                logger.warn(`OCAPI client ID ${c['client-id']} already in credentials file, skipping...`)
            }
        }

        if (!c.username) {
            logger.warn('Username not found for connection, skipping')
            return
        }
        if (!c.password) {
            logger.warn('Password not found for connection, skipping')
            return
        }

        var account = credentialsObj.accounts.find(a => a.username === c.username)
        if (!account) {
            logger.debug(`Creating account for ${c.username}`)
            account = {
                username: c.username,
                hidePassword: true,
                accessKeys: [],
                password: "NA" // access key only conversion
            }
            credentialsObj.accounts.push(account)
        }

        // this is array of key sets grouped by username;
        // the keys attribute actually hosts the hostname mapping to specific
        // key types
        var accessKey = account.accessKeys.find(ak => ak.username === c.username)
        if (!accessKey) {
            logger.debug(`Creating first access key for ${c.username}`)
            account.accessKeys.push({
                username: c.username,
                keys: {
                    [c.hostname]: {
                        "WebDAV": c.password
                    }
                }
            })
        } else {
            let hostAccessKey = accessKey.keys[c.hostname]
            if (!hostAccessKey) {
                accessKey.keys[c.hostname] = {
                    "WebDAV": c.password
                }
            } else if (hostAccessKey && !hostAccessKey.WebDAV) {
                accessKey.keys[c.hostname].WebDAV = c.password
            } else {
                logger.warn(`Host access key for ${c.username} on ${c.hostname} already exists, skipping...`)
            }
        }

        // remove from incoming connections
        delete c['client-secret']
        delete c['password']

        var existingConnection = connectionsSettings.source.find(s => s.name === c.name || s.hostname === c.hostname)
        if (existingConnection) {
            logger.warn(`Existing connection found for ${c.hostname}, skipping...`)
        } else {
            connectionsSettings.source.push(c)
        }
    })

    logger.info('Encrypting contents...')
    logger.debug(JSON.stringify(credentialsObj, null, 2))
    var cipherText = encryptCredentials(JSON.stringify(credentialsObj, null, 2), key)
    logger.info(`Writing credentials file ${credentialsFilename}...`)
    await fs.promises.writeFile(credentialsFilename, cipherText)
    logger.info(`Writing connections settings ${projectFile}...`)
    setIntellijSFCCConnectionSettings(projectFile, connectionsSettings)
    logger.info('Conversion complete. Reload your JetBrains project')
}

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
function getIntellijSFCCConnectionSettings(filename) {
    const contents = (fs.readFileSync(filename)).toString()
    const options = {
        attributeNamePrefix: "",
        allowBooleanAttributes: true,
        preserveOrder: true,
        processEntities: true,
        textNodeName: "_",
        ignoreAttributes: false,
        ignoreNameSpace: false,
    }
    const parser = new XMLParser(options);
    parser.addEntity('#xA', '\n')
    parser.addEntity('#10', '\n')
    let xml = parser.parse(contents);

    var connectionSettingsComponent = xml?.[1].project?.find(_xml => _xml.component && _xml[':@'].name === 'IntellijSFCCConnectionSettings');
    if (connectionSettingsComponent) {
        var connectionSettingsOption = connectionSettingsComponent.component.find(o => o[':@'].name === "json")
        var jsonValue = connectionSettingsOption[':@']['value']
        return JSON.parse(jsonValue)
    }

    return null;
}

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
async function setIntellijSFCCConnectionSettings(filename, obj) {
    const contents = (await fs.promises.readFile(filename)).toString()
    var xml = await xml2js.parseStringPromise(contents)

    var components = xml.project.component;
    var connectionSettingsComponent = components.find(c => c["$"]["name"] === "IntellijSFCCConnectionSettings")
    if (connectionSettingsComponent) {
        var connectionSettings = connectionSettingsComponent.option.find(o => o['$']["name"] === "json")
        connectionSettings['$']['value'] = JSON.stringify(obj, null, 2)

        var builder = new xml2js.Builder();
        var xmlStr = builder.buildObject(xml);
        await fs.promises.writeFile(filename, Buffer.from(xmlStr, "utf8"))
    } else {
        logger.warn("IntellijSFCCConnectionSettings not found; please initialize the project first")
    }
}

const DEFAULT_CREDENTIALS_OBJ = {
    "accounts": [],
    "ocapiKeys": []
}

module.exports = {
    decryptCredentials,
    encryptCredentials,
    convertDWJsonToIntellij,
    getIntellijSFCCConnectionSettings,
    setIntellijSFCCConnectionSettings
}
