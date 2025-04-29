export type FeatureState = {
    featureName: string;
    vars: object;
    creationDate: Date;
    lastModified: Date;
};
export type FeaturesClientState = {
    version: number;
};
export type InstanceFeatureState = {
    b2cToolsFeaturesVersion: number;
    b2cToolsFeaturesBootstrappedClientIDs: {
        [x: string]: FeaturesClientState;
    };
    features: FeatureState[];
};
/**
 * Get the current state of features
 *
 * @param {Environment} env
 * @returns {Promise<InstanceFeatureState|null>}  returns null if instance feature state is blocked
 */
export function getInstanceFeatureState(env: Environment): Promise<InstanceFeatureState | null>;
/**
 * Updates feature state on instance
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {object} vars
 * @param {string[]} secretVars
 * @param {boolean} saveSecrets
 * @returns {Promise<void>}
 */
export function updateFeatureState(env: Environment, featureName: string, vars: object, secretVars: string[], saveSecrets: boolean): Promise<void>;
import Environment = require("./environment");
//# sourceMappingURL=features-helpers.d.ts.map