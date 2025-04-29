export type ExportPagesToFolderOptions = {
    /**
     * is this a site library?
     */
    isSite: boolean;
    /**
     * list of object paths to find static assets to download
     */
    assetQuery: string[];
    /**
     * path to library file to load
     */
    libraryFile: string;
    /**
     * offline mode (don't download assets)
     */
    offline: boolean;
    /**
     * list of folder IDs to filter by
     */
    folders?: string[];
};
export type FilterCallback = (node: LibraryNode) => boolean;
export type TraverseCallback = (node: LibraryNode) => void;
/**
 * Provides an export of
 */
export type LibraryExport = {
    /**
     * processed library XML
     */
    XML: string;
    /**
     * tree structure of library exported
     */
    tree: LibraryNode;
};
/**
 * Provides an interface to manipulating content libraries
 *
 * @class Library
 * @property {string[]} [assetQuery] list of object paths to find static assets
 * @property {LibraryNode} tree tree structure of library
 * @property {object} xml underlying xmljs structure
 */
export class Library {
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
    static parse(libraryXML: string, { assetQuery, keepOrphans }?: Partial<{
        /**
         * list of object paths to find static assets
         */
        assetQuery: string[];
        /**
         * keep orphan components
         */
        keepOrphans: boolean;
    }>): Promise<Library>;
    constructor(guard: any);
    assetQuery: any[];
    tree: any;
    xml: any;
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
    traverse(callback: TraverseCallback, { traverseHidden, callbackHidden }?: Partial<{
        /**
         * traverse through hidden nodes
         */
        traverseHidden: boolean;
        /**
         * execute callback for hidden nodes
         */
        callbackHidden: boolean;
    }>): Library;
    /**
     * Reset tree visibility state
     * @return {Library}
     */
    reset(): Library;
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
    filter(callback: FilterCallback, { recursive }?: Partial<{
        /**
         * filter recursively (depth-first)
         */
        recursive: boolean;
    }>): Library;
    /**
     * Returns this Library as an importable XML
     *
     * @param {Partial<LibraryTraverseOptions>} [options]
     * @return {Promise<string>} library XML
     */
    toXMLString({ traverseHidden }?: Partial<{
        /**
         * traverse through hidden nodes
         */
        traverseHidden: boolean;
        /**
         * execute callback for hidden nodes
         */
        callbackHidden: boolean;
    }>): Promise<string>;
    toJSON(): any;
    /**
     * Output's the page designer tree structure to the given logger
     *
     * @param {winston.Logger} logger
     * @param {Partial<LibraryTraverseOptions>} options
     * @return {void}
     */
    outputLibraryTree(logger: winston.Logger, { traverseHidden }?: Partial<{
        /**
         * traverse through hidden nodes
         */
        traverseHidden: boolean;
        /**
         * execute callback for hidden nodes
         */
        callbackHidden: boolean;
    }>): void;
}
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
export class LibraryNode {
    constructor(values: any);
    ID: any;
    type: any;
    typeID: any;
    data: any;
    parent: any;
    children: any;
    xml: any;
    hidden: any;
    toJSON(): {
        ID: any;
        type: any;
        typeID: any;
        data: any;
        children: any;
        hidden: any;
    };
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
export function exportPagesToFolder(pages: string[] | RegExp[], library: string, outputPath: string, { isSite, assetQuery, libraryFile, folders, offline, }?: Partial<ExportPagesToFolderOptions>): Promise<void>;
import winston = require("winston");
//# sourceMappingURL=page-designer.d.ts.map