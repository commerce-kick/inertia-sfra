const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const path = require('path');

// eslint-disable-next-line no-unused-vars
const winston = require('winston')
const Environment = require('./environment');
const logger = require('./logger');
const {siteArchiveExportText} = require('./jobs');
const {readFileSync} = require("fs");

/**
 * Represents a library tree (JSONifiable)
 *
 * @property {string} ID identifier
 * @property {'LIBRARY'|'PAGE'|'CONTENT'|'COMPONENT'|'STATIC'} type node type
 * @property {string} typeID page/component type
 * @property {object} data component data if COMPONENT type
 * @property {LibraryNode} [parent] parent node
 * @property {LibraryNode[]} children child nodes
 * @property {object} xml underlying xmljs structure
 * @property {boolean} hidden is this node hidden
 */
class LibraryNode {
    constructor(values) {
        this.ID = values.ID;
        this.type = values.type;
        this.typeID = values.typeID;
        this.data = values.data;
        this.parent = values.parent;
        this.children = values.children;
        this.xml = values.xml;
        this.hidden = values.hidden;
    }

    toJSON() {
        // don't return parent as that would be circular
        return {
            ID: this.ID,
            type: this.type,
            typeID: this.typeID,
            data: this.data,
            children: this.children,
            hidden: this.hidden
        }
    }
}

/**
 * Recursively process a <content> to extract child components and images to a
 * LibraryNode
 *
 * @param {object} content jsonified version of <content> via xml2js
 * @param {object} allContent all content in library
 * @param {string[]} assetQuery asset query to find static assets
 * @returns {LibraryNode} tree for this content and all children
 */
function processContent(content, allContent, assetQuery) {
    var contentId = content['$']['content-id'];
    var contentLinks = content['content-links'];
    var contentType = content['type'] ? content['type'][0] : null;
    var data = content['data'];

    /** @type {LibraryNode} */
    var node = new LibraryNode({
        ID: contentId,
        type: contentType ? (contentType.startsWith('page.') ? "PAGE" : "COMPONENT") : "CONTENT",
        typeID: contentType,
        data: null,
        children: [],
        xml: content,
        hidden: false
    });

    if (data && data[0] && data[0]['_']) {
        try {
            // look for asset urls in json using the provided queries
            var dataJson = JSON.parse(data[0]['_']);
            node.data = dataJson;
            for (var i = 0; i < assetQuery.length; i++) {
                var query = assetQuery[i].split('.');
                var _current = dataJson;
                for (var j = 0; j < query.length; j++) {
                    var _attr = query[j];
                    if (_attr && _current[_attr] && j === query.length - 1) {
                        node.children.push(new LibraryNode({
                            ID: _current[_attr],
                            type: "STATIC",
                            typeID: null,
                            data: null,
                            parent: node,
                            children: [],
                            hidden: false,
                            xml: null
                        }));
                    } else if (_current[_attr]) {
                        _current = _current[_attr];
                    } else {
                        break;
                    }
                }
            }
        } catch (e) {
            logger.error(e.message || e);
            logger.error('Couldn\'t extract images from JSON');
        }
    }

    if (contentLinks && contentLinks[0]['content-link'] && contentLinks[0]['content-link'].length) {
        // recurse
        for (i = 0; i < contentLinks[0]["content-link"].length; i++) {
            let _cl = contentLinks[0]['content-link'][i];
            let _clId = _cl['$']['content-id'];
            if (!allContent[_clId]) {
                logger.warn(`Cannot find component ${_clId} in library; skipping...`);
                continue;
            }
            let componentNode = processContent(allContent[_clId], allContent, assetQuery);
            componentNode.parent = node
            node.children.push(componentNode);
        }
    }
    return node;
}

/**
 * @callback FilterCallback
 * @param {LibraryNode} node
 * @return {boolean}
 */
/**
 * @callback TraverseCallback
 * @param {LibraryNode} node
 * @return {void}
 */

/**
 * Provides an export of
 * @typedef {object} LibraryExport
 * @property {string} XML processed library XML
 * @property {LibraryNode} tree tree structure of library exported
 */

const _LIBRARY_CONSTRUCTOR_GUARD = Symbol();

/**
 * Provides an interface to manipulating content libraries
 *
 * @class Library
 * @property {string[]} [assetQuery] list of object paths to find static assets
 * @property {LibraryNode} tree tree structure of library
 * @property {object} xml underlying xmljs structure
 */
class Library {
    constructor(guard) {
        if (guard !== _LIBRARY_CONSTRUCTOR_GUARD) {
            throw new Error('Use Library.parse() async static method to construct a new library')
        }
        this.assetQuery = [];
        this.tree = null;
        this.xml = null;
    }

