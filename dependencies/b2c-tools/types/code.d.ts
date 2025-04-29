import { syncCartridges } from "./code-helpers";
import { reloadCodeVersion } from "./code-helpers";
import { findCartridges } from "./code-helpers";
/**
 * Downloads the code version as a zipped archive
 *
 * @param {Environment} env
 * @return {Promise<Buffer>}
 */
export function downloadCodeVersion(env: Environment): Promise<Buffer>;
/**
 * Find's cartridges, filters them, executes deploy scripts and syncs to the instance
 *
 * See `syncCartridges` for upload only
 *
 * @param {Environment} env
 * @param {string[]} cartridges included cartridge names
 * @param {string[]} excludeCartridges excluded cartridge names
 * @param {object} options
 * @param {boolean} options.reload reload code version
 * @param {boolean} options.cleanCartridges
 * @param {string} options.cartridgeSearchDir
 * @param {boolean} options.executeDeployScript
 * @param {string} options.deployScript
 * @param {object} options.vars
 * @return {Promise<void>}
 */
export function codeDeploy(env: Environment, cartridges: string[], excludeCartridges: string[], { reload, cleanCartridges, cartridgeSearchDir, executeDeployScript, deployScript, vars }: {
    reload: boolean;
    cleanCartridges: boolean;
    cartridgeSearchDir: string;
    executeDeployScript: boolean;
    deployScript: string;
    vars: object;
}): Promise<void>;
/**
 * Set code version to active code version if not found in env variables
 */
export function setEnvCodeVersion(env: any): Promise<void>;
import Environment = require("./environment");
export { syncCartridges, reloadCodeVersion, findCartridges };
//# sourceMappingURL=code.d.ts.map