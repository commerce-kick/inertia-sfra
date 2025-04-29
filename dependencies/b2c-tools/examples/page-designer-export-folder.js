#!/usr/bin/env node

/**
 * Export pages and their components based on folder assignment
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({env, logger, helpers, vars}) {
    const TARGET_FOLDER = 'about-us'
    const {Library, siteArchiveExportText} = helpers;

    var archive = await siteArchiveExportText(env, {
        libraries: {
            "RefArchSharedLibrary": true
        }
    })
    const libraryXML = archive.get('libraries/RefArchSharedLibrary/library.xml')
    const library = await Library.parse(libraryXML)

    /**
     * @param {LibraryNode} node
     * @return {boolean}
     */
    function filterForFolder(node) {
        const classificationFolder = node.xml['folder-links']?.find(
            l => l['classification-link']?.[0]
        )?.['classification-link']?.[0]?.['$']?.['folder-id']
        return node.type === "PAGE" && classificationFolder === TARGET_FOLDER
    }

    library.filter(filterForFolder)
    console.log(await library.toXMLString({traverseHidden: false}))
}

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()


