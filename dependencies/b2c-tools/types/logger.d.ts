export = logger;
/**
 * Default logger. All b2c-tools logs to this logger. The defaults here
 * are for library use.
 *
 * The CLI will re-configure this when executed; Library users
 * should also provide their own configuration to consume logs
 */
declare const logger: winston.Logger;
import winston = require("winston");
//# sourceMappingURL=logger.d.ts.map