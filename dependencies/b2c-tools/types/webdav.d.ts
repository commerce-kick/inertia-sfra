/// <reference types="node" />
export type UploadArchiveOptions = {
    /**
     * extract archive on server
     */
    extract?: boolean;
    /**
     * keep archive on server
     */
    keepArchive?: boolean;
    /**
     * required if a buffer is provided
     */
    archiveName?: string;
};
export type UploadArchiveTextOptions = {
    /**
     * extract archive on server
     */
    extract?: boolean;
    /**
     * keep archive on server
     */
    keepArchive?: boolean;
    /**
     * required if a buffer is provided
     */
    archiveName?: string;
};
/**
 * @typedef {Object} UploadArchiveOptions
 * @property {boolean} [extract=true] extract archive on server
 * @property {boolean} [keepArchive=false] keep archive on server
 * @property {string} [archiveName] required if a buffer is provided
 */
/**
 * Higher level helpers for WebDAV uploading of multiple files.
 * Supports regular files, zip Files, directories or Buffers with automatic extraction.
 *
 * Directories are added recursively to the root of the archive (i.e. without given
 * directory name)
 *
 * @param {Environment} env
 * @param {string|Buffer} target file, directory or zip buffer
 * @param {string} uploadPath target directory related to webdav root
 * @param {UploadArchiveOptions} options
 * @returns {Promise<string>} the filename of the uploaded file/archive
 */
export function uploadArchive(env: Environment, target: string | Buffer, uploadPath: string, { extract, keepArchive, archiveName }?: UploadArchiveOptions): Promise<string>;
/**
 * @typedef {Object} UploadArchiveTextOptions
 * @property {boolean} [extract=true] extract archive on server
 * @property {boolean} [keepArchive=false] keep archive on server
 * @property {string} [archiveName] required if a buffer is provided
 */
/**
 * Import a zip file created from a mapping of filenames to text strings
 *
 * @param {Environment} env
 * @param {Map<string, string>} data map of filenames to text data to archive
 * @param {string} uploadPath target directory related to webdav root
 * @param {UploadArchiveTextOptions} options
 * @return {Promise<string>} the filename of the uploaded archive
 */
export function uploadArchiveText(env: Environment, data: Map<string, string>, uploadPath: string, options?: UploadArchiveTextOptions): Promise<string>;
import Environment = require("./environment");
import { Buffer } from "buffer";
//# sourceMappingURL=webdav.d.ts.map