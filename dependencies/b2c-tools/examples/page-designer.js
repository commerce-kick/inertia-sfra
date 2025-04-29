#!/usr/bin/env node

/**
 * Demonstrates using the page designer export APIs (that `b2c-tools export page` uses)
 * to extract detailed information about the library tree and mutate page designer components
 * in batch mode.
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({env, logger, helpers, vars}) {
    const {Library, siteArchiveExportText, siteArchiveImportText} = helpers;

    var archive = await siteArchiveExportText(env, {
        libraries: {
            "RefArchSharedLibrary": true
        }
    })
    const libraryXML = archive.get('libraries/RefArchSharedLibrary/library.xml')
    const library = await Library.parse(libraryXML)

    // filter only PD pages (not content assets) that match a certain name
    // plus their component trees
    library.filter((node) => node.type === 'PAGE' && node.ID.match(/.*-example/))
    logger.debug(await library.toXMLString({traverseHidden: false}))

    // reset filter state
    library.reset()

    // recursively filter for specific component and mutate it's data (i.e. set title to uppercase)
    library.filter((node) => node.typeID === 'component.commerce_assets.popularCategory', {
        recursive: true
    }).traverse(node => {
        if (node.data.catDisplayName) {
            node.data.catDisplayName = node.data.catDisplayName.toUpperCase();
        }
    })
    logger.debug(await library.toXMLString())

    library.outputLibraryTree(logger, {traverseHidden: true});
    logger.debug(JSON.stringify(library, null, 2))

    // import mutated components
    archive.set('libraries/RefArchSharedLibrary/library.xml', await library.toXMLString())
    await siteArchiveImportText(env, archive)
}

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()


