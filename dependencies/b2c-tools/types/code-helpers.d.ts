export type CartridgeMapping = {
    /**
     * - cartridge name
     */
    name: string;
    /**
     * - cartridge name (legacy)
     */
    dest: string;
    /**
     * - directory
     */
    src: string;
};
/**
 * Syncs the given cartridge mapping (src:dest) to the environments code version
 *
 * @param {Environment} env
 * @param {CartridgeMapping[]} cartridges
 * @param {boolean} reload
 * @param {object} options
 * @param {boolean} [options.cleanCartridges]
 * @return {Promise<void>}
 */
export function syncCartridges(env: Environment, cartridges: CartridgeMapping[], reload?: boolean, options?: {
    cleanCartridges?: boolean;
}): Promise<void>;
/**
 * @typedef {Object} CartridgeMapping
 * @property {string} name - cartridge name
 * @property {string} dest - cartridge name (legacy)
 * @property {string} src - directory
 */
/**
 * Find Cartridges recursively in the working directory
 *
 * @param {string} [directory] - directory search for cartridges
 * @return {CartridgeMapping[]}
 */
export function findCartridges(directory?: string): CartridgeMapping[];
/**
 * Reloads (or activates) the environments code version
 *
 * @param {Environment} env
 * @return {Promise<void>}
 */
export function reloadCodeVersion(env: Environment): Promise<void>;
import Environment = require("./environment");
//# sourceMappingURL=code-helpers.d.ts.map