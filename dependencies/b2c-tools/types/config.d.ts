export const cli: yargs.Argv<yargs.Omit<yargs.Omit<yargs.Omit<yargs.Omit<yargs.Omit<{
    debug: boolean;
} & {
    "log-level": string;
} & {
    i: unknown;
} & {
    verify: boolean;
} & {
    s: unknown;
} & {
    "short-code": unknown;
} & {
    "secure-server": unknown;
} & {
    certificate: unknown;
} & {
    passphrase: unknown;
} & {
    u: unknown;
} & {
    p: string;
} & {
    "client-id": unknown;
}, "client-id"> & {
    "client-id": string;
} & {
    "client-secret": unknown;
}, "client-secret"> & {
    "client-secret": string;
} & {
    "oauth-scopes": (string | number)[];
} & {
    "mrt-api-key": unknown;
}, "mrt-api-key"> & {
    "mrt-api-key": string;
} & {
    "mrt-credentials-file": string;
}, "mrt-credentials-file"> & {
    "mrt-credentials-file": string;
} & {
    "code-version": unknown;
}, "code-version"> & {
    "code-version": string;
} & {
    cartridge: (string | number)[];
} & {
    "exclude-cartridges": (string | number)[];
} & {
    "use-intellij-connections": boolean;
} & {
    "intellij-project-file": string;
} & {
    "intellij-credentials-file": unknown;
} & {
    "intellij-credentials-key": unknown;
} & {
    config: string;
} & {
    vars: unknown;
} & {
    "vars-file": unknown;
}>;
import yargs = require("yargs");
/**
 * Run's the current nodejs main module (i.e. entry point) as a migration
 * @returns {Promise<void>}
 */
export function runAsScript(): Promise<void>;
/**
 * Parse the environment headlessly (i.e. not via CLI directly) to
 * return the parsed configuration
 *
 * @param {string|string[]} argv arguments in lieu of command line
 * @return {yargs.Arguments}
 */
export function parseConfig(argv?: string | string[]): yargs.Arguments;
//# sourceMappingURL=config.d.ts.map