    /**
     * @typedef {object} LibraryParseOptions
     * @property {string[]} assetQuery list of object paths to find static assets
     * @property {boolean} keepOrphans keep orphan components
     */
    /**
     * Parse the given library XML
     *
     * @param {string} libraryXML plain text XML of a library
     * @param {Partial<LibraryParseOptions>} options options
     * @return {Promise<Library>}
     */
    static async parse(libraryXML, {
        assetQuery = ['image.path'],
        keepOrphans = false
    } = {}) {
        var xml = await xml2js.parseStringPromise(libraryXML);
        // Process library for page(s) and recurse for componentns
        var libraryID = xml.library['$']['library-id']
        var pagesById = new Set();

        const library = new Library(_LIBRARY_CONSTRUCTOR_GUARD);
        library.assetQuery = assetQuery;

        /** @type {LibraryNode} */
        const root = new LibraryNode({
            ID: libraryID,
            type: "LIBRARY",
            typeID: null,
            children: [],
            data: null,
            parent: null,
            hidden: false,
            xml: null
        });

        xml.library.content.forEach((c) => {
            pagesById[c['$']['content-id']] = c
        });
        xml.library.content.forEach(c => {
            // only process pages and content under the library root
            if ((c.type && c.type[0] && c.type[0].startsWith('page.')) || !c.type) {
                const page = processContent(c, pagesById, assetQuery)
                page.parent = root
                root.children.push(page)
            }
        })

        library.xml = xml;
        library.tree = root;

        // optionally process orphan components
        if (keepOrphans) {
            let processedContent = new Set();
            library.traverse((node) => {
                processedContent.add(node.ID);
            })
            xml.library.content.forEach(c => {
                if (!processedContent.has(c['$']['content-id'])) {
                    const page = processContent(c, pagesById, assetQuery)
                    page.parent = root
                    root.children.push(page)
                }
            })
        }

        // empty library lists
        // noinspection JSConstantReassignment
        delete xml.library.header;
        // noinspection JSConstantReassignment
        delete xml.library.folder;
        return library;
    }

    /**
     * @typedef {object} LibraryTraverseOptions
     * @property {boolean} traverseHidden traverse through hidden nodes
     * @property {boolean} callbackHidden execute callback for hidden nodes
     */

    /**
     * Traverse (depth-first) the library tree
     *
     * @param {TraverseCallback} callback
     * @param {Partial<LibraryTraverseOptions>} options
     * @return {Library}
     */
    traverse(callback, {
        traverseHidden = true,
        callbackHidden = false
    } = {}) {
        function _traverse(node) {
            if (!node.hidden || traverseHidden) {
                if (node.children) {
                    node.children.forEach(_traverse)
                }
            }

            if (!node.hidden || callbackHidden) {
                callback(node)
            }
        }

        this.tree.children.forEach(_traverse)
        return this;
    }

    /**
     * Reset tree visibility state
     * @return {Library}
     */
    reset() {
        this.traverse((n) => {
            n.hidden = false
        }, {traverseHidden: true, callbackHidden: true})
        return this
    }

    /**
     * @typedef {object} LibraryFilterOptions
     * @property {boolean} recursive filter recursively (depth-first)
     */
    /**
     * Filter this library. Callback should return true if the node should be included
     *
     * @param {FilterCallback} callback
     * @param {Partial<LibraryFilterOptions>} options
     * @return {Library}
     */
    filter(callback, {
        recursive = false
    } = {}) {
        if (!recursive) {
            this.tree.children.forEach(n => n.hidden = !callback(n));
        } else {
            this.traverse((n) => {
                n.hidden = !callback(n);
            }, {traverseHidden: true, callbackHidden: true})
        }
        return this;
    }

    /**
     * Returns this Library as an importable XML
     *
     * @param {Partial<LibraryTraverseOptions>} [options]
     * @return {Promise<string>} library XML
     */
    async toXMLString({
        traverseHidden = true
    } = {}) {
        delete this.xml.library.content;
        this.xml.library.content = []
        this.traverse((n) => {
            if (n.data) {
                n.xml.data[0]['_'] = JSON.stringify(n.data, null, 2);
            }
            if (n.xml) {
                this.xml.library.content.push(n.xml);
            }
        }, {traverseHidden})
        var builder = new xml2js.Builder();
        return builder.buildObject(this.xml);
    }

    toJSON() {
        return this.tree
    }

