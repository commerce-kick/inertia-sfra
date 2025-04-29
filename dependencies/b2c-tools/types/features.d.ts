export type FeatureScriptArguments = {
    featureHelpers: typeof FEATURE_HELPERS;
    /**
     * directory of current features
     */
    featuresDir: string;
    /**
     * persist secrets to instance
     */
    saveSecrets: boolean;
    instanceState: import("./features-helpers").InstanceFeatureState;
};
export type DeployFeatureOptions = {
    /**
     * directory of current features
     */
    featuresDir: string;
    vars: object;
    /**
     * persist secrets to instance
     */
    saveSecrets: boolean;
};
/**
 * These are question objects from the inquirer module. We're only interested in the name
 */
export type Question = {
    name: string;
};
export type Feature = {
    featureName: string;
    requires: string[];
    defaultVars: object;
    secretVars: string[];
    beforeDeploy: Function | null;
    questions: Function | Question[];
    excludeMigrations: string[];
    excludeCartridges: string[];
    remove: Function | null;
    finish: Function | null;
    path: string;
};
import { getInstanceFeatureState } from "./features-helpers";
/**
 * Boostrap feature functionality (access and custom object)
 * or update to latest
 *
 * @param {Environment} env
 * @returns {Promise<void>}
 */
export function boostrapFeatures(env: Environment): Promise<void>;
/**
 *
 * @param dir
 * @returns {Promise<Feature[]>}
 */
export function collectFeatures(dir: any): Promise<Feature[]>;
/**
 * @typedef {object} FeatureScriptArguments
 * @property {typeof FEATURE_HELPERS} featureHelpers
 * @property {string} featuresDir directory of current features
 * @property {boolean} saveSecrets persist secrets to instance
 * @property {import("./features-helpers").InstanceFeatureState} instanceState
 */
/**
 * @typedef {object} DeployFeatureOptions
 * @property {string} featuresDir directory of current features
 * @property {object} vars
 * @property {boolean} saveSecrets persist secrets to instance
 *
 */
/**
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {Partial<DeployFeatureOptions>} options
 * @returns {Promise<void>}
 */
export function deployFeature(env: Environment, featureName: string, { featuresDir, vars, saveSecrets }?: Partial<DeployFeatureOptions>): Promise<void>;
/**
 * Remove a feature
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {object} options
 * @param {string} options.featuresDir
 * @param {object} [options.vars]
 * @returns {Promise<void>}
 */
export function removeFeature(env: Environment, featureName: string, { featuresDir, vars }: {
    featuresDir: string;
    vars?: object;
}): Promise<void>;
import { updateFeatureState } from "./features-helpers";
/**
 * These are question objects from the inquirer module. We're only interested in the name
 *
 * @typedef {Object} Question
 * @property {string} name
 */
/**
 * @typedef {Object} Feature
 * @property {string} featureName
 * @property {string[]} requires
 * @property {object} defaultVars
 * @property {string[]} secretVars
 * @property {function?} beforeDeploy
 * @property {function|Question[]} questions
 * @property {string[]} excludeMigrations
 * @property {string[]} excludeCartridges
 * @property {function?} remove
 * @property {function?} finish
 * @property {string} path
 */
export const B2C_TOOLS_FEATURES_VERSION: 3;
declare namespace FEATURE_HELPERS {
    export { deployFeature };
    export { removeFeature };
    export { updateFeatureState };
    export { collectFeatures };
}
import Environment = require("./environment");
export { getInstanceFeatureState, updateFeatureState };
//# sourceMappingURL=features.d.ts.map