#!/usr/bin/env node


const fs = require("fs")
/**
 * Exports page(s) from a local library XML
 *
 * `SFCC_VARS__LIBRARY_FILE=library.xml SFCC_VARS__PAGE_ID=homepage b2c-tools import run page-designer-local-export.js`
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({helpers}) {
    const {Library} = helpers;
    const PAGE_IDS = ['main'];
    const libraryXML = fs.readFileSync("library.xml").toString()
    const library = await Library.parse(libraryXML)

    library.filter((node) => node.type === 'PAGE' && PAGE_IDS.includes(node.ID))
    console.log(await library.toXMLString({traverseHidden: false}))
}

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()