    /**
     * Output's the page designer tree structure to the given logger
     *
     * @param {winston.Logger} logger
     * @param {Partial<LibraryTraverseOptions>} options
     * @return {void}
     */
    outputLibraryTree(logger, {traverseHidden = false} = {}) {
        function recurseTree(node, logPrefix = '') {
            if (node.hidden && !traverseHidden) {
                return;
            }
            var contentType = node.type === "STATIC" ? "STATIC ASSET" : node.typeID;
            logger.info(`${logPrefix}${logPrefix ? '├──' : ''}${node.ID} (${contentType ? contentType : 'CONTENT'}) ${node.hidden ? "[HIDDEN]" : ""}`);
            node.children.forEach((_node) => recurseTree(_node, logPrefix + '  '))
        }

        this.tree.children.forEach((_node) => recurseTree(_node))
    }
}

/**
 * @typedef {object} ExportPagesToFolderOptions
 * @property {boolean} isSite is this a site library?
 * @property {string[]} assetQuery list of object paths to find static assets to download
 * @property {string} libraryFile path to library file to load
 * @property {boolean} offline offline mode (don't download assets)
 * @property {string[]} [folders] list of folder IDs to filter by
 */
/**
 * Exports page(s) from page designer to an extracted impex folder, downloading
 * static assets (images, etc) using an object query path(s)
 *
 * @param {string[]|RegExp[]} pages list of page IDs to export
 * @param {string} library library ID (or site id if isSite is true)
 * @param {string} outputPath output path to save extracted library to
 * @param {Partial<ExportPagesToFolderOptions>} options options
 * @return {Promise<void>}
 */
async function exportPagesToFolder(pages, library, outputPath, {
    isSite = false,
    assetQuery = ['image.path'],
    libraryFile = null,
    folders = [],
    offline = false,
} = {}) {
    var env = new Environment();
    var now = (new Date()).toISOString()
        .replace(/[:.-]+/g, '');
    var archiveDir = `${now}_export`;
    var libraryEntry = isSite ? `sites/${library}/library/library.xml` : `libraries/${library}/library.xml`;

    if (libraryFile) {
        logger.info(`Reading from library ${libraryFile}...`);
        var libraryXML = readFileSync(libraryFile, 'utf8');
    } else {
        logger.info(`Exporting from library ${library}...`);
        var dataUnits;
        if (!isSite) {
            dataUnits = {
                libraries: {
                    [library]: true
                }
            };
        } else {
            dataUnits = {
                sites: {
                    [library]: {
                        content: true
                    }
                }
            };
        }

        const archive = await siteArchiveExportText(env, dataUnits);
        libraryXML = archive.get(libraryEntry);
        if (!libraryXML) {
            throw new Error(`library ${library} not found; for non-shared libraries use the --is-site-library option`);
        }
    }
    var zip = new AdmZip();

    logger.info(`Extracting pages, components and images...`);
    const lib = await Library.parse(libraryXML, {assetQuery})

    // only top-level filter here
    lib.filter((node) => {
        return (node.type === "PAGE" || node.type === "CONTENT") && pages.some(page => {
            // if we're querying for folder(s) filter out any pages that are NOT in them or empty
            if (folders.length > 0) {
                const classificationFolder = node.xml['folder-links']?.find(
                    l => l['classification-link']?.[0]
                )?.['classification-link']?.[0]?.['$']?.['folder-id']
                if (!classificationFolder || !folders.includes(classificationFolder)) {
                    return false;
                }
            }
            if (page instanceof RegExp) {
                return !!node.ID.match(page);
            } else {
                return node.ID === page;
            }
        })
    })

    lib.outputLibraryTree(logger)

    if (!offline) {
        const filesToDownload = new Set();
        lib.traverse(node => {
            if (node.type === "STATIC") {
                filesToDownload.add(node.ID)
            }
        }, {traverseHidden: false})

        logger.info('Downloading images...');
        for (var filename of filesToDownload) {
            logger.info(`Getting ${filename}`);
            if (filename[0] === '/') {
                filename = filename.slice(1);
            }
            try {
                var resp = await env.webdav.get(`Libraries/${library}/default/${filename}`, {
                    responseType: 'arraybuffer'
                });
                if (!isSite) {
                    zip.addFile(`${archiveDir}/libraries/${library}/static/default/${filename}`, resp.data);
                } else {
                    zip.addFile(`${archiveDir}/sites/${library}/library/static/default/${filename}`, resp.data);
                }
            } catch (e) {
                logger.warn(`Error downloading ${filename} from library: ` + e.message);
            }
        }
    }

    zip.addFile(`${archiveDir}/${libraryEntry}`, await lib.toXMLString({traverseHidden: false}));

    await zip.extractAllToAsync(outputPath, true);
    logger.info(`Saved to ${path.join(outputPath, archiveDir)}`);
}

module.exports = {
    Library,
    LibraryNode,
    exportPagesToFolder
}
