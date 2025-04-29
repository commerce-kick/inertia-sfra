#!/usr/bin/env node

/**
 * Demonstrates using the page designer export APIs (that `b2c-tools export page` uses)
 * to find orphan components and remove them
 *
 * Run with `SFCC_VARS__LIBRARY_ID=RefArchSharedLibrary b2c-tools import run page-designer-orphan-cleanup.js`
 * or directly: `node page-designer-orphan-cleanup.js --vars '{"libraryID":"RefArchSharedLibrary"}'`
 *
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({env, logger, helpers, vars}) {
    const {Library, siteArchiveExportText, siteArchiveImportText} = helpers;
    const {libraryID = 'RefArchSharedLibrary'} = vars;

    var archive = await siteArchiveExportText(env, {
        libraries: {
            [libraryID]: true
        }
    })
    const libraryXML = archive.get(`libraries/${libraryID}/library.xml`)

    // parse and keep orphan components under the root of the tree
    const library = await Library.parse(libraryXML, {keepOrphans: true})

    var foundOrphans = false;

    // demonstrate chaining pattern
    library
        // direct children of the root of the library tree that are components are orphaned (as otherwise
        // they would be children of pages/other components). filter() here is called non-recursive so it's only looking at
        // direct children
        .filter(node => node.type === 'COMPONENT')

        // mutate the underlying XML structure of the filtered nodes to add "delete" mode attribute
        // don't traverse through filtered out nodes
        .traverse(node => {
            // still need check for component as it might have STATIC (asset) children which do not have XML
            // alternatively pass an empty assetQuery when parsing so no STATIC nodes are created in the tree.
            if (node.type === "COMPONENT") {
                foundOrphans = true;
                node.xml['$']['mode'] = "delete";
            }
        }, {traverseHidden: false})


    if (foundOrphans) {
        var xmlStr = await library.toXMLString({traverseHidden: false});
        logger.info(xmlStr);
        archive.set(`libraries/${libraryID}/library.xml`, xmlStr)
        await siteArchiveImportText(env, archive)
    }

}

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()


